import { Request, Response } from "express";
import { ProviderService } from "./providers.service";
import { MealService } from "../meals/meal.service"; 
import { prisma } from "../../lib/prisma"; 

const getAllProviders = async (_req: Request, res: Response) => {
  try {
    const result = await ProviderService.getAllProvidersFromDB();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching providers" });
  }
};

const getMealDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; 

    if (!id) {
      return res.status(400).json({ success: false, message: "Meal ID is required" });
    }

    const result = await MealService.getMealDetailsFromDB(id); 
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Meal not found" });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching meal details" });
  }
};

const getProviderWithMenu = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) { 
       return res.status(400).json({ success: false, message: "Provider ID is required" });
    }

    const result = await ProviderService.getProviderWithMenuFromDB(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Provider not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider menu fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while fetching provider menu",
    });
  }
};


const updateProviderProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized! Please login again." });
    }

    const { address, phone, description } = req.body;

    if (!address || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Address and Phone number are required fields." 
      });
    }

    const updatedProfile = await prisma.providerProfile.update({
      where: { 
        userId: userId 
      },
      data: {
        address,
        phone,
        description
      }
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: updatedProfile
    });

  } catch (error: any) {
    console.error("Update Profile Error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found for this user."
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while updating your profile.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const ProviderController = {
  getAllProviders,
  getMealDetails,
  getProviderWithMenu,
  updateProviderProfile,
};