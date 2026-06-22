import { connect } from 'mongoose';


const connectDB = async()=>{
    try{
        await connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    }catch(err){
        console.log("Error connecting to MongoDB:", err);
    }
}


export default connectDB;

