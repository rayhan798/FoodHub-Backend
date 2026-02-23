import { prisma } from "../../lib/prisma";

class UsersService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async toggleUserStatus(userId: string, newStatus?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let nextStatus = newStatus;
    if (!nextStatus) {
      nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        status: nextStatus as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    return user;
  }
}

const usersService = new UsersService();
export default usersService;
