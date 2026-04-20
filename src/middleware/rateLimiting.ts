import { Request, Response, NextFunction } from "express";
import client from "../config/redis.config";


const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const client_ip = req.ip?.split(":") as [];
  const ip = client_ip[client_ip?.length - 1];

  const key = `attempts:${ip}`;
  const LIMIT = 100;
  const WINDOW_IN_SECONDS = 900;

  try {
    // Strat count at request
    const currentAttempts = await client.incr(key);

    // Set expire on first attempt request
    if (currentAttempts === 1) {
      await client.expire(key, WINDOW_IN_SECONDS);
    }

    // Check if user crossed the limit
    if (currentAttempts > LIMIT) {
      const ttl = await client.ttl(key);
      return res.status(429).json({
        message: "Too many attempts.",
        retryAfter: `${Math.ceil(ttl / 60)} minutes`,
      });
    }

    next();
  } catch (error) {
    console.error("Redis Error:", error);
    next();
  }
};


export default rateLimiter
