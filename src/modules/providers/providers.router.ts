import { Router } from "express";
import { ProviderController } from "./providers.controller";
import { protect } from "../../middlewares/authMiddleware"; 
import { upload } from "../../config/cloudinary"; 

const router: Router = Router();

router.get("/", ProviderController.getAllProviders);

router.patch(
  "/profile", 
  protect, 
  upload.single("image"),
  ProviderController.updateProviderProfile
);

router.get("/:id", ProviderController.getProviderWithMenu);

router.get("/meals/:id", ProviderController.getMealDetails);

export const ProviderRoutes = router;