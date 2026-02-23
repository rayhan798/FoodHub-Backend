import express, { Router } from "express";
import { 
  createCategory, 
  getAllCategories, 
  deleteCategory, 
  updateCategory 
} from "./category.controller";

const router: Router = express.Router();

router.get("/", getAllCategories);

router.post("/", createCategory);

router.patch("/:id", updateCategory);

router.delete("/:id", deleteCategory);

export const CategoryRoutes = router;