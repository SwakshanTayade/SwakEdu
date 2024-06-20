import mongoose from "mongoose";

export const connectDb = async ()=>{
    try{
        
        await mongoose.connect(process.env.mongo_url,{dbName:"course"});
        console.log('Successful Connection');
    }catch(err){
        console.log('Error in connecting to DB');
    }
}