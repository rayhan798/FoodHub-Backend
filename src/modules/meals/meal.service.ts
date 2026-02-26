import { Prisma, UserStatus } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

const createMealIntoDB = async (payload: any) => {
  console.log("📥 Service Received Payload:", JSON.stringify(payload, null, 2));

  const { name, price, description, imageUrl, image, category, providerId } = payload;

  if (!name || !category) {
    throw new Error("Missing required fields: name or category is undefined.");
  }

  const finalProviderId = providerId;
  const cleanImageUrl = imageUrl || image || "";

  try {
    console.log("🚀 Attempting to create meal in DB...");
    
    const result = await prisma.meal.create({
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
            // এখানে ভুল ছিল। User মডেলে সাধারণত image থাকে, imageUrl নয়।
            // আপনার এরর অনুযায়ী ProviderProfile এ imageUrl নেই।
            user: { 
              select: { 
                name: true,
                image: true // এখানে আপনার স্কিমা অনুযায়ী 'image' ব্যবহার করুন
              } 
            },
          },
        },
      },
    });

    console.log("✅ Meal Created Successfully in DB!");
    return result;

  } catch (error: any) {
    console.error("❌ Prisma Error in createMealIntoDB:");
    console.dir(error, { depth: null }); 

    // ডাটাবেস কলামের সমস্যা হলে এই এররটি হ্যান্ডেল করবে
    if (error.code === 'P2022') {
       throw new Error("Database schema mismatch: A required column is missing in the database. Run 'npx prisma db push'.");
    }
    
    throw new Error(error.message || "Failed to create meal into database");
  }
};

const getAllMealsFromDB = async (query: Record<string, any>) => {
  try {
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
  } catch (error) {
    console.error("❌ Error in getAllMealsFromDB:", error);
    throw error;
  }
};

const getMealDetailsFromDB = async (id: string) => {
  try {
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
  } catch (error) {
    console.error(`❌ Error fetching meal details for ID ${id}:`, error);
    throw error;
  }
};

const updateMealInDB = async (id: string, payload: any) => {
  try {
    const { category, imageUrl, image, ...updateData } = payload;

    if (updateData.price) updateData.price = Number(updateData.price);
    const cleanImageUrl = imageUrl || image;

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
                status: "APPROVED", 
              },
            },
          },
        }),
      },
      include: {
        category: true,
      },
    });
  } catch (error) {
    console.error(`❌ Error updating meal ID ${id}:`, error);
    throw error;
  }
};

const deleteMealFromDB = async (id: string) => {
  try {
    return await prisma.meal.delete({
      where: { id },
    });
  } catch (error) {
    console.error(`❌ Error deleting meal ID ${id}:`, error);
    throw error;
  }
};

export const MealService = {
  createMealIntoDB,
  getAllMealsFromDB,
  getMealDetailsFromDB,
  updateMealInDB,
  deleteMealFromDB,
};