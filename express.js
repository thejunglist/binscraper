import express from "express";
import fs from "fs";
const port = 3000;
const app = express();

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
