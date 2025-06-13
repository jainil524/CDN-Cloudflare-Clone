"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
//multer
const multer_middleware_1 = require("@/middleware/multer.middleware");
// Import routes
const cdn_route_1 = __importDefault(require("@/routes/cdn.route"));
const fsm_route_1 = __importDefault(require("@/routes/fsm.route"));
const auth_route_1 = __importDefault(require("@/routes/auth.route"));
// Models and DB
const db_1 = require("@/config/db");
const token_middleware_1 = require("./middleware/token.middleware");
// Load environment variables
dotenv_1.default.config();
// Init Express app
const app = (0, express_1.default)();
// Middleware stack
app.use((0, cors_1.default)({
    origin: "*", // Allow all origins by default, can be restricted
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTION",
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.set("trust proxy", 1); // Trust first proxy for rate limiting
// Rate limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many requests, please try again later.",
    },
});
app.use(limiter);
// DB connection
(0, db_1.connectDB)();
// Route registration
app.use("/cdn", token_middleware_1.verifyCdnToken, cdn_route_1.default);
app.use("/fsm", multer_middleware_1.multerMiddleware, token_middleware_1.verifyCdnToken, fsm_route_1.default);
app.use("/auth", auth_route_1.default);
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        service: process.env.SERVICE_NAME || "FSM/CDN",
        timestamp: new Date().toISOString(),
    });
});
// Root
app.get("/", (req, res) => {
    res.send("Welcome to FSM/CDN Backend");
});
// 404 Handler - must be after all route handlers
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
        statusCode: 404,
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
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
