
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/books";

function App() {
  const [books, setBooks] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bookshelf-wishlist")) || [];
    } catch {
      return [];
    }
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");

  const [wishTitle, setWishTitle] = useState("");
  const [wishAuthor, setWishAuthor] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    localStorage.setItem("bookshelf-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  async function fetchBooks() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);

      if (!response.ok) throw new Error("Unable to load books.");

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setAuthor("");
    setPrice("");
    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!title.trim() || !author.trim() || price === "" || Number(price) <= 0) {
      setError("Please enter valid book details.");
      return;
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      price: Number(price),
    };

    try {
      const response = await fetch(
        editId ? `${API_URL}/${editId}` : API_URL,
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save book.");
      }

      await fetchBooks();
      setMessage(editId ? "Book updated successfully!" : "Book added successfully!");
      resetForm();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  function handleEdit(book) {
    setEditId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(book.price);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete book.");
      }

      await fetchBooks();
      setMessage("Book deleted successfully!");
    } catch (err) {
      setError(err.message || "Could not delete book.");
    }
  }

  function addToWishlist(event) {
    event.preventDefault();

    if (!wishTitle.trim() || !wishAuthor.trim()) return;

    const newWish = {
      id: Date.now(),
      title: wishTitle.trim(),
      author: wishAuthor.trim(),
    };

    setWishlist((current) => [...current, newWish]);
    setWishTitle("");
    setWishAuthor("");
    setMessage("Added to your wishlist!");
  }

  function removeFromWishlist(id) {
    setWishlist((current) => current.filter((book) => book.id !== id));
  }

  async function moveToCollection(book) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: book.title, author: book.author, price: 0 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add book.");
      }

      removeFromWishlist(book.id);
      await fetchBooks();
      setMessage("Book moved to your collection!");
    } catch (err) {
      setError(err.message || "Could not move book.");
    }
  }

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = books.reduce((sum, book) => sum + Number(book.price), 0);
  const averagePrice = books.length ? totalValue / books.length : 0;

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setActivePage("dashboard")}>
          <span className="brand-icon">✦</span>
          <span>BookShelf</span>
        </a>

        <nav className="main-nav">
          <button
            className={activePage === "dashboard" ? "nav-link active" : "nav-link"}
            onClick={() => {
              setActivePage("dashboard");
              setMessage("");
              setError("");
            }}
          >
            My Collection
          </button>
          <button
            className={activePage === "wishlist" ? "nav-link active" : "nav-link"}
            onClick={() => {
              setActivePage("wishlist");
              setMessage("");
              setError("");
            }}
          >
            My Wishlist <span className="wishlist-count">{wishlist.length}</span>
          </button>
        </nav>

        <div className="topbar-note">A little corner for book lovers</div>
      </header>

      <main className="main-content">
        {activePage === "dashboard" ? (
          <>
            <section className="welcome-section">
              <div>
                <p className="eyebrow">YOUR PERSONAL LIBRARY</p>
                <h1>Every book has a story.<br />So does your shelf.</h1>
                <p className="welcome-text">
                  Keep your favourite reads organised, all in one place.
                </p>
              </div>
              <div className="welcome-decoration" aria-hidden="true">
                <span>📚</span>
                <span>☕</span>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📖</span>
                <p>Books in collection</p>
                <h2>{books.length}</h2>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🪙</span>
                <p>Total collection value</p>
                <h2>₹{totalValue.toFixed(2)}</h2>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✧</span>
                <p>Average book price</p>
                <h2>₹{averagePrice.toFixed(2)}</h2>
              </div>
            </section>

            <section className="collection-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">THE BOOKS YOU OWN</p>
                  <h2>My Book Collection</h2>
                  <p className="section-subtitle">
                    Your little collection of stories and knowledge.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    setMessage("");
                    setError("");
                  }}
                >
                  + Add a Book
                </button>
              </div>

              <div className="search-box">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search by book title or author..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              {loading ? (
                <p className="empty-message">Loading your books...</p>
              ) : filteredBooks.length === 0 ? (
                <div className="empty-state">
                  <span>📚</span>
                  <h3>{books.length ? "No matching books" : "Your shelf is waiting!"}</h3>
                  <p>
                    {books.length
                      ? "Try another title or author."
                      : "Add your first book and start building your collection."}
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="book-table">
                    <thead>
                      <tr>
                        <th>BOOK TITLE</th>
                        <th>AUTHOR</th>
                        <th>PRICE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map((book) => (
                        <tr key={book.id}>
                          <td className="book-title-cell">{book.title}</td>
                          <td>{book.author}</td>
                          <td>₹{Number(book.price).toFixed(2)}</td>
                          <td>
                            <div className="table-actions">
                              <button className="edit-button" onClick={() => handleEdit(book)}>
                                Edit
                              </button>
                              <button className="delete-button" onClick={() => handleDelete(book.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="wishlist-section">
            <div className="wishlist-intro">
              <p className="eyebrow">BOOKS TO DISCOVER</p>
              <h1>My Wishlist</h1>
              <p className="welcome-text">
                The stories you're looking forward to reading.
              </p>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form className="wishlist-form" onSubmit={addToWishlist}>
              <h2>Add a book to your wishlist</h2>
              <div className="wishlist-inputs">
                <input
                  type="text"
                  placeholder="Book title"
                  value={wishTitle}
                  onChange={(event) => setWishTitle(event.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={wishAuthor}
                  onChange={(event) => setWishAuthor(event.target.value)}
                  required
                />
                <button type="submit" className="primary-button">Add to Wishlist</button>
              </div>
            </form>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <span>♡</span>
                <h3>Your wishlist is waiting for a story.</h3>
                <p>Add books you'd love to read or own someday.</p>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map((book) => (
                  <article className="wishlist-card" key={book.id}>
                    <div className="wishlist-cover">BOOKSHELF</div>
                    <div className="wishlist-card-content">
                      <h3>{book.title}</h3>
                      <p>by {book.author}</p>
                      <button
                        className="move-button"
                        onClick={() => moveToCollection(book)}
                      >
                        Move to Collection
                      </button>
                      <button
                        className="delete-button wishlist-remove"
                        onClick={() => removeFromWishlist(book.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <span>BookShelf</span> · Made for the love of books
      </footer>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="book-modal" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={resetForm}>×</button>
            <p className="eyebrow">{editId ? "UPDATE YOUR SHELF" : "GROW YOUR COLLECTION"}</p>
            <h2>{editId ? "Edit Book Details" : "Add a New Book"}</h2>

            <form onSubmit={handleSubmit}>
              <label>Book Title</label>
              <input
                type="text"
                placeholder="Enter book title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              <label>Author</label>
              <input
                type="text"
                placeholder="Enter author name"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                required
              />

              <label>Price (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editId ? "Save Changes" : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
