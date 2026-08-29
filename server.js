import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authorRoutes from "./routes/authorRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

// Frontend (index/books/members/issues/reports pages)
app.use(express.static(path.join(__dirname, "public")));

app.use("/authors", authorRoutes);
app.use("/books", bookRoutes);
app.use("/members", memberRoutes);
app.use("/issues", issueRoutes);
app.use("/reports", reportRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(PORT, () => {
    console.log(`Library Management System listening at http://localhost:${PORT}`);
});
