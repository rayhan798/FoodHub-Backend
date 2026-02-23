import express, { Router } from "express";
import { protect } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReview, getMealReviews } from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router: Router = express.Router();

router.post("/", protect, validateRequest(createReviewSchema), createReview);

router.get("/meal/:mealId", getMealReviews);

export const ReviewRoutes = router;
