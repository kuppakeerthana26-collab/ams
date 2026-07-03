import jwt from "jsonwebtoken";
import Teacher from "../models/Teacher.js";
import { env } from "../config/env.js";

export const protect = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      const error = new Error("Authentication token is required");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await Teacher.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      const error = new Error("User account is not active");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    const error = new Error("You do not have permission for this action");
    error.statusCode = 403;
    return next(error);
  }
  next();
};
