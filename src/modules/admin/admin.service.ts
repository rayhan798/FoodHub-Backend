import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../prisma/generated/prisma/client";

export const getAdminDashboardStatsFromDB = async () => {
  const revenueData = await prisma.orders.aggregate({
    where: { status: "DELIVERED" },
    _sum: { totalPrice: true },
  });

  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  const totalProviders = await prisma.providerProfile.count();
  const totalOrders = await prisma.orders.count();

  return [
    {
      label: "Total Revenue",
      value: `$${(revenueData._sum.totalPrice || 0).toLocaleString()}`,
      trend: "+18%",
      trendUp: true,
      color: "text-emerald-600",
    },
    {
      label: "Active Customers",
      value: totalCustomers.toLocaleString(),
      trend: "+12%",
      trendUp: true,
      color: "text-blue-600",
    },
    {
      label: "Food Providers",
      value: totalProviders.toLocaleString(),
      trend: "+4%",
      trendUp: true,
      color: "text-orange-600",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      trend: "-2%",
      trendUp: false,
      color: "text-purple-600",
    },
  ];
};

export const getPendingProviderRequestsFromDB = async () => {
  const providers = await prisma.providerProfile.findMany({
    where: {
      user: {
        status: UserStatus.PENDING,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return providers.map((p) => ({
    id: p.id,
    name: p.restaurantName,
    owner: p.user?.name || "Unknown",
    status: p.user?.status || UserStatus.PENDING,
    date: new Date(p.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));
};

export const updateProviderStatusInDB = async (
  providerProfileId: string,
  newStatus: UserStatus,
) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerProfileId },
    select: { userId: true },
  });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  return await prisma.user.update({
    where: { id: provider.userId },
    data: {
      status: newStatus,
      isActive: newStatus === UserStatus.APPROVED,
    },
  });
};

export const getAllUsersFromDB = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateUserStatusInDB = async (id: string, status: UserStatus) => {
  return await prisma.user.update({
    where: { id },
    data: {
      status: status,
      isActive: status === UserStatus.APPROVED,
    },
  });
};
