import { Prisma, UserStatus } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

const createMealIntoDB = async (payload: any) => {
  const { name, price, description, imageUrl, image, category, providerId } =
    payload;

  if (!name || !category) {
    throw new Error("Missing required fields: name or category is undefined.");
  }

  const finalProviderId = providerId || "1";

  const rawPath = imageUrl || image || "";
  const cleanImageUrl =
    typeof rawPath === "string" ? rawPath.replace(/\\/g, "/") : "";

  try {
    return await prisma.meal.create({
      data: {
        name,
        price: Number(price) || 0,
        description: description || "",
        imageUrl: cleanImageUrl,
        category: {
          connectOrCreate: {
            where: { name: category },
            create: {
              name: category,
              slug: generateSlug(category),
              status: "APPROVED",
            },
          },
        },
        provider: {
          connect: { id: finalProviderId },
        },
      },
      include: {
        category: true,
        provider: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error(`Provider with ID ${finalProviderId} does not exist.`);
    }
    throw new Error(error.message || "Failed to create meal");
  }
};

const getAllMealsFromDB = async (query: Record<string, any>) => {
  const searchTerm = query.search as string | undefined;
  const category = query.category as string | undefined;
  const { minPrice, maxPrice } = query;

  const andFilters: Prisma.MealWhereInput[] = [
    {
      provider: {
        user: {
          status: UserStatus.APPROVED,
        },
      },
    },
  ];

  if (searchTerm) {
    andFilters.push({ name: { contains: searchTerm, mode: "insensitive" } });
  }

  if (category) {
    andFilters.push({ category: { name: { equals: category } } });
  }

  if (minPrice) andFilters.push({ price: { gte: Number(minPrice) } });
  if (maxPrice) andFilters.push({ price: { lte: Number(maxPrice) } });

  return await prisma.meal.findMany({
    where: {
      AND: andFilters,
    },
    include: {
      provider: {
        select: {
          id: true,
          restaurantName: true,
          user: { select: { name: true, status: true } },
        },
      },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getMealDetailsFromDB = async (id: string) => {
  return await prisma.meal.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          restaurantName: true,
          user: { select: { name: true, image: true, status: true } },
        },
      },
      category: true,
      reviews: {
        include: {
          customer: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};

const updateMealInDB = async (id: string, payload: any) => {
  const { category, imageUrl, image, ...updateData } = payload;

  if (updateData.price) updateData.price = Number(updateData.price);

  const rawPath = imageUrl || image;
  let cleanImageUrl;
  if (rawPath && typeof rawPath === "string") {
    cleanImageUrl = rawPath.replace(/\\/g, "/");
  }

  return await prisma.meal.update({
    where: { id },
    data: {
      ...updateData,
      ...(cleanImageUrl && { imageUrl: cleanImageUrl }),
      ...(category && {
        category: {
          connectOrCreate: {
            where: { name: category },
            create: {
              name: category,
              slug: generateSlug(category),
              status: "ACTIVE",
            },
          },
        },
      }),
    },
    include: {
      category: true,
    },
  });
};

const deleteMealFromDB = async (id: string) => {
  return await prisma.meal.delete({
    where: { id },
  });
};

export const MealService = {
  createMealIntoDB,
  getAllMealsFromDB,
  getMealDetailsFromDB,
  updateMealInDB,
  deleteMealFromDB,
};
