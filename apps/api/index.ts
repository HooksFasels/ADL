import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import v1Router from "./src/routes/index";
import { errorHandler } from "./src/middlewares/error.middleware";
import { ApiError } from "./src/utils/ApiError";
import { connectKafka } from "./src/config/kafka";

dotenv.config();
connectKafka();

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(express.json());
app.use(cors());

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", module: "ADL-API" });
});

// API Routes
app.use("/api/v1", v1Router);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Production Server running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/v1`);
});
