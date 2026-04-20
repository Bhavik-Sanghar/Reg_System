import pool from "../config/db.config";
import { Request, Response } from "express";

const getLogs = async () => {
  const query = `SELECT * from audit_logs`;

  try {
    const [logs] = await pool.execute(query);
    return logs;
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req: Request, res: Response) => {
    console.log("hii");
  res.clearCookie("token");
  res.status(200).json({
    message: "Logged out successfully",
  });
};


export {
    getLogs,
    logout
}