import { Request, Response } from "express";
import { OrderService } from "./orders.service";

const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Please login again.",
      });
    }

    const { mealId, quantity, address } = req.body;

    if (!mealId || !quantity || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: mealId, quantity, or address",
      });
    }

    const result = await OrderService.createOrderIntoDB(userId, {
      mealId,
      quantity: Number(quantity),
      address,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: result,
    });
  } catch (error: any) {
    console.error("Create Order Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id as string;
    const userRole = (req as any).user?.role as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let result;

    if (userRole === "ADMIN") {
      result = await OrderService.getAllOrdersFromDB();
    } else if (userRole === "PROVIDER") {
      result = await OrderService.getProviderOrdersFromDB(userId);
    } else {
      result = await OrderService.getUserOrdersFromDB(userId);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get User Orders Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || id === "success") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Order ID" });
    }

    const result = await OrderService.getOrderDetailsFromDB(id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Status are required",
      });
    }

    const result = await OrderService.updateOrderStatusInDB(
      id as string,
      status,
    );

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      data: result,
    });
  } catch (error: any) {
    console.error("Update Status Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

export const OrderController = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
};
