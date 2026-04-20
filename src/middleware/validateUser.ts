import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

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
    const decode_data =jwt.verify(token, JWT_SECERT_KEY);
    next();
  } catch (error) {
    console.log(`Auth errro : ${error}`);
    res.redirect("/login");
  }
};




// const cookieExtractor = function(req : Request) {
//     let token = null;
//     if (req && req.cookies) {
//         token = req.cookies['jwt_token']; // Use the name you gave your cookie
//     }
//     return token;
// };

// const opts = {
//     jwtFromRequest: cookieExtractor,
//     secretOrKey: process.env.JWT_SECERT_KEY// Must match the secret used to sign the token
// };

// passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
//     try {
//         // Use await to find the user
//         const user = await User.findById(jwt_payload.id);

//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//             // Optionally: return done(null, false, { message: 'User not found' });
//         }
//     } catch (error) {
//         // This handles DB connection issues or other server errors
//         return done(error, false);
//     }
// }));