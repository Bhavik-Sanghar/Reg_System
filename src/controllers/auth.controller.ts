import { Request, Response } from "express";
import pool from "../config/db.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const checkEmailExist = async (req: Request , res: Response) => {
  const email = req.query.email as string;
  const query = `SELECT email from user_data where email = ?`;
  try {
    const result = await pool.query(query, [email]);
    const rows = result[0] as any[];
    if(rows.length > 0){
      res.status(200).json({
        exist : true,
        message : "Email is already exist try with another email"
      })
    }
} catch (error) {
    res.status(500).json({
      exist : false,
      message : "Error while checking email existance try again later"
    })
}
}



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
    // console.log(error);
    res.status(500).json({ message: "Data Store Error from server side...." });
  }
};



async function loginUser(req: Request, res: Response) {
  //get data
  const { email, password, remember_me } = req.body;

  //get passwordhash from db to match
  const query: string = `SELECT userPassword from user_data where email = ?`;
  const [result] = await pool.query(query, [email]);

  const hash = (result as any)[0];
  const isMatch: boolean = await bcrypt.compare(password, hash.userPassword);

  const maxAge = remember_me == "on" ? "7d" : "1h";

  if (isMatch) {
    const JWT_SECERT_KEY = process.env.JWT_SECERT_KEY || "Hmmmmmmmm";
    const token = jwt.sign({ email: email }, JWT_SECERT_KEY, {
      expiresIn: maxAge,
    });

    if (remember_me == "on") {
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 604800000, // 7 days in milliseconds
      });
    } else {
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      });
    }

    res.status(200).json({ message: "User Validate Done", url: "/user" });
  } else {
    res.status(401).json({ message: "User valdiation fail" });
  }
}

const resetPasswordLink = async (req: Request, res: Response) => {
  const email = req.body.email;

  const token = jwt.sign(
    { email: email },
    process.env.JWT_SECERT_KEY || "hmmmmmm",
    { expiresIn: "10m" },
  );

  const hashedToken = await bcrypt.hash(token, 10);
  const query = `
  INSERT INTO password_resets (email , secrete_token , expires_at) VALUES (? , ? , ?)
  `;
  try {
    await pool.execute(query, [
      email,
      hashedToken,
      new Date(Date.now() + 10 * 60 * 1000),
    ]);

    res.status(200).json({
      message: "reset link is genrated",
      token: token,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      message: "reset link is not genrated",
      token: null,
    });
  }
};

const resetPasswordPage = async (req: Request, res: Response) => {
  const token: string = req.query.q as string;
  const email: string = req.query.e as string;
  // console.log(email);

  const query = `SELECT id, secrete_token , expires_at from password_resets where email = ? and used = 0`;
  const query2 = `UPDATE password_resets SET used = 1 where id = ?`;

  try {
    const result = await pool.execute(query, [email]);
    const rows = result[0] as any[];
    // console.log(rows);
    await pool.execute(query2, [rows[0].id]);
    const currentTime = new Date();
    const expireTime = new Date(rows[0].expires_at);
    const isTokenMatch = await bcrypt.compare(token, rows[0].secrete_token);
    const isMatch = isTokenMatch && currentTime < expireTime ? true : false;

    if (isMatch) {
      res.status(200).json({
        message: "Link is Verfied and okay allow user to go on reset page",
        url: `/resetPassword?e=${email}`,
      });
    } else {
      res.status(401).json({
        message: "Link is Expired or invlaid",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Link is Invalid...",
    });
  }
};

const getLastpassword = async (req: Request, res: Response) => {
  const password = req.query.p as string;
  const email = req.query.e as string;
  // console.log(email);
  const query = `
  SELECT userPassword from user_data where email = ?
  `;

  try {
    const result = await pool.query(query, [email]);
    const rows = result[0] as any[];
    // console.log(rows);
    const isMatch: boolean = await bcrypt.compare(
      password,
      rows[0].userPassword,
    );
    if (!isMatch) {
      res.status(200).json({
        success: true,
        message: "Password is not same as old one",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "New password cannot be same as last password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server side erroe while checking for last password",
    });
  }
};

const passwordReset = async (req: Request, res: Response) => {
  const query = `
  UPDATE user_data 
  SET userPassword = ?
  WHERE email = ?
  `;

  try {
    const { password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(query, [hashedPassword, email]);
    res.status(200).json({
      message: "Password reset done redirect user to login page",
      url: "/login",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while storing new password .. Try agin later ",
    });
  }
};

export {
  checkEmailExist,
  registerUser,
  loginUser,
  resetPasswordLink,
  resetPasswordPage,
  getLastpassword,
  passwordReset,
};
