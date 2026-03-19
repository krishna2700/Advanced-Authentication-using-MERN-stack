import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import historyRoutes from "./routes/history.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/api/history", historyRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
