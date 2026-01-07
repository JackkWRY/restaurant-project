/**
 * @file Server Entry Point
 * @description Main application server with Express and Socket.IO
 *
 * This module provides:
 * - Express application setup
 * - Socket.IO server with dual namespaces
 * - Security middleware (Helmet, Rate Limiting, CORS)
 * - Route registration
 * - Error handling
 *
 * Socket.IO Namespaces:
 * - /authenticated - For staff, kitchen, and admin (requires JWT)
 * - /public - For customers (no authentication)
 *
 * Middleware Stack:
 * - Helmet (security headers)
 * - Rate limiting
 * - Compression
 * - CORS
 * - Request logging
 *
 * @module server
 * @requires express
 * @requires socket.io
 * @requires helmet
 * @requires express-rate-limit
 * @requires compression
 * @requires jsonwebtoken
 *
 * @see {@link config} for configuration
 * @see {@link routes} for API routes
 */

import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import jwt from "jsonwebtoken";

import authRoutes from "./api/routes/authRoutes.js";
import settingRoutes from "./api/routes/settingRoutes.js";
import menuRoutes from "./api/routes/menuRoutes.js";
import orderRoutes from "./api/routes/orderRoutes.js";
import tableRoutes from "./api/routes/tableRoutes.js";
import categoryRoutes from "./api/routes/categoryRoutes.js";
import uploadRoutes from "./api/routes/uploadRoutes.js";
import analyticsRoutes from "./api/routes/analyticsRoutes.js";
import billRoutes from "./api/routes/billRoutes.js";
import logger from "./core/config/logger.js";
import { requestLogger } from "./core/middlewares/requestLogger.js";
import config, {
  PORT,
  CORS_CONFIG,
  RATE_LIMIT_CONFIG,
  SOCKET_CONFIG,
  JWT_CONFIG,
} from "./core/config/index.js";

dotenv.config();

// Environment variables are validated automatically when importing from config/env.ts
// No need to call validateConfig() anymore

const app = express();
const httpServer = createServer(app);

// ============================================
// Socket.IO Setup with Dual Namespaces
// ============================================

/**
 * Socket.IO server instance
 * Configured with CORS settings from config
 */
const io = new Server(httpServer, SOCKET_CONFIG);

// ============================================
// Namespace 1: /authenticated (Staff, Kitchen, Admin)
// ============================================
const authenticatedNamespace = io.of("/authenticated");

authenticatedNamespace.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    logger.warn("Authenticated socket connection attempt without token", {
      socketId: socket.id,
    });
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const secret = JWT_CONFIG.accessTokenSecret;
    if (!secret) {
      logger.error("JWT_SECRET not configured for Socket.IO");
      return next(new Error("Server configuration error"));
    }

    const decoded = jwt.verify(token, secret) as {
      userId: number;
      role: string;
    };
    socket.data.user = decoded;

    logger.debug("Authenticated socket connected", {
      socketId: socket.id,
      userId: decoded.userId,
      role: decoded.role,
    });

    next();
  } catch (err) {
    logger.warn("Socket authentication failed", {
      socketId: socket.id,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return next(new Error("Authentication error: Invalid token"));
  }
});

// ============================================
// Namespace 2: /public (Customers - No Auth Required)
// ============================================
const publicNamespace = io.of("/public");

// ============================================
// Express Middleware Configuration
// ============================================

// Security Middleware - Helmet for HTTP headers protection
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.maxRequests,
  message: RATE_LIMIT_CONFIG.message,
});
app.use(limiter);

// Response Compression - Reduces response size by 60-70%
app.use(compression());

// CORS Configuration - Allow cross-origin requests from frontend
app.use(
  cors({
    origin: CORS_CONFIG.origins,
    credentials: CORS_CONFIG.credentials,
  })
);

// Body Parser - Parse JSON request bodies
app.use(express.json());

