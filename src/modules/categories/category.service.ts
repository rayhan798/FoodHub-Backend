import { prisma } from "../../lib/prisma";

const generateSlug = (name: string): string => 
  name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

export const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: { meals: true },
      },
    },
    orderBy: { 
      createdAt: 'desc' 
    }
  });

  return result.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    itemCount: cat._count?.meals ?? 0, 
    status: cat.status || "ACTIVE", 
  }));
};

export const createCategoryInDB = async (payload: { name: string; status?: string }) => {
  return await prisma.category.create({
    data: {
      name: payload.name,
      slug: generateSlug(payload.name),
      status: payload.status || "ACTIVE",
    },
  });
};

export const updateCategoryInDB = async (
  id: string, 
  payload: { name?: string; status?: string }
) => {

  const updateData: {
    name?: string;
    status?: string;
    slug?: string;
  } = {};

  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = generateSlug(payload.name);
  }
  
  if (payload.status) {
    updateData.status = payload.status;
  }

  return await prisma.category.update({
    where: { id },
    data: updateData,
  });
};

export const deleteCategoryFromDB = async (id: string) => {
  return await prisma.category.delete({ 
    where: { id } 
  });
};