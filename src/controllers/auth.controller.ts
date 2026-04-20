import { Request, Response } from "express";
import pool from "../config/db.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "../config/redis.config";

const logEvent = async (
  userId: string | number | null,
  eventType: string,
  req: Request,
  metadata = {},
) => {
  try {
    const client_ip = req.ip?.split(":") as [];
    const ip = client_ip[client_ip?.length - 1];
    const logData = {
      user_id: userId || null, // Null if user isn't logged in yet
      event_type: eventType,
      ip_address: ip,
      user_agent: req.headers["user-agent"],
      metadata: JSON.stringify(metadata),
    };

    // Insert into MySQL
    await pool.query("INSERT INTO audit_logs SET ?", logData);
  } catch (error) {
    // We console.error but don't "throw" because we don't
    // want a logging failure to crash the whole login process
    console.error("Audit Log Error:", error);
  }
};

const checkEmailExist = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  const query = `SELECT email from user_data where email = ?`;
  try {
    const result = await pool.query(query, [email]);
    const rows = result[0] as any[];
    if (rows.length > 0) {
      res.status(200).json({
        exist: true,
        message: "Email is already exist try with another email",
      });
    } else {
      res.status(201).json({
        exist: false,
        message: "Email is not in DB user can create account",
      });
    }
  } catch (error) {
    res.status(500).json({
      exist: false,
      message: "Error while checking email existance try again later",
    });
  }
};

const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query: string = `
     INSERT INTO user_data (firstName, lastName ,email ,userPassword) VALUES (?,?,? ,?);
  `;

  try {
    await pool.execute(query, [firstName, lastName, email, hashedPassword]);
    await logEvent(null, "auth.register_successful", req, {
      user_email: email,
    });
    res.status(200).json({ message: "Data store is done...", url: "/login" });
  } catch (error) {
    // console.log(error);
    await logEvent(null, "auth.register_fail", req, { user_email: email });

    res.status(500).json({ message: "Data Store Error from server side...." });
  }
};

async function loginUser(req: Request, res: Response) {
  const client_ip = req.ip?.split(":") || [];
  const ip = client_ip[client_ip.length - 1];
  const key = `failed_attempts:${ip}`;
  const maxAttempt = 100;

  // console.log(ip);

  //query for login_attempts
  // const login_attempt_query = `
  // INSERT INTO login_attempts(identifier , ip_address , is_successful) VALUES (? , ? , ?);
  // `;

  //get data
  const { email, password, remember_me } = req.body;

  //check if email exist or not
  const email_query = `SELECT email from user_data where email = ?`;

  //get passwordhash from db to match
  const query: string = `SELECT userPassword from user_data where email = ?`;

  try {
    const [result] = await pool.query(query, [email]);
    const rows = result as any[];

    const maxAge = remember_me == "on" ? "7d" : "1h";

    if (rows.length > 0) {
      const user = rows[0];

      const isMatch: boolean = await bcrypt.compare(
        password,
        user.userPassword,
      );

      if (isMatch) {
        await client.del(key);
        const JWT_SECERT_KEY = process.env.JWT_SECERT_KEY || "Hmmmmmmmm";

        const role = email == "admin@outlook.com" ? "admin" : "user";
        const token = jwt.sign({ email: email, role: role }, JWT_SECERT_KEY, {
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

        // await pool.execute(login_attempt_query, [email, ip, true]);
        await logEvent(null, "auth.login_successful", req, {
          user_email: email,
        });
        return res
          .status(200)
          .json({ message: "User Validate Done", url: "/user" });
      } else {
        // This handles the case where email exists but password is WRONG
        await logEvent(null, "auth.login_fail", req, {
          attempted_email: email,
        });

        const failed_attempt = await client.incr(key);
        if (failed_attempt >= 4) {
          await client.expire(key, 3600);
          const ttl = await client.ttl(key);
          return res.status(429).json({
            message: "Too many Failed attempts.",
            retryAfter: `${Math.ceil(ttl / 60)} minutes`,
          });
        }

        return res.status(401).json({
          message: `Login failed. ${4 - failed_attempt} attempts remaining.`,
        });
      }
    } else {
      // await pool.execute(login_attempt_query, [email, ip, false]);
      const failed_attempt = await client.incr(key);

      if (failed_attempt >= 4) {
        await client.expire(key, 3600);
        const ttl = await client.ttl(key);
        return res.status(429).json({
          message: "Too many Failed attempts.",
          retryAfter: `${Math.ceil(ttl / 60)} minutes`,
        });
      }

      await logEvent(null, "auth.login_fail", req, { attempted_email: email });
      return res.status(401).json({
        message: `Login failed. ${4 - failed_attempt} attempts remaining.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server side error while login" });
  }
}

const resetPasswordLink = async (req: Request, res: Response) => {
  const email = req.body.email;

  const token = jwt.sign(
    {
      email: email,
    },
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

  const { password, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(query, [hashedPassword, email]);
    await logEvent(null, "auth.resetPassword_successful", req, {
      user_email: email,
    });

    res.status(200).json({
      message: "Password reset done redirect user to login page",
      url: "/login",
    });
  } catch (error) {
    await logEvent(null, "auth.resetPassword_fail", req, {
      user_email: email,
    });
    res.status(500).json({
      message: "Error while storing new password .. Try agin later ",
    });
  }
};

const forgetPassword = async (req: Request, res: Response) => {
  const email = req.query.e;
  await logEvent(null, "auth.forgetPasswordPage", req, {
    user_email: email,
  });
  res.render("forgetPassword");
};


export {
  checkEmailExist,
  registerUser,
  loginUser,
  resetPasswordLink,
  resetPasswordPage,
  getLastpassword,
  passwordReset,
  forgetPassword,
};
