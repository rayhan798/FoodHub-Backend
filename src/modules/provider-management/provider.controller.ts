import { Request, Response } from "express";
import { ProviderService } from "./provider.service";

// ===== Provider Profile (Publicly Viewable) =====
export const getProviderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Provider ID",
      });
    }

    const result = await ProviderService.getProviderById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Provider not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ===== Create or Update Profile (Authenticated) =====
const createOrUpdateProfile = async (req: Request & { file?: any }, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) throw new Error("User not authenticated.");

    const profileData = { ...req.body };

    // Cloudinary
    if (req.file) {
      profileData.image = req.file.path;
    }

    const result = await ProviderService.createOrUpdateProfile(userId, profileData);

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===== Meals =====
const addMeal = async (req: Request & { file?: any }, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) throw new Error("User not authenticated.");

    const mealData = { ...req.body };

    // Cloudinary
    if (req.file) {
      mealData.imageUrl = req.file.path; 
    }

    const result = await ProviderService.addMeal(userId, mealData);

    res.status(201).json({ success: true, message: "Meal added", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMeal = async (req: Request & { file?: any }, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Invalid meal ID" });

    const mealData = { ...req.body };

    // Cloudinary 
    if (req.file) {
      mealData.imageUrl = req.file.path;
    }

    const result = await ProviderService.updateMeal(id as string, mealData);
    res.status(200).json({ success: true, message: "Meal updated", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Invalid meal ID" });

    await ProviderService.deleteMeal(id as string);
    res.status(200).json({ success: true, message: "Meal deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===== Orders =====
const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success: false, message: "Order ID and Status are required" });
    }

    const result = await ProviderService.updateOrderStatus(id as string, status);
    res.status(200).json({ success: true, message: "Order status updated", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const ProviderController = {
  getProviderById, 
  createOrUpdateProfile,
  addMeal,
  updateMeal,
  deleteMeal,
  updateOrderStatus,
};