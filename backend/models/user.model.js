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
        select : false
    },
    providers : {
        local :{
            enabled : {
                type : Boolean ,
                default : false
            }
        },
        google : {
            id: String
        },
        X : {
            id : String
        }
    },
    publicKey : {
        type : String , 
    },
    avatar : String,
    bio : String,
    lastSeen : Date,
    contacts : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User"
    }]
}, {timestamps : true});


userSchema.pre("save" , async function (next) {
    if(!this.password || !this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password , 10);
})

userSchema.methods.comparePass = async function (password) {
    if(!this.password) return false;
    return await bcrypt.compare(password , this.password);

}

export const User =  mongoose.model("User", userSchema);
