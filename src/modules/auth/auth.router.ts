import { Router, Request, Response } from "express";
import { AuthController } from "./auth.controller";

const router: Router = Router();

router.post("/sign-up", AuthController.providerSignUp);

router.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Auth Router is Working!",
  });
});

export default router;