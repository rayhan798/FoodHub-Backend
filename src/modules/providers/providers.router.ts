import { Router } from "express";
import { ProviderController } from "./providers.controller";
import { protect } from "../../middlewares/authMiddleware"; 

const router: Router = Router();

router.get("/", ProviderController.getAllProviders);

router.patch("/profile", protect, ProviderController.updateProviderProfile);

router.get("/:id", ProviderController.getProviderWithMenu);

router.get("/meals/:id", ProviderController.getMealDetails);

export const ProviderRoutes = router;