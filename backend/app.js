import express from "express";
import cors from "cors"

const app = express();

app.use(cors({
    credentials : true
}));
app.use(express.json());


import authRouter from "./routes/authentication/auth.route.js"
import userRouter from "./routes/users/user.route.js"
import conversationRouter from "./routes/users/conversation.route.js"

app.use("/auth" , authRouter);
app.use("/users" , userRouter);
app.use("/conversation" , conversationRouter);


app.get("/" , (req , res) => {
    res.send("Hello world")
} )

export default app;