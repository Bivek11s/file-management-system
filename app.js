import express from "express";
import userRouter from "./routes/user.route.js";
import fs from "fs";
import fileRouter from "./routes/file.route.js";

const app = express();
app.use(express.json());

const dir = "./uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

app.use("/user", userRouter);
app.use("/file", fileRouter);

export default app;
