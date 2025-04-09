import express from "express";
import cloudinary from "../lib/cloudinary.js"
import Book from "../models/book.js";
import protectRoute from "../midllewares/auth.middleware.js";

const router= express.Router();

//Creating a new book, user must be authenticated
router.post("/", protectRoute, async(req, res)=>{
    try {
        const {title, caption, rating, image}= req.body;

        if(!title || !caption || !rating || !image){
            res.status(400).json({message:"Please provide all fileds"});
        }

        //Upload the image to cloudinary
        const uploadResponse= await cloudinary.uploader.upload(image);
        const imageUrl= uploadResponse.secure_url;

        //saving the information to database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id   
        });

        await newBook.save();
        res.status(201).json(newBook);
    }catch(err){
        console.log("Error creating the book");
        res.status(500).json({message:err.message})
    }
});

//Getting all the books
router.get("/", protectRoute, async(req, res)=>{
    //pagination--> Instead of loading all the books at once loads only first 5 or 10 books then as user scrolls down it loads next 5 or 10 books
    //eg: const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");
    try {
        const page= req.query.page || 1;
        const limit= req.query.limit || 5;
        const skip= (page-1)*limit;
        
        const books= await Book.find()
        .sort({createdAt:-1})//descending order --> -1 means descending order and 1 means ascending order 
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

        const totalBooks= await Book.countDocuments();
        res.send({
            books,
            currentPage: page,//Will be undetstood in the frontend
            totalBooks,
            totalPages: Math.ceil(totalBooks/limit)
        });
    } catch (err) {
        console.log("Error getting all the booksroute", err);
        res.status(500).json({message:"Internal server error"});
    }
});

//Deleting the book uploaded by the user
router.delete("/:id", protectRoute, async(req, res)=>{
    try {
        const book= await Book.findById(req.params.id);
        if(!book) return res.status(404).json({message:"Book not found"});

        //Check if user can delete book or not
        if(book.user.toString() !== req.user._id) 
            return res.status(401).json({message:"You are not authorized to delete this book"});

        //Before deelting the book delete the image from cloudinary
        //make sure book exixsts and is uploaded to cloudinary 
        if(!book || !book.image.includes("cloudinary")) return res.status(404).json({message:"Book not found"});
       
        //deleting the image from cloudinary
        //example of cloudinary url: https://res.cloudinary.com/ds7z4b8i2/image/upload/v1679995029/Books/Book1.jpg
        try {
            const imageId= book.image.split("/").pop().split(".")[0];//we get "Book1"
            await cloudinary.uploader.destroy(imageId);
        } catch (err) {
            console.log("error deleting the image from cloudinary", err);
            res.status(500).json({message:"Internal server error"});
        }

        await book.deleteOne();
        res.status(200).json({message:"Book deleted successfully"});
    } catch (err) {
        console.log("error deleting the book", err);
        res.status(500).json({message:"Internal server error"});
    }
});

//Show all the books uploaded by the user
router.get("/books", protectRoute, async(req, res)=>{
    try {
        const books= await Book.find({user: req.user._id});
        res.status(200).json(books);
    } catch (err) {
        console.log("Error getting all the booksroute", err);
        res.status(500).json({message:"Internal server error"});
    }
});
export default router;