import { prisma } from "../../lib/prisma";

export const addReview = async (data: {
  mealId: string;
  customerId: string;
  rating: number;
  comment?: string;
}) => {
  return await prisma.review.create({
    data: {
      mealId: data.mealId,
      customerId: data.customerId,
      rating: data.rating,
      comment: data.comment ?? null,
    },
    include: {
      customer: {
        select: { name: true, image: true },
      },
    },
  });
};

export const getReviewsByMealId = async (mealId: string) => {
  return await prisma.review.findMany({
    where: { mealId },
    include: {
      customer: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateMealRating = async (mealId: string) => {
  const stats = await prisma.review.aggregate({
    where: { mealId },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  return await prisma.meal.update({
    where: { id: mealId },
    data: {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.id || 0,
    },
  });
};
