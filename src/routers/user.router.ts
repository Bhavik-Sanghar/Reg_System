import { Router, Request, Response } from "express";
import { authUser } from "../middleware/validateUser";

const router = Router();

router.use(authUser);

router.get("/" , (req : Request , res:Response) =>{
    res.render("dashboard")
})

export default router;
