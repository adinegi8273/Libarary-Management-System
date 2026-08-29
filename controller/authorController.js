import * as AuthorModel from "../models/authorModel.js";

export async function getAuthors(req, res) {
    try {
        const { search, page, limit } = req.query;
        const result = await AuthorModel.getAllAuthors({ search, page, limit });
        res.status(200).json({ data: result.rows, pagination: result.pagination });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch authors" });
    }
}

export async function getAuthor(req, res) {
    try {
        const author = await AuthorModel.getAuthorById(req.params.id);
        if (!author) return res.status(404).json({ error: "Author not found" });
        res.status(200).json({ data: author });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch author" });
    }
}

export async function createAuthor(req, res) {
    try {
        const author = await AuthorModel.createAuthor(req.body);
        res.status(201).json({ data: author, message: "Author created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create author" });
    }
}

export async function updateAuthor(req, res) {
    try {
        const current = await AuthorModel.getAuthorById(req.params.id);
        if (!current) return res.status(404).json({ error: "Author not found" });
        const updated = await AuthorModel.updateAuthor(req.params.id, req.body);
        res.status(200).json({ data: updated, message: "Author updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update author" });
    }
}

export async function deleteAuthor(req, res) {
    try {
        const deleted = await AuthorModel.deleteAuthor(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Author not found" });
        res.status(200).json({ data: deleted, message: "Author deleted successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "23503") {
            return res.status(409).json({ error: "Cannot delete author: books reference this author" });
        }
        res.status(500).json({ error: "Failed to delete author" });
    }
}
