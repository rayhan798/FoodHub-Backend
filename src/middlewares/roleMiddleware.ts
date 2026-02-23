import { Request, Response, NextFunction } from "express";
import { UserRole } from "./authMiddleware";


const roleMiddleware =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    //  authMiddleware missing
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    //  role not allowed
    if (
      allowedRoles.length &&
      !allowedRoles.includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to access this resource",
      });
    }

    next();
  };

export default roleMiddleware;
