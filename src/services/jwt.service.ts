import jwt, { JwtPayload } from "jsonwebtoken";
import moment from "moment";
import { Request } from "express"; // Assuming Express is used for request type

let jwtidCounter = 0;
const blacklistSet: Set<string> = new Set();

interface JwtPayloadWithId extends JwtPayload {
  id?: string;
  jti?: string;
}

const JwtService = {
  jwtSign: (_payload: string): string => {
    try {
      if (process.env.SERVER_JWT !== "true") {
        throw new Error("[JWT] Fastify JWT flag is not set");
      }

      console.log("[JWT] Generating fastify JWT sign");

      const payload = {
        id: _payload,
      };

      jwtidCounter += 1;
      return jwt.sign(payload, process.env.SERVER_JWT_SECRET as string, {
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
        jwtid: jwtidCounter.toString(),
      });
    } catch (error) {
      console.error("[JWT] Error during fastify JWT sign", error);
      throw error;
    }
  },

  generateRefreshToken: (payload: object): string => {
    try {
      return jwt.sign(payload, process.env.SERVER_JWT_SECRET as string, { expiresIn: '7d' });
    } catch (error) {
      console.error("[JWT] Error during refresh token generation", error);
      throw error;
    }
  },

  jwtGetToken: (request: Request): string | undefined => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("[JWT] JWT token not provided");
      }

      return authHeader.split(" ")[1]; // Return the token part
    } catch (error) {
      console.error("[JWT] Error getting JWT token", error);
      throw error;
    }
  },

  jwtVerify: (token: string): JwtPayloadWithId | string => {
    try {
      if (process.env.SERVER_JWT !== "true") {
        throw new Error("[JWT] JWT flag is not set");
      }

      return jwt.verify(token, process.env.SERVER_JWT_SECRET as string) as JwtPayloadWithId;
    } catch (error: any) {
      console.error("[JWT] Error verifying JWT token", error);
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      } else {
        throw error;
      }
    }
  },

  jwtBlacklistToken: (token: string): void => {
    try {
      const decoded = jwt.decode(token) as JwtPayloadWithId;
      if (!decoded || !decoded.jti) {
        console.error("[JWT] Token is invalid or does not have a 'jti' claim.");
        throw new Error("Token is invalid or does not have a 'jti' claim.");
      }

      console.log(`[JWT] Adding JWT with id ${decoded.jti} to blacklist`);
      blacklistSet.add(decoded.jti);
    } catch (error) {
      console.error("[JWT] Error blacklisting JWT token", error);
      throw error;
    }
  },

  jwtIsTokenBlacklisted: (token: string): boolean => {
    try {
      const decoded = jwt.decode(token) as JwtPayloadWithId;
      if (!decoded || !decoded.jti) {
        return false;
      }
      return blacklistSet.has(decoded.jti);
    } catch (error) {
      console.error("[JWT] Error checking if token is blacklisted", error);
      return false;
    }
  },

  jwtIsTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded) {
        return true; // Token is invalid, consider expired
      }

      const now = moment().unix();
      return decoded.exp ? decoded.exp < now : true; // Check expiration
    } catch (error) {
      console.error("[JWT] Error checking if token is expired", error);
      return true; // In case of error, consider expired
    }
  },

  extractUserIdFromToken: (req: Request): string | null => {
    const token = req.headers.authorization; // Assuming Bearer token in the "Authorization" header

    if (!token) {
      return null; // Token not provided
    }

    try {
      const tokenWithoutBearer = token.replace("Bearer ", ""); // Remove 'Bearer ' prefix
      const decoded = jwt.verify(tokenWithoutBearer, process.env.SERVER_JWT_SECRET as string) as JwtPayloadWithId;

      return decoded.id || null;
    } catch (error) {
      return null; // Invalid or expired token
    }
  },
};

export default JwtService;
