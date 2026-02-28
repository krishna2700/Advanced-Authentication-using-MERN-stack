import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Check cookie first, then Authorization header
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
  }
};
