import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
    const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    await pool.query(schema);
    console.log("Tables created (or already existed).");

    const { rows: existingBooks } = await pool.query("SELECT COUNT(*) FROM books");
    if (parseInt(existingBooks[0].count) > 0) {
        console.log("Books table already has data, skipping sample inserts.");
        process.exit(0);
    }

    const authorsResult = await pool.query(`
        INSERT INTO authors (name, nationality, bio) VALUES
        ('R.K. Narayan', 'Indian', 'Known for his fictional town of Malgudi.'),
        ('Arundhati Roy', 'Indian', 'Author of The God of Small Things.'),
        ('George Orwell', 'British', 'Author of dystopian classics.'),
        ('Jane Austen', 'British', 'Known for romantic fiction of the landed gentry.'),
        ('Chinua Achebe', 'Nigerian', 'Pioneer of African literature in English.')
        RETURNING id
    `);
    const [narayan, roy, orwell, austen, achebe] = authorsResult.rows.map(r => r.id);

    const booksResult = await pool.query(`
        INSERT INTO books (title, author_id, isbn, genre, total_copies, available_copies) VALUES
        ('Malgudi Days', $1, '9780140185466', 'Short Stories', 4, 4),
        ('The Guide', $1, '9780143039655', 'Fiction', 3, 3),
        ('The God of Small Things', $2, '9780812979657', 'Fiction', 3, 3),
        ('1984', $3, '9780451524935', 'Dystopian', 5, 5),
        ('Animal Farm', $3, '9780451526342', 'Political Satire', 4, 4),
        ('Pride and Prejudice', $4, '9780141439518', 'Romance', 3, 3),
        ('Emma', $4, '9780141439587', 'Romance', 2, 2),
        ('Things Fall Apart', $5, '9780385474542', 'Fiction', 3, 3)
        RETURNING id
    `, [narayan, roy, orwell, austen, achebe]);
    const bookIds = booksResult.rows.map(r => r.id);

    const membersResult = await pool.query(`
        INSERT INTO members (name, email, phone) VALUES
        ('Ananya Reddy', 'ananya.reddy@example.com', '9845123670'),
        ('Karan Mehta', 'karan.mehta@example.com', '9765432109'),
        ('Divya Nair', 'divya.nair@example.com', '9876123450'),
        ('Rohan Gupta', 'rohan.gupta@example.com', '9988001122')
        RETURNING id
    `);
    const memberIds = membersResult.rows.map(r => r.id);

    // Issue a couple of books so there's sample borrowing history to look at,
    // including one overdue example.
    await pool.query(`
        INSERT INTO issued_books (book_id, member_id, issue_date, due_date, status)
        VALUES
        ($1, $2, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days', 'issued'),
        ($3, $4, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '11 days', 'issued')
    `, [bookIds[0], memberIds[0], bookIds[3], memberIds[1]]);

    await pool.query(`UPDATE books SET available_copies = available_copies - 1 WHERE id = $1`, [bookIds[0]]);
    await pool.query(`UPDATE books SET available_copies = available_copies - 1 WHERE id = $1`, [bookIds[3]]);

    console.log("Sample authors, books, members, and two active issues inserted.");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
