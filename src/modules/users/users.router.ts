import { Router } from "express";
import { UserController } from "./users.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router: Router = Router();

router.get("/", authMiddleware(UserRole.ADMIN), UserController.getAllUsers);

router.get(
  "/me",
  authMiddleware(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PROVIDER),
  UserController.getMyProfile,
);

router.patch(
  "/:id/status",
  authMiddleware(UserRole.ADMIN),
  UserController.toggleUserStatus,
);

export const UserRoutes = router;

export default router;
