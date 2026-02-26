import { Request, Response } from "express";
import { MealService } from "./meal.service";
import { prisma } from "../../lib/prisma"; 
import { UserStatus } from '../../../prisma/generated/prisma/client';

/**
 * খাবারের তথ্য তৈরি করা
 */
const createMeal = async (req: Request & { file?: any }, res: Response) => {
  try {
    console.log("🚀 Incoming Create Meal Request Body:", req.body);
    if (req.file) console.log("📁 Uploaded File Info:", req.file);

    const user = (req as any).user; 
    const providerProfileId = user?.providerProfileId || req.body.providerId;

    if (!providerProfileId) {
      console.warn("⚠️ Validation Failed: providerProfileId not found.");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Provider profile not found."
      });
    }

    // প্রোভাইডার স্ট্যাটাস চেক
    const providerUser = await prisma.user.findFirst({
      where: {
        providerProfile: { id: providerProfileId }
      }
    });

    if (!providerUser || providerUser.status !== UserStatus.APPROVED) {
      console.warn(`🚫 Access Denied: Provider ${providerProfileId} is not approved.`);
      return res.status(403).json({
        success: false,
        message: "Access Denied: Your account is not approved by admin."
      });
    }

    // ইমেজ পাথ সেট করা
    let imageUrl = req.body.imageUrl || ""; 
    if (req.file) {
      imageUrl = req.file.path; 
    }

    const mealData = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : 0,
      imageUrl: imageUrl, 
      providerId: providerProfileId
    };

    console.log("🛠️ Formatted Meal Data for DB:", mealData);

    const result = await MealService.createMealIntoDB(mealData);
    
    res.status(201).json({ 
      success: true, 
      message: "Meal created successfully!",
      data: result 
    });
  } catch (error: unknown) {
    console.error("❌ [CREATE_MEAL_ERROR]:");
    console.error(error); // এটি টার্মিনালে লাল রঙের স্ট্যাক ট্রেস দেখাবে

    const message = error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ success: false, message });
  }
};

/**
 * সব খাবারের তালিকা দেখা
 */
const getAllMeals = async (req: Request, res: Response) => {
  try {
    const result = await MealService.getAllMealsFromDB(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("❌ [GET_ALL_MEALS_ERROR]:", error);
    const message = error instanceof Error ? error.message : "Error fetching meals";
    res.status(500).json({ success: false, message });
  }
};

/**
 * নির্দিষ্ট খাবারের বিস্তারিত দেখা
 */
const getMealDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching details for Meal ID: ${id}`);
    
    const result = await MealService.getMealDetailsFromDB(id as string); 
    
    if (!result) {
        console.warn(`⚠️ Meal with ID ${id} not found.`);
        return res.status(404).json({ success: false, message: "Meal not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("❌ [GET_MEAL_DETAILS_ERROR]:", error);
    const message = error instanceof Error ? error.message : "Error fetching meal details";
    res.status(500).json({ success: false, message });
  }
};

/**
 * খাবারের তথ্য আপডেট করা
 */
const updateMeal = async (req: Request & { file?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const bodyData = req.body || {};
    console.log(`📝 Updating Meal ID: ${id}`, bodyData);

    let imageUrl = bodyData.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
      console.log("📸 New Image Uploaded:", imageUrl);
    }

    const updateData = {
      ...bodyData,
      ...(bodyData.price && { price: Number(bodyData.price) }),
      ...(imageUrl && { imageUrl })
    };

    const result = await MealService.updateMealInDB(id as string, updateData);
    
    res.status(200).json({ 
      success: true, 
      message: "Meal updated successfully!",
      data: result 
    });
  } catch (error: unknown) {
    console.error("❌ [UPDATE_MEAL_ERROR]:", error);
    const message = error instanceof Error ? error.message : "Error updating meal";
    res.status(500).json({ success: false, message });
  }
};

/**
 * খাবার ডিলিট করা
 */
const deleteMeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Attempting to delete Meal ID: ${id}`);
    
    await MealService.deleteMealFromDB(id as string);
    res.status(200).json({ success: true, message: "Meal deleted successfully" });
  } catch (error: unknown) {
    console.error("❌ [DELETE_MEAL_ERROR]:", error);
    const message = error instanceof Error ? error.message : "Error deleting meal";
    res.status(500).json({ success: false, message });
  }
};

export const MealController = {
  createMeal,
  getAllMeals,
  getMealDetails,
  updateMeal,
  deleteMeal,
};