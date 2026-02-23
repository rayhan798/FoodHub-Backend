import { NextFunction, Request, Response, RequestHandler } from "express";
import { z } from "zod";

// middlewares/validateRequest.ts
export const validateRequest = (schema: z.Schema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsedData.body;
      next();
    } catch (error: any) {
      console.log("Validation Error:", error.errors);
      return res.status(400).json({ success: false, errors: error.errors });
    }
  };
};
