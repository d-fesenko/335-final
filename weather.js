const express = require("express");
require("dotenv").config();
const fetch = require("node-fetch");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = parseInt(process.argv[2]);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const uri = process.env.URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const apiKey = "298d89cce8ba1ad43545c91660409b12";
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=imperial&q=`;
client.connect();

app.get("/", (req, res) => res.render("index"));
app.post("/weather", async (req, res) => {
    const city = req.body.city;
    const response = await fetch(apiUrl + city.toLowerCase() + `&appid=${apiKey}`);
    const weatherData = await response.json();
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const { speed }= weatherData.wind;
    const desc = weatherData.weather[0].description;
    const descU = desc.split(" ").map(i => i[0].toUpperCase() + i.slice(1)).join(" ");

    const weather = {
      city: city,
      temperature: temp,
      humidity: humidity,
      wind: speed,
      desc: descU,
    };

    await client.db("WeatherDB").collection("WeatherData").insertOne(weather);

    res.render("weather", { weather });
}); 

app.post("/favorites", async (req, res) => {
    const city = req.body.city;
    await client.db("WeatherDB").collection("Favorites").insertOne({city});
    res.redirect("/favorites");
})
app.get("/favorites", async (req, res) => {
    const cities = await client.db("WeatherDB").collection("Favorites").find().toArray();
    res.render("favorites", { cities });
});

app.post("/clear", async (req, res) => {
    await client.db("WeatherDB").collection("Favorites").deleteMany({});
    res.redirect("/favorites");
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});