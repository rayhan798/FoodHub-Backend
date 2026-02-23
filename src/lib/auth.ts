import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role } from "../../generated/prisma/enums";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          let finalStatus = "ACTIVE";

          if (user.role === "PROVIDER") {
            finalStatus = "PENDING";
          }

          return {
            data: {
              ...user,
              status: finalStatus,
            },
          };
        },

        after: async (user) => {
          if (user.role === "PROVIDER") {
            try {
              await prisma.providerProfile.create({
                data: {
                  userId: user.id,
                  restaurantName: `${user.name || "New"}'s Kitchen`,
                  description: "Welcome to our kitchen!",
                },
              });
              console.log(
                `✅ Auto Profile created for PROVIDER: ${user.email}`,
              );
            } catch (error) {
              console.error("❌ Failed to create auto profile:", error);
            }
          }
        },
      },
    },
  },

  baseURL: `${process.env.BETTER_AUTH_URL}/api/auth`,

  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "APPROVED",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Food Hub" <foodhub@ph.com>',
          to: user.email,
          subject: "Please Verify Your Email!",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="background-color:#22c55e; padding:20px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px;">Food Hub</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Verify your email address</h2>
              <p style="line-height:1.6;">
                Thanks ${user.name} for signing up for <strong>Food Hub</strong>!  
                Please confirm your email address by clicking the button below.
              </p>
              <div style="text-align:center; margin:30px 0;">
                <a href="${verificationUrl}"
                   style="background-color:#22c55e; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="line-height:1.6; font-size:14px; color:#555555;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <p style="word-break:break-all; font-size:14px; color:#2563eb;">
                ${url}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#888888;">
              © ${new Date().getFullYear()} Food Hub. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });
        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
