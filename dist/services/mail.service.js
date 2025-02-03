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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: ((_a = process.env.MAIL_ENCRYPTION) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'ssl', // true for SSL/TLS
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});
transporter.verify()
    .then(() => console.log("Connected to email server"))
    .catch((err) => console.error("Unable to connect to email server:", err.message));
const sendMail = (email_1, subject_1, message_1, ...args_1) => __awaiter(void 0, [email_1, subject_1, message_1, ...args_1], void 0, function* (email, subject, message, files = []) {
    try {
        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: email,
            subject: subject,
            text: "IWTYS LTD",
            html: message,
            attachments: files,
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        return info;
    }
    catch (error) {
        console.error("Error sending mail:", error.message);
        throw error;
    }
});
exports.sendMail = sendMail;
//# sourceMappingURL=mail.service.js.map