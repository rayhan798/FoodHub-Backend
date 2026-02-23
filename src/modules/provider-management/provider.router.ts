import { Router } from "express";
import { ProviderController } from "./provider.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";

const router: Router = Router();

router.get("/:id", ProviderController.getProviderById); 

// ===== Provider Profile  =====
router.post("/profile", authMiddleware(UserRole.PROVIDER), ProviderController.createOrUpdateProfile);
router.put("/profile", authMiddleware(UserRole.PROVIDER), ProviderController.createOrUpdateProfile);

// ===== Meals =====
router.post("/meals", authMiddleware(UserRole.PROVIDER), ProviderController.addMeal);
router.put("/meals/:id", authMiddleware(UserRole.PROVIDER), ProviderController.updateMeal);
router.delete("/meals/:id", authMiddleware(UserRole.PROVIDER), ProviderController.deleteMeal);

// ===== Orders =====
router.patch("/orders/:id", authMiddleware(UserRole.PROVIDER), ProviderController.updateOrderStatus);

export const ProviderRoutes = router;