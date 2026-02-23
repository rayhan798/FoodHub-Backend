import { Request, Response } from "express";
import { MealService } from "./meal.service";
import { prisma } from "../../lib/prisma"; 
import { UserStatus } from '../../../prisma/generated/prisma/client';

const createMeal = async (req: Request & { file?: any }, res: Response) => {
  try {
    const user = (req as any).user; 
    const providerProfileId = user?.providerProfileId || req.body.providerId;

    if (!providerProfileId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Provider profile not found."
      });
    }

    const providerUser = await prisma.user.findFirst({
      where: {
        providerProfile: {
          id: providerProfileId
        }
      }
    });

    if (!providerUser || providerUser.status !== UserStatus.APPROVED) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Your account is not approved by admin. You cannot add meals yet."
      });
    }

    let imageUrl = req.body.imageUrl || ""; 
    if (req.file) {
      imageUrl = (req.file.path || req.file.location || "").replace(/\\/g, "/");
    }

    const mealData = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : 0,
      imageUrl: imageUrl, 
      providerId: providerProfileId
    };

    const result = await MealService.createMealIntoDB(mealData);
    
    res.status(201).json({ 
      success: true, 
      message: "Meal created successfully!",
      data: result 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ success: false, message });
  }
};

const getAllMeals = async (req: Request, res: Response) => {
  try {
    const result = await MealService.getAllMealsFromDB(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching meals";
    res.status(500).json({ success: false, message });
  }
};

const getMealDetails = async (req: Request, res: Response) => {
  try {
  
    const { id } = req.params;
    const result = await MealService.getMealDetailsFromDB(id as string); 
    
    if (!result) return res.status(404).json({ success: false, message: "Meal not found" });
    res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching meal details";
    res.status(500).json({ success: false, message });
  }
};

const updateMeal = async (req: Request & { file?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const bodyData = req.body || {};

    let imageUrl = bodyData.imageUrl;
    if (req.file) {
      const filePath = req.file.path || req.file.location;
      imageUrl = filePath.replace(/\\/g, "/");
    }

    const updateData = {
      ...bodyData,
      ...(bodyData.price && { price: Number(bodyData.price) }),
      ...(imageUrl && { imageUrl })
    };

    if (Object.keys(updateData).length === 0 && !req.file) {
        throw new Error("No update data provided.");
    }

    const result = await MealService.updateMealInDB(id as string, updateData);
    
    res.status(200).json({ 
      success: true, 
      message: "Meal updated successfully!",
      data: result 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating meal";
    res.status(500).json({ success: false, message });
  }
};

const deleteMeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await MealService.deleteMealFromDB(id as string);
    res.status(200).json({ success: true, message: "Meal deleted successfully" });
  } catch (error: unknown) {
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