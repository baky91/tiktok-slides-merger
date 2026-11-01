import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import scrapeRouter from "./routes/scrape.js";
import mergeRouter from "./routes/merge.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const app = express();
app.use(express.json());
app.use("/api/images", scrapeRouter);
app.use("/api/merge", mergeRouter);

if (isProduction) {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
