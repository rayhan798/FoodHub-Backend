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

    console.log("Searching for Provider with ID:", id);

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
const createOrUpdateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; 
    const result = await ProviderService.createOrUpdateProfile(userId, req.body);

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
const addMeal = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await ProviderService.addMeal(userId, req.body);

    res.status(201).json({ success: true, message: "Meal added", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, message: "Invalid meal ID" });
    }

    const result = await ProviderService.updateMeal(id, req.body);
    res.status(200).json({ success: true, message: "Meal updated", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, message: "Invalid meal ID" });
    }

    await ProviderService.deleteMeal(id);
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

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const result = await ProviderService.updateOrderStatus(id, status);
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