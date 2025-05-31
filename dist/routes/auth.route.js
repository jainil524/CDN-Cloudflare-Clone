"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Importing controller
const auth_controller_1 = require("@/controller/auth.controller");
const asyncHandler_1 = __importDefault(require("@/utils/asyncHandler"));
const authRouter = (0, express_1.Router)();
authRouter.post("/login", (0, asyncHandler_1.default)(auth_controller_1.login));
authRouter.post("/register", (0, asyncHandler_1.default)(auth_controller_1.register));
exports.default = authRouter;
