import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    mealId: z.string().min(1, "Meal ID is required"),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});