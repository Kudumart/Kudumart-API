import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user'; // Your User Sequelize model
import JwtService from "../services/jwt.service";

const generateUniquePhoneNumber = async () => {
  let phoneNumber;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 10-digit number (US-style format)
    phoneNumber = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // Check if this phone number already exists in the database
    const existingUser = await User.findOne({ where: { phoneNumber } });

    if (!existingUser) {
      isUnique = true;
    }
  }

  return phoneNumber;
};

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name']
},
  async (jwaccessToken, refreshToken, profile, done) => {
    try {
      // Type guard for profile.emails
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error('No email found for this user.'), null);
      }

      const email = profile.emails?.[0]?.value; // Use the value property
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return done(null, existingUser);
      }

      // Create a new user if they don't exist
      const newUser = await User.create({
        email,
        firstName: profile.name?.givenName, // Optional chaining
        lastName: profile.name?.familyName, // Optional chaining
        accountType: "Customer",
        password: await generateUniquePhoneNumber(),
        phoneNumber: await generateUniquePhoneNumber(),  // ✅ Generate unique phone number
        facebookId: profile.id ?? "Facebook", // Save Facebook ID to associate with the user
        email_verified_at: new Date()
      });

      // Generate token
      const token = JwtService.jwtSign(newUser.id);

      return done(null, { newUser, token });
    } catch (error) {
      return done(error, null);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true, // To access 'req' in the callback
},
  async (req, token, tokenSecret, profile, done) => {
    try {
      // Extract the account type passed as 'state'
      const accountType = req.query.state as string;

      if (!accountType || !["Customer", "Vendor"].includes(accountType)) {
        return done(new Error("Invalid account type."));
      }

      // Type guard for profile.emails
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error("No email found for this user."));
      }

      const email = profile.emails[0].value; // Use the value property

      // Check if the user exists in the database with the given email and accountType
      const existingUser = await User.findOne({ where: { email, accountType } });

      if (existingUser) {
        return done(null, existingUser);
      }

      // Create a new user if they don't exist
      const newUser = await User.create({
        email,
        firstName: profile.name?.givenName, // Optional chaining
        lastName: profile.name?.familyName, // Optional chaining
        accountType, // Save accountType (Customer or Vendor)
        password: await generateUniquePhoneNumber(), // Generate unique phone number
        phoneNumber: await generateUniquePhoneNumber(), // Generate unique phone number
        googleId: profile.id, // Save Google ID to associate with the user
        email_verified_at: new Date(),
      });

      // Generate JWT token for the user
      const token = JwtService.jwtSign(newUser.id);

      return done(null, { newUser, token });
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
