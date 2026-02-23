import { Request, Response } from "express";
import * as ReviewService from "./review.service";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { mealId, rating, comment } = req.body;

    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Session expired or user not logged in.",
      });
    }

    if (req.user?.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: `Your account status is ${req.user?.status || "PENDING"}. It must be ACTIVE to post reviews.`,
      });
    }
    const review = await ReviewService.addReview({
      mealId,
      customerId,
      rating: Number(rating),
      comment: comment?.trim() || null,
    });

    try {
      await ReviewService.updateMealRating(mealId);
    } catch (err) {
      console.error("Rating Update Error:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error: any) {
    console.error("Review Create Error:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message || "Something went wrong while saving your review.",
    });
  }
};

export const getMealReviews = async (req: Request, res: Response) => {
  try {
    const { mealId } = req.params;

    if (!mealId) {
      return res.status(400).json({
        success: false,
        message: "Meal ID is required to fetch reviews.",
      });
    }

    const reviews = await ReviewService.getReviewsByMealId(mealId as string);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error: any) {
    console.error("Fetch Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews.",
    });
  }
};
