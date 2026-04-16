import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authUser = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SECERT_KEY = process.env.JWT_SECERT_KEY || "Hmmmmmmmm";
  // console.log(JWT_SECERT_KEY);
  // const authHeader  = req.headers.authorization
  // console.log(authHeader);
  // const token = authHeader?.split(" ")[1] as string;
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  try {
    jwt.verify(token, JWT_SECERT_KEY);
    // console.log(`Hiiii`);
    next();
  } catch (error) {
    console.log(`Auth errro : ${error}`);
    res.redirect("/login");
  }
};
