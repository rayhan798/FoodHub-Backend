import { Router } from "express";
import { ProviderController } from "./provider.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";
import { upload } from "../../config/cloudinary"; 

const router: Router = Router();

router.get("/:id", ProviderController.getProviderById); 

// ===== Provider Profile (Authenticated) =====
router.post(
  "/profile", 
  authMiddleware(UserRole.PROVIDER), 
  upload.single("image"),
  ProviderController.createOrUpdateProfile
);

router.put(
  "/profile", 
  authMiddleware(UserRole.PROVIDER), 
  upload.single("image"), 
  ProviderController.createOrUpdateProfile
);

// ===== Meals (Authenticated) =====
router.post(
  "/meals", 
  authMiddleware(UserRole.PROVIDER), 
  upload.single("image"), 
  ProviderController.addMeal
);

router.put(
  "/meals/:id", 
  authMiddleware(UserRole.PROVIDER), 
  upload.single("image"),
  ProviderController.updateMeal
);

router.delete("/meals/:id", authMiddleware(UserRole.PROVIDER), ProviderController.deleteMeal);

// ===== Orders (Authenticated) =====
router.patch("/orders/:id", authMiddleware(UserRole.PROVIDER), ProviderController.updateOrderStatus);

export const ProviderRoutes = router;