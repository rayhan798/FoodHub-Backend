import { prisma } from "../../lib/prisma";

const createOrderIntoDB = async (
  userId: string,
  orderData: { mealId: string; quantity: number; address: string },
) => {
  const meal = await prisma.meal.findUnique({
    where: { id: orderData.mealId },
    include: { provider: true },
  });

  if (!meal) {
    throw new Error("Target meal not found in database.");
  }

  const qty = Number(orderData.quantity);
  if (isNaN(qty) || qty <= 0) {
    throw new Error("Invalid quantity provided.");
  }

  const totalAmount = parseFloat((meal.price * qty).toFixed(2));

  return await prisma.$transaction(async (tx) => {
    const newOrder = await tx.orders.create({
      data: {
        customer: {
          connect: { id: userId },
        },
        totalPrice: totalAmount,
        deliveryAddress: orderData.address,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "CASH_ON_DELIVERY",
        orderItems: {
          create: [
            {
              quantity: qty,
              price: meal.price,
              meal: {
                connect: { id: orderData.mealId },
              },
            },
          ],
        },
      },
      include: {
        orderItems: {
          include: {
            meal: {
              include: { provider: true },
            },
          },
        },
      },
    });

    return newOrder;
  });
};

const getUserOrdersFromDB = async (userId: string) => {
  return await prisma.orders.findMany({
    where: {
      customerId: userId,
    },
    include: {
      orderItems: {
        include: {
          meal: {
            include: { provider: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllOrdersFromDB = async () => {
  return await prisma.orders.findMany({
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          meal: {
            include: {
              provider: {
                include: {
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getProviderOrdersFromDB = async (providerUserId: string) => {
  return await prisma.orders.findMany({
    where: {
      orderItems: {
        some: {
          meal: {
            provider: {
              userId: providerUserId,
            },
          },
        },
      },
    },
    include: {
      customer: { select: { name: true, email: true } },
      orderItems: {
        include: { meal: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getOrderDetailsFromDB = async (orderId: string) => {
  if (!orderId || orderId === "success") return null;

  return await prisma.orders.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderItems: {
        include: {
          meal: {
            include: { provider: true },
          },
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

const updateOrderStatusInDB = async (orderId: string, status: string) => {
  return await prisma.orders.update({
    where: {
      id: orderId,
    },
    data: {
      status: status as any,
    },
  });
};

export const OrderService = {
  createOrderIntoDB,
  getUserOrdersFromDB,
  getAllOrdersFromDB,
  getProviderOrdersFromDB,
  getOrderDetailsFromDB,
  updateOrderStatusInDB,
};
