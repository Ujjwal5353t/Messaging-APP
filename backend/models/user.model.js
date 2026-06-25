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
        required : function(){
            const hasTwitter = this.providers?.some(p => p.provider === "twitter");
            return !hasTwitter
        } , 
        unique : true,
        sparse : true
    },
    password : {
        type : String,
        select : false
    },
    providers : [{
        provider : String,
        providerId : String
    }],
    publicKey : {
        type : String , 
        unique : true
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
