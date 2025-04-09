import express from  "express";
import "dotenv/config"
import authRoutes from "../routes/authRoutes.js"
import bookRoutes from "../routes/bookRoutes.js"
import { connectDb } from "../lib/db.js";
import cors from "cors";

const app= express();
const port=process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
    connectDb();
})

//Using windsurf for auto completion ~mentioning it here