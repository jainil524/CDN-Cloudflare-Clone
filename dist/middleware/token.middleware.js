"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCdnToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Crypto_1 = require("@/utils/Crypto");
const verifyCdnToken = (req, res, next) => {
    let token = req.query.token;
    if (!token) {
        res.status(401).json({ message: "Missing access token" });
        return;
    }
    try {
        // Decrypt the token
        token = Crypto_1.CryptoUtil.decrypt(token);
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.auth = payload;
        next();
    }
    catch (err) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
    }
};
exports.verifyCdnToken = verifyCdnToken;
