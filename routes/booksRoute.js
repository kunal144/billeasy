const express = require("express");
const booksController = require("../controllers/booksController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", booksController.search);
router.post("", auth, booksController.addBook);
router.get("", booksController.getBooks);
router.get("/:id", booksController.getBookById);
router.post("/:id/reviews", auth, booksController.postReview);
router.put("/reviews/:id", auth, booksController.updateReview);
router.delete("/reviews/:id", auth, booksController.deleteReview);

module.exports = router;
