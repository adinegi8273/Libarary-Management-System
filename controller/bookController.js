import * as BookModel from "../models/bookModel.js";
import * as IssueModel from "../models/issueModel.js";

export async function getBooks(req, res) {
    try {
        const { search, genre, available, sortBy, order, page, limit } = req.query;
        const result = await BookModel.getAllBooks({ search, genre, available, sortBy, order, page, limit });
        res.status(200).json({ data: result.rows, pagination: result.pagination });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch books" });
    }
}

export async function getBook(req, res) {
    try {
        const book = await BookModel.getBookById(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found" });
        res.status(200).json({ data: book });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch book" });
    }
}

export async function createBook(req, res) {
    try {
        if (req.body.isbn) {
            const duplicate = await BookModel.findBookByIsbn(req.body.isbn);
            if (duplicate) return res.status(409).json({ error: "A book with this ISBN already exists" });
        }
        const book = await BookModel.createBook(req.body);
        res.status(201).json({ data: book, message: "Book created successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "23503") return res.status(400).json({ error: "author_id does not reference an existing author" });
        res.status(500).json({ error: "Failed to create book" });
    }
}

export async function updateBook(req, res) {
    try {
        const current = await BookModel.getBookById(req.params.id);
        if (!current) return res.status(404).json({ error: "Book not found" });

        if (req.body.isbn) {
            const duplicate = await BookModel.findBookByIsbn(req.body.isbn, req.params.id);
            if (duplicate) return res.status(409).json({ error: "Another book with this ISBN already exists" });
        }

        const issuedCopies = current.total_copies - current.available_copies;
        if (req.body.total_copies < issuedCopies) {
            return res.status(400).json({
                error: `Cannot set total_copies below ${issuedCopies} — that many copies are currently issued`
            });
        }

        const updated = await BookModel.updateBook(req.params.id, req.body);
        res.status(200).json({ data: updated, message: "Book updated successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "23503") return res.status(400).json({ error: "author_id does not reference an existing author" });
        res.status(500).json({ error: "Failed to update book" });
    }
}

export async function deleteBook(req, res) {
    try {
        const deleted = await BookModel.deleteBook(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Book not found" });
        res.status(200).json({ data: deleted, message: "Book deleted successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "23503") {
            return res.status(409).json({ error: "Cannot delete book: it has borrowing history" });
        }
        res.status(500).json({ error: "Failed to delete book" });
    }
}

export async function getBookHistory(req, res) {
    try {
        const book = await BookModel.getBookById(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found" });
        const { status, page, limit } = req.query;
        const result = await IssueModel.getIssues({ status, book_id: req.params.id, page, limit });
        res.status(200).json({ data: result.rows, pagination: result.pagination });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch book history" });
    }
}
