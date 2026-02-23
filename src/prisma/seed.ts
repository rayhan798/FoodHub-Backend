import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/authMiddleware";


async function seedAdmin() {
  const adminEmail = "admin@foodhub.com";
  const adminPassword = "admin1234";

  try {
    console.log("🚀 Admin seeding started...");

    // 1️⃣ Check DB
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("⚠️ Admin already exists in DB");
      return;
    }

    // 2️⃣ Create admin via Better Auth
    const response = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "http://localhost:3000", 
        },
        body: JSON.stringify({
          name: "Admin",
          email: adminEmail,
          password: adminPassword,
          role: UserRole.ADMIN,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log("✅ Admin created via Better Auth");

    // 3️⃣ Verify email manually
    await prisma.user.update({
      where: { email: adminEmail },
      data: { emailVerified: true },
    });

    console.log("✅ Admin email verified");
    console.log("🎉 Admin seeding completed!");

  } catch (error: any) {
    console.error("❌ Seeding failed:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();

