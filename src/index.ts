import 'module-alias/register';
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

//multer
import { multerMiddleware } from "@/middleware/multer.middleware";

// Import routes
import cdn from "@/routes/cdn.route";
import fsm from "@/routes/fsm.route";
import authRouter from "@/routes/auth.route";

// Models and DB
import { connectDB } from "@/config/db";
import { verifyCdnToken } from "./middleware/token.middleware";

// Load environment variables
dotenv.config();

// Init Express app
const app = express();

// Middleware stack
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.set("trust proxy", 1); // Trust first proxy for rate limiting

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// DB connection
connectDB();


// Route registration
app.use("/cdn", verifyCdnToken ,cdn);
app.use("/fsm", multerMiddleware ,verifyCdnToken , fsm);
app.use("/auth",authRouter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    service: process.env.SERVICE_NAME || "FSM/CDN",
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to FSM/CDN Backend");
});

// 404 Handler - must be after all route handlers
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR]", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
