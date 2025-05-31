"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGO_URI, {
            dbName: "fsmdb",
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (err) {
        console.error("MongoDB connection failed", err);
        process.exit(1); // Exit on failure
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log("MongoDB disconnected");
    }
    catch (err) {
        console.error("MongoDB disconnection failed", err);
    }
};
exports.disconnectDB = disconnectDB;
