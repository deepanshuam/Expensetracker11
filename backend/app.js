import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import useRouter from "./routes/user.Routes.js";
const app = express();
app.use(cors());

// configuration
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// To acess and set the user server cookies.
app.use(cookieParser());

//routes path define
app.use("/api/v1/users", useRouter);
export { app };
