import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import cookieParser from "cookie-parser";

import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import "./config/passport/googleStrategy";

dotenv.config();

connectDB();

const app: Express = express();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
