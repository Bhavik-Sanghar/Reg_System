import { Router, Request, Response } from "express";
import session from "express-session";
import captcha from "../modules/captcha/captcha";
import { verifyCaptcha } from "../middleware/verifyCAPTCHA";
import { loginUser, registerUser } from "../controllers/auth.controller";

declare module "express-session" {
  interface SessionData {
    captcha: {
      text?: string;
      expiresAt?: number;
    };
  }
}

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  res.render("register");
});

router.use(
  session({
    secret: "hmmmm",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

router.get("/getcaptcha", async (req: Request, res: Response) => {
  const captcha_data = captcha();

  req.session.captcha = {
    text: captcha_data.text as string,
    expiresAt: Date.now() + 60 * 1000,
  };

  res.type("svg");
  res.send(captcha_data.data);
});

router.post("/register", verifyCaptcha, registerUser);

router.get("/login", async (req: Request, res: Response) => {
  res.render("login");
});

router.post("/login", loginUser);


export default router;
