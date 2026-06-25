import express from "express";
import cors from "cors"

const app = express();

app.use(cors());
app.use(express.json());


import authRouter from "./routes/auth.routes.js"

app.use("/auth" , authRouter);

app.get("/" , (req , res) => {
    res.send("Hello world")
} )

export default app;