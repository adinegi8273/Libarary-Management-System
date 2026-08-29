import * as MemberModel from "../models/memberModel.js";
import * as IssueModel from "../models/issueModel.js";

export async function getMembers(req, res) {
    try {
        const { search, page, limit } = req.query;
        const result = await MemberModel.getAllMembers({ search, page, limit });
        res.status(200).json({ data: result.rows, pagination: result.pagination });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch members" });
    }
}

export async function getMember(req, res) {
    try {
        const member = await MemberModel.getMemberById(req.params.id);
        if (!member) return res.status(404).json({ error: "Member not found" });
        res.status(200).json({ data: member });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch member" });
    }
}

export async function createMember(req, res) {
    try {
        const duplicate = await MemberModel.findMemberByEmail(req.body.email);
        if (duplicate) return res.status(409).json({ error: "A member with this email already exists" });

        const member = await MemberModel.createMember(req.body);
        res.status(201).json({ data: member, message: "Member created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create member" });
    }
}

export async function updateMember(req, res) {
    try {
        const current = await MemberModel.getMemberById(req.params.id);
        if (!current) return res.status(404).json({ error: "Member not found" });

        const duplicate = await MemberModel.findMemberByEmail(req.body.email, req.params.id);
        if (duplicate) return res.status(409).json({ error: "Another member with this email already exists" });

        const updated = await MemberModel.updateMember(req.params.id, req.body);
        res.status(200).json({ data: updated, message: "Member updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update member" });
    }
}

export async function deleteMember(req, res) {
    try {
        const deleted = await MemberModel.deleteMember(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Member not found" });
        res.status(200).json({ data: deleted, message: "Member deleted successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "23503") {
            return res.status(409).json({ error: "Cannot delete member: they have borrowing history" });
        }
        res.status(500).json({ error: "Failed to delete member" });
    }
}

export async function getMemberHistory(req, res) {
    try {
        const member = await MemberModel.getMemberById(req.params.id);
        if (!member) return res.status(404).json({ error: "Member not found" });
        const { status, page, limit } = req.query;
        const result = await IssueModel.getIssues({ status, member_id: req.params.id, page, limit });
        res.status(200).json({ data: result.rows, pagination: result.pagination });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch member history" });
    }
}
