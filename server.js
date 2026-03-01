import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fs from "fs";
const port = 3000;
const app = express();

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/api/weather", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=55.8642&longitude=-4.2518&current=temperature_2m,weather_code&timezone=Europe%2FLondon",
    );
    console.log("Weather API response status:", response.status);

    const data = await response.json();
    console.log("Weather data:", data);
    res.json({
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
