import { Router } from "express";
import { OrderController } from "./orders.controller";
import authMiddleware, {
  protect,
  UserRole,
} from "../../middlewares/authMiddleware";

const router: Router = Router();

router.post(
  "/",
  protect,
  authMiddleware(UserRole.CUSTOMER),
  OrderController.createOrder,
);

router.get("/", protect, OrderController.getUserOrders);

router.get("/:id", protect, OrderController.getOrderDetails);

router.patch(
  "/:id/status",
  protect,
  authMiddleware(UserRole.ADMIN, UserRole.PROVIDER),
  OrderController.updateOrderStatus,
);

router.patch(
  "/:id",
  protect,
  authMiddleware(UserRole.ADMIN, UserRole.PROVIDER),
  OrderController.updateOrderStatus,
);

export const OrderRoutes = router;
