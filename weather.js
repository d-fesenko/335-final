const express = require("express");
require("dotenv").config();
const fetch = require("node-fetch");
const { MongoClient, ServerApiVersion } = require("mongodb");
// import express from "express";
// import { MongoClient, ServerApiVersion } from "mongodb";
// import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();
const port = parseInt(process.argv[2]);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const uri = `mongodb+srv://areebmalik2003:Sameareeb03@areeb.maryshp.mongodb.net/?retryWrites=true&w=majority&appName=Areeb`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect();
app.get("/", (req, res) => res.render("index"));
app.post("/weather", async (req, res) => {
  const city = req.body.city;
  const apiKey = "298d89cce8ba1ad43545c91660409b12"; // Ensure your API key is securely stored in your .env file
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=imperial&q=`;

  try {
    // Constructing the API URL directly within the fetch call
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    const weatherData = await response.json();

    const { temp, humidity } = weatherData.main;
    const { speed } = weatherData.wind;

    const weather = {
      city: city,
      temperature: temp,
      humidity: humidity,
      wind: speed,
    };

    // Save the fetched weather data to MongoDB
    await client.db("WeatherDB").collection("WeatherData").insertOne(weather);

    // Render the weather data using an EJS template
    res.render("weather", { weather });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching weather data");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
