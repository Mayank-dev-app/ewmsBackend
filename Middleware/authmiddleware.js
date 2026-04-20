import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const verifyToken = (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // 2. Check Bearer format
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    const token = parts[1];

    // 3. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Attach user data
    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
// Role-based middleware

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user found",
        });
      }

      if (!req.user.role) {
        return res.status(403).json({
          success: false,
          message: "Role missing in token",
        });
      }

      const userRole = req.user.role.trim();

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: Role not allowed",
        });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error in role check",
      });
    }
  };
};


// Only Admin Access
export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin Access Denied",
      });
    }
    next();
  } catch (error) {
    console.error("Verify Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Only Manager Access
export const verifyManager = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "Manager Access Denied",
      });
    }
    next();
  } catch (error) {
    console.error("Verify Manager Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};