import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const providerSignUp = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.signUpIntoDB(req.body);

    const isProvider = req.body.role === "PROVIDER";
    const successMessage = isProvider 
      ? "Registration successful! Your account is pending admin approval." 
      : "Registration successful! You can login now.";

    res.status(201).json({
      success: true,
      message: successMessage,
      data: result,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    res.status(400).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};

export const AuthController = { providerSignUp };