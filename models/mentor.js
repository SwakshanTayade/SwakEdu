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
})


export const mentorD = mongoose.model("mentorD",mentorSchema);