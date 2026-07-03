import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
};

export default generateToken;
