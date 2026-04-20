import { Router, Request, Response } from "express";
import session from "express-session";
import captcha from "../modules/captcha/captcha";
import jwt from "jsonwebtoken";
import { verifyCaptcha } from "../middleware/verifyCAPTCHA";
import {
  checkEmailExist,
  forgetPassword,
  getLastpassword,
  loginUser,
  passwordReset,
  registerUser,
  resetPasswordLink,
  resetPasswordPage,
} from "../controllers/auth.controller";
import rateLimiter from "../middleware/rateLimiting";

declare module "express-session" {
  interface SessionData {
    captcha: {
      text?: string;
      expiresAt?: number;
    };
  }
}

const router = Router();

router.use(rateLimiter)

router.get("/", async (req: Request, res: Response) => {
  if (req.cookies.token) {
    res.render("dashboard");
  } else {
    res.render("register");
  }
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

router.get("/checkEmailExist", checkEmailExist);
router.post("/register", verifyCaptcha, registerUser);

router.get("/login", async (req: Request, res: Response) => {
  res.render("login");
});

router.post("/login",loginUser);

router.get("/forget-password", forgetPassword)

router.post("/getResetLink", resetPasswordLink);

router.get("/resetPage", resetPasswordPage);

router.get("/lastPassword", getLastpassword);

router.get("/resetPassword", (req: Request, res: Response) => {
  const email = req.query.e;
  res.render("resetPassword", { email });
});

router.post("/resetPassword", passwordReset);

export default router;
