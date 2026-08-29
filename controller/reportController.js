import * as IssueModel from "../models/issueModel.js";

export async function getOverdueReport(req, res) {
    try {
        const overdue = await IssueModel.getOverdueIssues();
        res.status(200).json({ data: overdue, count: overdue.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate overdue report" });
    }
}

export async function getMostBorrowedReport(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const data = await IssueModel.getMostBorrowedBooks(limit);
        res.status(200).json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate most-borrowed report" });
    }
}

export async function getSummaryReport(req, res) {
    try {
        const summary = await IssueModel.getSummary();
        res.status(200).json({ data: summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate summary report" });
    }
}
