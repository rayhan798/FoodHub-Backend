import { Request, Response } from "express";
import { UserStatus  } from '../../../prisma/generated/prisma/client'
import { 
  getAdminDashboardStatsFromDB, 
  getPendingProviderRequestsFromDB,
  getAllUsersFromDB,
  updateUserStatusInDB,
  updateProviderStatusInDB 
} from "./admin.service";

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const [stats, providers] = await Promise.all([
      getAdminDashboardStatsFromDB(),
      getPendingProviderRequestsFromDB()
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: { stats, providers }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching users";
    res.status(500).json({ success: false, message });
  }
};

export const handleProviderApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value provided",
      });
    }

    const result = await updateProviderStatusInDB(id as string, status as UserStatus);

    res.status(200).json({
      success: true,
      message: `Provider request ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating provider status";
    res.status(500).json({ success: false, message });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(UserStatus).includes(status as UserStatus)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const result = await updateUserStatusInDB(id as string, status as UserStatus);

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating user status";
    res.status(500).json({ success: false, message });
  }
};