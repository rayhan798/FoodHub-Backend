import { prisma } from "../../lib/prisma";

const getAllProvidersFromDB = async () => {
  return await prisma.providerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          status: true,
        },
      },
    },
  });
};

const getProviderWithMenuFromDB = async (id: string) => {
  const cleanId = id.trim();

  let provider = await prisma.providerProfile.findUnique({
    where: { id: cleanId },
    include: {
      user: true,
      meals: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!provider) {
    provider = await prisma.providerProfile.findFirst({
      where: { userId: cleanId },
      include: {
        user: true,
        meals: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  return provider || null;
};

const updateProviderProfileInDB = async (
  userId: string,
  data: { 
    address?: string; 
    phone?: string; 
    description?: string; 
    image?: string 
  },
) => {
  return await prisma.providerProfile.update({
    where: {
      userId: userId,
    },
    data: {
      address: data.address ?? null,
      phone: data.phone ?? null,
      description: data.description ?? null,
      imageUrl: data.image ?? null, 
    },
  });
};

export const ProviderService = {
  getAllProvidersFromDB,
  getProviderWithMenuFromDB,
  updateProviderProfileInDB,
};