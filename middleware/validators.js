const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateIdParam(paramName = "id") {
    return (req, res, next) => {
        const id = parseInt(req.params[paramName]);
        if (!id || id <= 0) {
            return res.status(400).json({ error: `Invalid ${paramName}` });
        }
        req.params[paramName] = id;
        next();
    };
}

export function validateAuthor(req, res, next) {
    const { name, nationality, bio } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("name is required and must be at least 2 characters long");
    }
    if (nationality !== undefined && nationality !== null && typeof nationality !== "string") {
        errors.push("nationality must be a string");
    }
    if (bio !== undefined && bio !== null && typeof bio !== "string") {
        errors.push("bio must be a string");
    }

    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    req.body.name = name.trim();
    req.body.nationality = nationality ? nationality.trim() : null;
    req.body.bio = bio ? bio.trim() : null;
    next();
}

export function validateBook(req, res, next) {
    const { title, author_id, isbn, genre, total_copies } = req.body;
    const errors = [];

    if (!title || typeof title !== "string" || title.trim().length < 1) {
        errors.push("title is required");
    }
    if (author_id !== undefined && author_id !== null && (isNaN(parseInt(author_id)) || parseInt(author_id) <= 0)) {
        errors.push("author_id must be a positive integer if provided");
    }
    if (isbn !== undefined && isbn !== null && typeof isbn !== "string") {
        errors.push("isbn must be a string");
    }
    if (genre !== undefined && genre !== null && typeof genre !== "string") {
        errors.push("genre must be a string");
    }
    const copies = parseInt(total_copies);
    if (total_copies === undefined || total_copies === null || isNaN(copies) || copies < 0) {
        errors.push("total_copies is required and must be a non-negative integer");
    }

    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    req.body.title = title.trim();
    req.body.author_id = author_id ? parseInt(author_id) : null;
    req.body.isbn = isbn ? isbn.trim() : null;
    req.body.genre = genre ? genre.trim() : null;
    req.body.total_copies = copies;
    next();
}

export function validateMember(req, res, next) {
    const { name, email, phone } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("name is required and must be at least 2 characters long");
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        errors.push("a valid email is required");
    }
    if (phone !== undefined && phone !== null && typeof phone !== "string") {
        errors.push("phone must be a string");
    }

    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.phone = phone ? phone.trim() : null;
    next();
}

export function validateIssueRequest(req, res, next) {
    const { book_id, member_id, loan_days } = req.body;
    const errors = [];

    if (!book_id || isNaN(parseInt(book_id)) || parseInt(book_id) <= 0) {
        errors.push("book_id is required and must be a positive integer");
    }
    if (!member_id || isNaN(parseInt(member_id)) || parseInt(member_id) <= 0) {
        errors.push("member_id is required and must be a positive integer");
    }
    if (loan_days !== undefined && (isNaN(parseInt(loan_days)) || parseInt(loan_days) <= 0)) {
        errors.push("loan_days must be a positive integer if provided");
    }

    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    req.body.book_id = parseInt(book_id);
    req.body.member_id = parseInt(member_id);
    req.body.loan_days = loan_days ? parseInt(loan_days) : undefined;
    next();
}
