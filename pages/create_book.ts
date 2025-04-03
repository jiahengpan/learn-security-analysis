import { Request, Response } from 'express';
import Book from '../models/book';
import express from 'express';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/**
 * Middleware specific to this router
 * The function is called for every request to this router
 * It parses the body and makes it available under req.body
 */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * Rate limiting middleware to prevent abuse
 * Limits to 5 book creation attempts per IP address in a 15 minute window
 */
const createBookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many book creation attempts, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * @route POST /newbook
 * @returns a newly created book for an existing author and genre in the database
 * @returns 500 error if book creation failed
 */
router.post('/', createBookLimiter, async (req: Request, res: Response) => {
  const { familyName, firstName, genreName, bookTitle } = req.body;
  
  if (familyName && firstName && genreName && bookTitle) {
    try {
      const book = new Book({});
      const savedBook = await book.saveBookOfExistingAuthorAndGenre(familyName, firstName, genreName, bookTitle);
      res.status(200).send(savedBook);
    } catch (err: unknown) {
      res.status(500).send('Error creating book: ' + (err as Error).message);
    }
  } else {
    res.send('Invalid Inputs');
  }
});

export default router;