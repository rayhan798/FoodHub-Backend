import { Router } from "express";
import { MealController } from "./meal.controller";
import authMiddleware, { UserRole } from "../../middlewares/authMiddleware";
import { upload } from "../../middlewares/multer";

const router: Router = Router();

router.get("/", MealController.getAllMeals);

router.get("/:id", MealController.getMealDetails);

router.post(
  "/",
  authMiddleware(UserRole.PROVIDER),
  upload.single("image"),
  MealController.createMeal,
);

router.patch(
  "/:id",
  authMiddleware(UserRole.PROVIDER),
  upload.single("image"),
  MealController.updateMeal,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.PROVIDER),
  MealController.deleteMeal,
);

export const MealRoutes = router;
