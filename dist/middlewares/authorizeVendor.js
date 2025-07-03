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
Object.defineProperty(exports, "__esModule", { value: true });
// Middleware to authorize based on account type
const authorizeVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the user is authenticated and has an account type
    const user = req.user;
    // Check if the user is authenticated and has an account type
    if (!user) {
        res.status(401).json({
            message: "Unauthorized. No user or account type found.",
        });
        return;
    }
    // Check if the account type is 'Vendor'
    if (user.accountType !== 'Vendor') {
        res.status(403).json({ message: 'Access forbidden: Vendor only.' });
        return;
    }
    // If account type matches, proceed to the next middleware or controller
    next();
});
exports.default = authorizeVendor;
//# sourceMappingURL=authorizeVendor.js.map