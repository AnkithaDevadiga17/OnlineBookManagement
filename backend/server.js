
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary book storage
let books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 299
    },
    {
        id: 2,
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        price: 250
    },
    {
        id: 3,
        title: "Atomic Habits",
        author: "James Clear",
        price: 399
    }
];

// Home route
app.get("/", (req, res) => {
    res.send("Online Book Management API is running!");
});

// 1. GET - Retrieve all books
app.get("/books", (req, res) => {
    res.status(200).json(books);
});

// 2. GET - Retrieve a book by ID
app.get("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// 3. POST - Add a new book
app.post("/books", (req, res) => {
    const { title, author, price } = req.body;

    if (!title || !author || price === undefined ||
        price === null || price === "" ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
            message: "Please provide valid title, author and price"
        });
    }

    const newBook = {
        id: books.length > 0
            ? Math.max(...books.map(b => b.id)) + 1
            : 1,
        title,
        author,
        price: Number(price)
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});

// 4. PUT - Update book details
app.put("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, price } = req.body;

    if (!title || !author || price === undefined ||
        price === null || price === "" ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
            message: "Please provide valid title, author and price"
        });
    }

    book.title = title;
    book.author = author;
    book.price = Number(price);

    res.status(200).json({
        message: "Book updated successfully",
        book
    });
});

// 5. DELETE - Delete a book
app.delete("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook[0]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
