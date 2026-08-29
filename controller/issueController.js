import * as IssueModel from "../models/issueModel.js";

export async function issueBook(req, res) {
    try {
        const { book_id, member_id, loan_days } = req.body;
        const days = loan_days || IssueModel.DEFAULT_LOAN_DAYS;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        const dueDateStr = dueDate.toISOString().slice(0, 10); // YYYY-MM-DD

        const issue = await IssueModel.issueBookTransaction({ book_id, member_id, due_date: dueDateStr });
        res.status(201).json({ data: issue, message: `Book issued successfully. Due ${dueDateStr}.` });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        console.error(err);
        res.status(500).json({ error: "Failed to issue book" });
    }
}

export async function returnBook(req, res) {
    try {
        const result = await IssueModel.returnBookTransaction(req.params.id);
        const message = result.late_fee > 0
            ? `Book returned ${result.days_overdue} day(s) late. Late fee: ${result.late_fee}`
            : "Book returned successfully, on time";
        res.status(200).json({ data: result, message });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        console.error(err);
        res.status(500).json({ error: "Failed to return book" });
    }
}

export async function getIssue(req, res) {
    try {
        const issue = await IssueModel.getIssueById(req.params.id);
        if (!issue) return res.status(404).json({ error: "Issued book record not found" });
        res.status(200).json({ data: issue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch issue record" });
    }
}

export async function getIssues(req, res) {
    try {
        const { status, book_id, member_id, page, limit } = req.query;
        const result = await IssueModel.getIssues({ status, book_id, member_id, page, limit });
        res.status(200).json({ data: result.rows, pagination: result.pagination });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch issued books" });
    }
}
