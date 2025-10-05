import express from "express";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";
import Book from "../models/Book.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;
    // if(!title || !image|| !rating|| !caption) return res.send.status(400).json({message:"Please provide an image"});

    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // uploade image cloudinary
    // const uploadeResponse = await cloudinary.uploader.upload(image);
    // const imageUrl = uploadeResponse.secure_url;

    // Strip base64 prefix if exists
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      { folder: "books" } // optional folder
    );

    // save to the database

    const newBook = new Book({
      title,
      caption,
      rating,
      // image: imageUrl,
      image: uploadResponse.secure_url,
      user: req.user._id,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

// get recomended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.log("Get user books error", error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

// create delete methods
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    // delete image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publickId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publickId);
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
      }
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error in delete book route", error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

export default router;
