import { Request, Response, NextFunction } from "express";

export const verifyCaptcha = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { captcha_inp } = req.body;

  const storedCaptcha = req.session.captcha;
  const current = Date.now();

  if (!storedCaptcha) {
    res.status(400).json({ message: "CAPTCHA EXPIRED" });
  } else if (storedCaptcha.text !== captcha_inp) {
    res.status(400).json({ message: "Invalid CAPTCHA" });
  } else if (storedCaptcha.expiresAt && current > storedCaptcha.expiresAt) {
    res.status(400).json({ message: "CAPTCHA EXPIRED" });
  } else if (storedCaptcha.text == captcha_inp) {
    delete req.session.captcha;
    next();
  }
};
