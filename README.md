# Task 4 — Library Management System

Backend: Express.js + PostgreSQL (`pg`). Frontend: plain HTML/JS served as static files by the same server.

No existing project was attached for this task, so I designed the schema and seed data from
scratch (see "Assumptions" below) — same style and folder structure as Task 2.

## Folder structure

```
library-management-system/
├── config/
│   └── db.js                  # Postgres connection pool
├── db/
│   ├── schema.sql              # CREATE TABLE statements
│   └── seed.js                 # Creates tables + inserts sample authors/books/members/issues
├── models/
│   ├── authorModel.js
│   ├── bookModel.js
│   ├── memberModel.js
│   └── issueModel.js           # Borrowing logic, transactions, reports
├── controllers/
│   ├── authorController.js
│   ├── bookController.js
│   ├── memberController.js
│   ├── issueController.js
│   └── reportController.js
├── routes/
│   ├── authorRoutes.js
│   ├── bookRoutes.js
│   ├── memberRoutes.js
│   ├── issueRoutes.js
│   └── reportRoutes.js
├── middleware/
│   └── validators.js
├── public/
│   ├── index.html               # Dashboard with summary stats
│   ├── books.html / book_form.html
│   ├── authors.html / author_form.html
│   ├── members.html / member_form.html
│   ├── issues.html              # Issue a book + return + filter by status
│   └── reports.html             # Overdue list, late fees, most-borrowed, summary
├── server.js
└── package.json
```

## 1. Assumptions I made (nothing was given for this task)

- **Entities**: `authors`, `books` (with `total_copies`/`available_copies`), `members`,
  and `issued_books` (the borrowing/loan record, with `issue_date`, `due_date`,
  `return_date`, `status`, `late_fee`).
- **Loan period**: defaults to 14 days, overridable per-issue via `loan_days` in the request.
- **Late fee**: ₹5 (or whatever your currency is) per day overdue, calculated at return time.
- A member **cannot** issue the same book twice while their first copy is still out — that's
  the "prevent duplicate book issues" rule from the task.

Adjust the schema/rates in `db/schema.sql` and `models/issueModel.js` (`LATE_FEE_PER_DAY`,
`DEFAULT_LOAN_DAYS`) if you want different numbers.

## 2. Setup

```bash
cd library-management-system
npm install
```

