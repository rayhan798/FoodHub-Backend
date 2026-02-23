import { Request, Response, NextFunction } from "express";
import usersService from "./users.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A valid user ID is required",
      });
    }

    const updatedUser = await usersService.toggleUserStatus(
      id as string,
      status,
    );

    res.status(200).json({
      success: true,
      message: `User status updated to ${status} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const profile = await usersService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  getAllUsers,
  toggleUserStatus,
  getMyProfile,
};
