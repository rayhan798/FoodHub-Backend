import { NextFunction, Request, Response, RequestHandler } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../lib/prisma";

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        status: "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED" | "BLOCKED";
        emailVerified: boolean;
        providerProfileId: string | undefined;
      };
    }
  }
}

const authMiddleware = (...roles: UserRole[]): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        res
          .status(401)
          .json({ success: false, message: "Unauthorized! Please login." });
        return;
      }

      const userRole = (session.user as any).role as UserRole;
      let foundProfileId: string | undefined = undefined;

      if (userRole === UserRole.PROVIDER) {
        const profile = await prisma.providerProfile.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        });

        foundProfileId = profile?.id ?? undefined;

        if (!foundProfileId) {
          console.warn(
            `[Auth] Provider profile missing for user: ${session.user.email}`,
          );
        }
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: userRole,
        status: (session.user as any).status,
        emailVerified: session.user.emailVerified,
        providerProfileId: foundProfileId,
      };

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: `Forbidden: You need ${roles.join(" or ")} access`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
};

export const protect: RequestHandler = authMiddleware();

export default authMiddleware;
