import Book from '../models/book';
import BookInstance, { IBookInstance } from '../models/bookinstance';
import express from 'express';
import validator from 'validator';

const router = express.Router();

/**
 * @route GET /book_dtls
 * @group resource - the details of a book
 * @param {string} id.query - the book id
 * @returns an object with the book title string, author name string, and an array of bookInstances
 * @returns 404 - if the book is not found
 * @returns 500 - if there is an error in the database
 */
router.get('/', async (req, res) => {
  // Input validation for the id parameter
  const rawId = req.query.id;
  
  // Check if id exists and is a string
  if (!rawId || typeof rawId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid book ID' });
  }
  
  // Sanitize the ID parameter - assuming it should be alphanumeric
  const id = validator.escape(rawId);
  
  try {
    const [book, copies] = await Promise.all([
      Book.getBook(id),
      BookInstance.getBookDetails(id)
    ]);

    if (!book) {
      // Safe way to return the sanitized ID
      res.status(404).json({ error: `Book not found`, id: id });
      return;
    }

    // Setting proper content type and sending JSON response
    // JSON.stringify handles the escaping of special characters
    res.setHeader('Content-Type', 'application/json');
    res.send({
      title: book.title,
      author: book.author.name,
      copies: copies
    });
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: 'Error fetching book' });
  }
});

export default router;