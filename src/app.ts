import express, { type Request, type Response } from "express";
import authRoute from "./routers/auth.routes"
import userRoute from "./routers/user.router"


import cookieParser from "cookie-parser";
import path from "path";
import router from "./routers/auth.routes";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/",authRoute)

app.use("/user",userRoute)


export default app;