Edit `config/db.js` if your Postgres connection details differ from
`postgresql://postgres:123@localhost/Library` (or set a `DATABASE_URL` env var). Then create
the database itself (the app doesn't create the database, only the tables):

```sql
CREATE DATABASE "Library";
```

Then create the tables and load sample data in one step:

```bash
npm run seed
```

This is safe to re-run — it only inserts sample books/members/issues if the `books` table
is currently empty.

## 3. Run

```bash
npm start
```

Server runs at `http://localhost:3000`. Open `http://localhost:3000/index.html` for the
dashboard, or hit the API directly.

## 4. API reference

| Resource | Endpoints |
|---|---|
| Authors | `GET/POST /authors`, `GET/PUT/DELETE /authors/:id` |
| Books | `GET/POST /books` (search, genre, available, sortBy, order, page, limit), `GET/PUT/DELETE /books/:id`, `GET /books/:id/history` |
| Members | `GET/POST /members` (search, page, limit), `GET/PUT/DELETE /members/:id`, `GET /members/:id/history` |
| Issues | `GET /issues` (status, book_id, member_id, page, limit), `GET /issues/:id`, `POST /issues` (issue a book), `PUT /issues/:id/return` (return a book) |
| Reports | `GET /reports/overdue`, `GET /reports/most-borrowed`, `GET /reports/summary` |

## 5. Checklist — how to verify each task requirement

**Express.js backend** ✅
`npm start` → should print `Library Management System listening at http://localhost:3000` with no errors.

**Database models for books, members, authors, issued books** ✅
Four tables in `db/schema.sql`, one model file each. Confirm with:
```bash
curl http://localhost:3000/books
curl http://localhost:3000/authors
curl http://localhost:3000/members
curl http://localhost:3000/issues
```

**Add / update / delete / issue / return APIs** ✅
- Add a book: `curl -X POST http://localhost:3000/books -H "Content-Type: application/json" -d '{"title":"Test Book","total_copies":2}'`
- Update it: `curl -X PUT http://localhost:3000/books/<id> -H "Content-Type: application/json" -d '{"title":"Test Book v2","total_copies":3}'`
- Delete it: `curl -X DELETE http://localhost:3000/books/<id>`
- Issue a book: `curl -X POST http://localhost:3000/issues -H "Content-Type: application/json" -d '{"book_id":1,"member_id":1}'`
- Return it: `curl -X PUT http://localhost:3000/issues/<issue_id>/return`
- Or just use `books.html`, `member_form.html`, and `issues.html` in the browser.

**Track book availability and borrowing history** ✅
- `available_copies` on each book updates automatically on issue/return (see it change in `books.html`).
- Per-book history: `curl http://localhost:3000/books/<id>/history`
- Per-member history: `curl http://localhost:3000/members/<id>/history`
- Or click "History" next to a member on `members.html`.

**Validate borrowing rules to prevent duplicate book issues** ✅
- Issue the same book to the same member twice without returning it in between:
  ```bash
  curl -X POST http://localhost:3000/issues -H "Content-Type: application/json" -d '{"book_id":1,"member_id":1}'
  curl -X POST http://localhost:3000/issues -H "Content-Type: application/json" -d '{"book_id":1,"member_id":1}'
  ```
  Second call should return `409` with `"This member already has this book issued and hasn't returned it yet"`.
- Try issuing a book with `available_copies = 0` → expect `409 "No copies of this book are currently available"`.

**Search, filtering, and pagination for books and members** ✅
- Search books: `curl "http://localhost:3000/books?search=orwell"`
- Filter by genre: `curl "http://localhost:3000/books?genre=Fiction"`
- Filter by availability: `curl "http://localhost:3000/books?available=true"`
- Paginate: `curl "http://localhost:3000/books?page=2&limit=3"`
- Search/paginate members: `curl "http://localhost:3000/members?search=reddy&page=1&limit=5"`
- Or use the search box, genre box, and availability dropdown on `books.html`.

**Return meaningful success and error responses** ✅
- `400` — bad input (with a `details` array explaining exactly what's wrong)
- `404` — book/member/author/issue not found
- `409` — duplicate ISBN/email, duplicate active issue, no copies available, already returned
- `500` — unexpected server error (check the console for the real error)
- Every successful write includes a human-readable `message` (e.g. `"Book returned 3 day(s) late. Late fee: 15"`).

**Clean project architecture and reusable code** ✅
Config/db/model/controller/route/middleware layers are separated per resource, so adding a
new entity later doesn't mean touching `server.js`.

**Bonus: overdue days, late fees, library reports** ✅
- Overdue report with per-record days-overdue and estimated fee: `curl http://localhost:3000/reports/overdue`
- Most-borrowed books: `curl http://localhost:3000/reports/most-borrowed`
- Library summary (titles, copies, members, issued, overdue counts): `curl http://localhost:3000/reports/summary`
- Or just open `reports.html` — it renders all three.
- The seed data includes one book issued 20 days ago (6 days overdue) so you have something
  to see in the overdue report immediately after seeding, without waiting for a real due date.

## 6. A note on the return-and-issue transactions

`issueBookTransaction` and `returnBookTransaction` in `models/issueModel.js` wrap their
work in a real Postgres transaction with `SELECT ... FOR UPDATE` row locks. That's what
stops two people issuing "the last copy" of a book at the same instant, or double-returning
the same loan — worth a look if you want to see how the availability count stays accurate
under concurrent requests.
