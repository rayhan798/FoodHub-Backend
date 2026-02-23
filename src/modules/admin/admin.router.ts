import express, { Router } from "express";
import { 
  getDashboardOverview, 
  getAllUsers, 
  updateUserStatus,
  handleProviderApproval 
} from "./admin.controller";

const router: Router = express.Router();


router.get("/overview", getDashboardOverview);

router.get("/users", getAllUsers);

router.patch("/providers/approve/:id", handleProviderApproval);


router.patch("/users/:id", updateUserStatus);

export const AdminRoutes = router;