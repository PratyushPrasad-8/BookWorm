import mongoose from "mongoose";

//Connect to mongoDB after setting the databse online
export const connectDb= async()=>{
    try{
        const conn= await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connection with database established ${conn.connection.host}`);
    }catch(err){
        console.log("Error connecting to database");
        process.exit(1); //1->failure and 0->success
    }
}