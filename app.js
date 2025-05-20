const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/authRoute");
const bookRouter = require("./routes/booksRoute");

const PORT = 3001;

app.use(
  cors({
    origin: process.env.Production || "http://localhost:3000",
  })
);

app.use(express.json());

mongoose
  .connect(process.env.dataBaseURI)
  .then(() => console.log("Connected To MongoDb"))
  .catch((error) => console.error("Failed to connect", error));

// all routes

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
