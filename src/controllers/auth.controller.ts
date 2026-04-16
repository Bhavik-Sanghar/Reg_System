import { Request, Response } from "express";
import pool from "../config/db.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query: string = `
     INSERT INTO user_data (firstName, lastName ,email ,userPassword) VALUES (?,?,? ,?);
  `;

  try {
    await pool.execute(query, [firstName, lastName, email, hashedPassword]);
    res.status(200).json({ message: "Data store is done...", url: "/login" });
  } catch (error) {
    res.status(500).json({ message: "Data Store Error from server side...." });
  }
};

async function loginUser(req: Request, res: Response) {
  //get data
  const { email, password } = req.body;

  //get passwordhash from db to match
  const query: string = `SELECT userPassword from user_data where email = ?`;
  const [result] = await pool.query(query, [email]);

  const hash = (result as any)[0];
  const isMatch: boolean = await bcrypt.compare(password, hash.userPassword);

  if (isMatch) {
    const JWT_SECERT_KEY = process.env.JWT_SECERT_KEY || "Hmmmmmmmm";
    const token = jwt.sign({ email: email }, JWT_SECERT_KEY, {
      expiresIn: "2hr",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000 // 1 hour in milliseconds
    });

    res.status(200).json({message : "User Validate Done" , url : "/user"});
  } else {
    res.status(401).json({message : "User valdiation fail"});
  }
}

export { registerUser  , loginUser};
