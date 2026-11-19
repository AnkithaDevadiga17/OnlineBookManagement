
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/books";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Unable to fetch books");

      const data = await response.json();
      setBooks(data);
    } catch (error) {
      setMessage("Error connecting to server!");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Add or update book
  const handleSubmit = async (e) => {
    e.preventDefault();

    const book = {
      title,
      author,
      price: Number(price)
    };

    try {
      const url = editId
        ? `${API_URL}/${editId}`
        : API_URL;

      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(book)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(data.message);
      resetForm();
      fetchBooks();

    } catch (error) {
      setMessage(error.message);
    }
  };

  // Edit book
  const handleEdit = (book) => {
    setEditId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(book.price);
  };

  // Delete book
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage(data.message);
      fetchBooks();

    } catch (error) {
      setMessage(error.message);
    }
  };

  // Clear form
  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setPrice("");
    setEditId(null);
  };

  return (
    <div className="app">
      <header>
        <h1>📚 Book Management System</h1>
        <p>Manage your book collection easily</p>
      </header>

      <main>
        <section className="form-section">
          <h2>{editId ? "Update Book" : "Add New Book"}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Book Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Author Name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Price"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <button type="submit">
              {editId ? "Update Book" : "Add Book"}
            </button>

            {editId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>

          {message && (
            <p className="message">{message}</p>
          )}
        </section>

        <section className="books-section">
          <h2>Available Books ({books.length})</h2>

          {books.length === 0 ? (
            <p>No books available.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.id}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>₹{book.price}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(book)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(book.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
