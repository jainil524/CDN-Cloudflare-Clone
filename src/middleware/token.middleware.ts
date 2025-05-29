// /middlewares/token.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyCdnToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.query.token as string;

  if (!token) {
    res.status(401).json({ message: "Missing access token" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).auth = payload;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
