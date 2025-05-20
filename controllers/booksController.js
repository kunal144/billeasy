const mongoose = require("mongoose");

// Mongoose models
const Book = require("../schema/book");
const Review = require("../schema/review");

// POST /books – Add a new book (Authenticated users only)
exports.addBook = async (req, res) => {
  try {
    const { title, author, genre, description } = req.body;
    const book = new Book({ title, author, genre, description });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /books – Get all books
exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;
    const filter = {};
    if (author) filter.author = author;
    if (genre) filter.genre = genre;

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const count = await Book.countDocuments(filter);

    res.json({
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      books,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /books/:id – Get book details by ID
exports.getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const book = await Book.findById(id).lean();
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const [aggResult] = await Review.aggregate([
      { $match: { book: objectId } },
      { $group: { _id: "$book", avgRating: { $avg: "$rating" } } },
    ]);
    const averageRating = aggResult ? aggResult.avgRating : 0;

    const { page = 1, limit = 5 } = req.query;
    const reviews = await Review.find({ book: objectId })
      .populate("user", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const totalReviews = await Review.countDocuments({ book: objectId });

    res.json({
      ...book,
      averageRating,
      reviews: {
        total: totalReviews,
        page: Number(page),
        pages: Math.ceil(totalReviews / limit),
        list: reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /books/:id/reviews
exports.postReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const existing = await Review.findOne({ book: id, user: req.user.id });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this book" });
    }

    const review = new Review({
      book: id,
      user: req.user.id,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /reviews/:id – Update your own review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    review.rating = rating !== undefined ? rating : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /reviews/:id – Delete your own review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const regex = new RegExp(q, "i");
    const filter = { $or: [{ title: regex }, { author: regex }] };

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const count = await Book.countDocuments(filter);

    res.json({
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      books,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
