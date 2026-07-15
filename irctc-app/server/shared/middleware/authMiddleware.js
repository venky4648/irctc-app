import jwt from "jsonwebtoken";
import UserRepository from "../../domains/auth/repositories/UserRepository.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: "Not authorized, user not found" });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ success: false, message: "Not authorized, no token" });
};

export const isAdmin = (req, res, next) => {
  // In our new schema, roles are handled via role_id. 
  // For compatibility with frontend sending role string:
  if (req.user && (req.user.role === "admin" || req.user.role === "ADMIN" || req.user.role_id)) { 
    next();
  } else {
    res.status(403).json({ success: false, message: "Not authorized as an admin", debugUser: req.user });
  }
};

export default protect;
