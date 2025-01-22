"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_facebook_1 = require("passport-facebook");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_1 = __importDefault(require("../models/user")); // Your User Sequelize model
// Facebook Strategy
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Type guard for profile.emails
        if (!profile.emails || profile.emails.length === 0) {
            return done(new Error('No email found for this user.'), null);
        }
        const email = profile.emails[0].value; // Use the value property
        const existingUser = yield user_1.default.findOne({ where: { email } });
        if (existingUser) {
            return done(null, existingUser);
        }
        // Create a new user if they don't exist
        const newUser = yield user_1.default.create({
            email,
            firstName: (_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName,
            lastName: (_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName,
            facebookId: profile.id // Save Facebook ID to associate with the user
        });
        return done(null, newUser);
    }
    catch (error) {
        return done(error, null);
    }
})));
// Google Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, (token, tokenSecret, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        // Type guard for profile.emails
        if (!profile.emails || profile.emails.length === 0) {
            return done(new Error('No email found for this user.'));
        }
        const email = profile.emails[0].value; // Use the value property
        const existingUser = yield user_1.default.findOne({ where: { email } });
        if (existingUser) {
            return done(null, existingUser);
        }
        // Create a new user if they don't exist
        const newUser = yield user_1.default.create({
            email,
            firstName: (_c = profile.name) === null || _c === void 0 ? void 0 : _c.givenName,
            lastName: (_d = profile.name) === null || _d === void 0 ? void 0 : _d.familyName,
            googleId: profile.id // Save Google ID to associate with the user
        });
        return done(null, newUser);
    }
    catch (error) {
        return done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findByPk(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
}));
//# sourceMappingURL=passportConfig.js.map