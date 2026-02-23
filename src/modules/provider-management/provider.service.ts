import { prisma } from "../../lib/prisma";
import { OrderStatus } from "../../../generated/prisma/client";

interface ProviderProfilePayload {
  restaurantName: string;
  description?: string;
  address?: string;
  phone?: string;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

// ===== Provider Profile  =====
const getProviderById = async (id: string) => {
  const provider = await (prisma.providerProfile as any).findFirst({
    where: {
      OR: [{ id: id }, { userId: id }],
    },
    include: {
      user: true,
      meals: {
        include: {
          category: true,
          reviews: {
            include: {
              customer: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!provider) return null;

  const allReviews =
    provider.meals?.flatMap((meal: any) => meal.reviews || []) || [];
  const totalReviews = allReviews.length;

  const averageRating =
    totalReviews > 0
      ? allReviews.reduce(
          (sum: number, rev: any) => sum + (Number(rev.rating) || 0),
          0,
        ) / totalReviews
      : 0;

  return {
    ...provider,
    address: provider.address || "Location not provided",
    phone: provider.phone || "No contact info",
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews,
    allReviews: allReviews,
  };
};
// ===== Create or Update Profile =====
const createOrUpdateProfile = async (
  userId: string,
  payload: ProviderProfilePayload,
) => {
  return prisma.providerProfile.upsert({
    where: { userId },
    update: payload,
    create: {
      userId,
      ...payload,
    },
  });
};

// ===== Meals =====
const addMeal = async (userId: string, payload: any) => {
  const { name, description, price, categoryName, imageUrl } = payload;

  let category = await prisma.category.findFirst({
    where: { name: { equals: categoryName, mode: "insensitive" } },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: generateSlug(categoryName),
      },
    });
  }

  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!providerProfile) {
    throw new Error("Provider profile not found!");
  }

  return prisma.meal.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      categoryId: category.id,
      providerId: providerProfile.id,
    },
  });
};

const updateMeal = async (id: string, payload: any) => {
  if (payload.price) payload.price = parseFloat(payload.price);
  return prisma.meal.update({ where: { id }, data: payload });
};

const deleteMeal = async (id: string) => {
  return prisma.meal.delete({ where: { id } });
};

const updateOrderStatus = async (id: string, status: string) => {
  return prisma.orders.update({
    where: { id },
    data: { status: status as OrderStatus },
  });
};

export const ProviderService = {
  getProviderById,
  createOrUpdateProfile,
  addMeal,
  updateMeal,
  deleteMeal,
  updateOrderStatus,
};
