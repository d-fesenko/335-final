const express = require("express");
require("dotenv").config();
const fetch = require("node-fetch");
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = parseInt(process.argv[2]);

const app = express()
app.use(express.urlencoded({ extended: true }));
app.set("views", path.resolve(__dirname, "ejs_files"));
app.set("view engine", "ejs");
// app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// app.set("view engine", "ejs");
// app.set("views", path.resolve(__dirname, "views"));

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
app.post("/", async (req, res) => {
  const city = req.body.city;
  const response = await fetch(apiUrl + city.toLowerCase() + `&appid=${apiKey}`);
  const weatherData = await response.json();

  if (!weatherData.main) {
      const error = "City not found. Please check the city name and try again.";
      return res.render("weather", { error });  // Send error to the view
  }

  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const { speed } = weatherData.wind;
  const desc = weatherData.weather[0].description;
  const descU = desc.split(" ").map(i => i[0].toUpperCase() + i.slice(1)).join(" ");


 let weather;

 if (city.toLowerCase() === "nelson") {
   weather = {
     city: "Nelson Land Amigo",
     temperature: 69,
     humidity: 69,
     wind: 69,
     desc: "Very Nice Amigo",
   };
 } else {
   weather = {
     city: city,
     temperature: temp,
     humidity: humidity,
     wind: speed,
     desc: descU,
   };
 }
  await client.db("WeatherDB").collection("WeatherData").insertOne(weather);
  res.render("weather", { weather });
});

app.get("/weather", async (req, res) => {
  let city
  if (req.query.city == "Nelson Land Amigo") {
    city = "nelson"
  }
  else {
    city = req.query.city;
  }

  if (!city) {
      return res.render("index");
  }

  const response = await fetch(apiUrl + city.toLowerCase() + `&appid=${apiKey}`);
  const weatherData = await response.json();
  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const { speed } = weatherData.wind;
  const desc = weatherData.weather[0].description;
  const descU = desc.split(" ").map(i => i[0].toUpperCase() + i.slice(1)).join(" ");

  let weather

  if ((city.toLowerCase() === "nelson")) {
    weather = {
      city: "Nelson Land Amigo",
      temperature: 69,
      humidity: 69,
      wind: 69,
      desc: "Very Nice Amigo",
    };
  }
  else {
    weather = {
    city: city,
    temperature: temp,
    humidity: humidity,
    wind: speed,
    desc: descU,
  };
}

  res.render("weather", { weather });
});



app.post("/favorites/:city", async (req, res) => {
    const city = req.params.city;
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
