import mongoose, { model } from "mongoose";

const mentorSchema = new mongoose.Schema({
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
    following:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    followers:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    createdCourses:[{
        type:mongoose.Schema.Types.ObjectId
    }]
})


export const mentorD = mongoose.model("mentorD",mentorSchema);