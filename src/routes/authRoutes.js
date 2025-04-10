import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken"

const router = express.Router();

const generateToken= (userId)=>{
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn:"15d"});
}

router.post("/register", async (req, res)=>{
    try{
        const {email, username, password}= req.body;

        //Client side validation
        if(!email || !username || !password){
            return res.status(400).json({message:"All fields required"});
        }

        if(password.length < 6){
            return res.status(400).json({message:"Password must be atleast 6 characters long"});
        }

        if(username.length < 3 ){
            return res.status(400).json({message:"Username must be atleast 3 characters long"});
        }

        //Check if Email or User already exists
        if(await User.findOne({ email })){
            return res.status(400).json({message:"Email alreday exists"});
        }

        if(await User.findOne({ username })){
            return res.status(400).json({message:"Username alreday exists"});
        }

        //Creating new user to DB
        const newUser= new User({
            email, username, password,
            profileImage: `https://api.dicebear.com/9.x/initials/svg?seed=${username}`
        });

        await newUser.save();

        //Creating token
        const token= generateToken(newUser._id);
        
        //Sending token to client
        res.status(201).json({
            token,
            user:{
                id
                :newUser._id,
                username:newUser.username,
                email:newUser.email,
                profileImage:newUser.profileImage
            }
        });
    }catch(err){
        console.log("Error in register route", err);
        res.status(501).json({message:"Internal server error in register route"});
    }
});


router.post("/login", async (req, res)=>{
    console.log("entered authRoute");
    try{
        const {email, password}= req.body;

        //Client side validation
        if(!email || !password){
            return res.status(400).json({message:"All fields required"});
        }

        const user= await User.findOne({ email })
        //Check if Email or User already exists
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }

        const isCorrectPassword= await user.comparePassword(password);
        if(!isCorrectPassword) return res.status(400).json({message:"Invalid credentials"});

        //Creating token
        const token= generateToken(user._id);
        
        //Sending token to client
        res.status(200).json({
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                profileImage:user.profileImage
            }
        });
    }catch(err){
        console.log("Error in register route", err);
        res.status(501).json({message:"Internal server error"});
    }
});

export default router;