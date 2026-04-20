import { Router, Request, Response } from "express";
import { authUser } from "../middleware/validateUser";
import jwt from "jsonwebtoken";

import { getLogs } from "../controllers/auth.controller";

const router = Router();

router.use(authUser);

router.get("/", authUser, async (req: Request, res: Response) => {
  const JWT_SECERT_KEY = process.env.JWT_SECERT_KEY || "Hmmmmmmmm";
  const token = req.cookies.token;
  const decode_data = jwt.verify(token, JWT_SECERT_KEY) as { role: string };

  if (decode_data.role == "admin") {
    return res.render("admin", { logs: await getLogs() });
  } else {
    return res.render("dashboard");
  }
});

export default router;
