import mongoose from "mongoose"
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
    },
    email : {
        type : String,
        required : true , 
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    publicKey : {
        type : String , 
        required : true
    },
    avatar : String,
    lastSeen : Date,
    contacts : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User"
    }]
}, {timestamps : true});


userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password , 10);
    next();
})

userSchema.methods.comparePass = async function (password) {
    return await bcrypt.compare(password , this.password);

}

export const User =  mongoose.model("User", userSchema);
