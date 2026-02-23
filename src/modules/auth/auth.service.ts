import { prisma } from "../../lib/prisma";
import { hashPassword } from "better-auth/crypto";
import {
  User,
  ProviderProfile,
  UserStatus,
} from "../../../prisma/generated/prisma/client";

interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CUSTOMER" | "PROVIDER";
  restaurantName?: string;
  address?: string;
  phone?: string;
}

interface SignUpResponse {
  user: User;
  profile: ProviderProfile | null;
}

const signUpIntoDB = async (
  payload: SignUpPayload,
): Promise<SignUpResponse> => {
  const { name, email, password, role, restaurantName, address, phone } =
    payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered!");

  const hashedPassword = await hashPassword(password);

  return await prisma.$transaction(async (tx) => {
    const isProvider = role === "PROVIDER";

    const user = await tx.user.create({
      data: {
        name,
        email,
        role,
        phone: phone ?? null,
        emailVerified: true,
        status: isProvider ? UserStatus.PENDING : UserStatus.APPROVED,
        isActive: !isProvider,
      },
    });

    await tx.account.create({
      data: {
        userId: user.id,
        accountId: email,
        providerId: "credential",
        password: hashedPassword,
      },
    });

    let profile: ProviderProfile | null = null;
    if (isProvider && restaurantName) {
      profile = await tx.providerProfile.create({
        data: {
          userId: user.id,
          restaurantName,
          address: address ?? null,
          phone: phone ?? null,
        },
      });
    }

    return { user, profile };
  });
};

export const AuthService = {
  signUpIntoDB,
};