// Request Logging - Log all incoming requests
app.use(requestLogger);

// Socket.IO Integration - Attach Socket.IO instances to Express app
app.set("io", io);
app.set("authenticatedNamespace", authenticatedNamespace);
app.set("publicNamespace", publicNamespace);

// ============================================
// Authenticated Namespace Connection Handler
// ============================================
authenticatedNamespace.on("connection", (socket) => {
  const user = socket.data.user;

  logger.info("Authenticated user connected via Socket.IO", {
    socketId: socket.id,
    userId: user.userId,
    role: user.role,
  });

  // Join role-based rooms for targeted broadcasting
  if (user.role === "ADMIN" || user.role === "STAFF") {
    socket.join("staff-room");
    logger.debug("User joined staff-room", { userId: user.userId });
  }

  if (user.role === "KITCHEN") {
    socket.join("kitchen-room");
    logger.debug("User joined kitchen-room", { userId: user.userId });
  }

  socket.on("disconnect", () => {
    logger.info("Authenticated user disconnected", {
      socketId: socket.id,
      userId: user.userId,
      role: user.role,
    });
  });
});

// ============================================
// Public Namespace Connection Handler
// ============================================
publicNamespace.on("connection", (socket) => {
  logger.info("Public user connected via Socket.IO", {
    socketId: socket.id,
  });

  // Allow customers to join table-specific rooms
  socket.on("join_table", (tableId: number) => {
    const roomName = `table-${tableId}`;
    socket.join(roomName);
    logger.debug("Customer joined table room", {
      socketId: socket.id,
      tableId,
      roomName,
    });
  });

  socket.on("leave_table", (tableId: number) => {
    const roomName = `table-${tableId}`;
    socket.leave(roomName);
    logger.debug("Customer left table room", {
      socketId: socket.id,
      tableId,
      roomName,
    });
  });

  socket.on("disconnect", () => {
    logger.info("Public user disconnected", {
      socketId: socket.id,
    });
  });
});

// ============================================
// API Routes Registration
// ============================================

/**
 * API Version 1 Router
 * 
 * All API routes are now versioned under /api/v1/*
 * This allows for future API changes without breaking existing clients.
 */
import { Router } from 'express';
import { deprecationWarningMiddleware } from './core/middlewares/deprecationMiddleware.js';

const v1Router = Router();

// Register all routes to v1 router
v1Router.use(authRoutes);
v1Router.use(settingRoutes);
v1Router.use(menuRoutes);
v1Router.use(orderRoutes);
v1Router.use(tableRoutes);
v1Router.use(categoryRoutes);
v1Router.use(billRoutes);

// Mount versioned routes
app.use('/api/v1', v1Router);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ============================================
// Deprecated Routes (Backward Compatibility)
// ============================================
// These routes redirect to v1 for backward compatibility
// They will be removed in a future version
// TODO: Remove after migration period (recommended: 3-6 months)

app.use('/api', deprecationWarningMiddleware, v1Router);
app.use('/api/upload', deprecationWarningMiddleware, uploadRoutes);
app.use('/api/analytics', deprecationWarningMiddleware, analyticsRoutes);

// ============================================
// Health Check Endpoint
// ============================================
app.get("/", (req: Request, res: Response) => {
  res.send(
    `<h1>Restaurant API Running! 🚀</h1><p>Allowed Origins: ${CORS_CONFIG.origins.join(
      ", "
    )}</p>`
  );
});

// ============================================
// Error Handler (Must be last!)
// ============================================
import { errorHandler } from "./core/middlewares/errorHandler.js";
app.use(errorHandler);

// ============================================
// Start HTTP Server with Socket.IO
// ============================================
httpServer.listen(PORT, "0.0.0.0", () => {
  logger.info(`Backend running on port ${PORT}`, {
    port: PORT,
    allowedOrigins: CORS_CONFIG.origins,
    environment: config.env,
  });
});
