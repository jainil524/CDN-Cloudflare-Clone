import { Router } from "express";

// Importing controller
import { login, register } from "@/controller/auth.controller";
import asyncHandler from "@/utils/asyncHandler";

const authRouter = Router();

authRouter.post("/login", asyncHandler(login));
authRouter.post("/register", asyncHandler(register));

export default authRouter;
