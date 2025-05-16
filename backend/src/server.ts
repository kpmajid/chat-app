import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";

dotenv.config();

connectDB();

const app: Express = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Chat API Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
