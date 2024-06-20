import mongoose, { model } from "mongoose";

const createCourse = new mongoose.Schema({
    courseName:String,
    insName:String,
    url:String,
    domain:String,
    des:String,
    videoLink:[{
        type:String
        }
    ]
});


export const course = mongoose.model("course",createCourse)