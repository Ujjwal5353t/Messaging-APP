import mongoose from "mongoose"

export const connect = async () => {
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connected successfully");
    } catch (err) {
        console.log("error occured : " , err);
        process.exit(1);
    }
}