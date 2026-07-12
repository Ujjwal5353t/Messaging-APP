import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}));
app.use(express.json());
app.use(cookieParser());


import authRouter from "./routes/authentication/auth.route.js"
import userRouter from "./routes/users/user.route.js"
import conversationRouter from "./routes/users/conversation.route.js"
import messageRouter from "./routes/message/message.route.js"


app.use("/auth" , authRouter);
app.use("/users" , userRouter);
app.use("/conversation" , conversationRouter);
app.use("/message" , messageRouter)

app.get("/" , (req , res) => {
    res.send("Hello world")
} )

export default app;