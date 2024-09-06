import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:String,
    cpassword:String,
    address:String,
    url:String,
    registeredCourses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"course"
    }],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
        }
    ],
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
    }],
})

export const User = mongoose.model("User",userSchema);