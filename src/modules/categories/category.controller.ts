import { Request, Response } from "express";
import { 
  createCategoryInDB, 
  getAllCategoriesFromDB, 
  deleteCategoryFromDB, 
  updateCategoryInDB 
} from "./category.service";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await getAllCategoriesFromDB();
    res.status(200).json({ 
      success: true, 
      message: "Categories retrieved successfully",
      data: result 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server Error" 
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await createCategoryInDB(req.body);
    res.status(201).json({ 
      success: true, 
      message: "Category created successfully",
      data: result 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message || "Create Failed" 
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await updateCategoryInDB(id as string, req.body);
    res.status(200).json({ 
      success: true, 
      message: "Category updated successfully",
      data: result 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message || "Update Failed" 
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteCategoryFromDB(id as string);
    res.status(200).json({ 
      success: true, 
      message: "Category deleted successfully" 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message || "Delete Failed" 
    });
  }
};