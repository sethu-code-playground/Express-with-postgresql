import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "admin",
  host: "localhost",
  database: "world",
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  let test = [];
  const result = await db.query("SELECT country_code FROM visited_countries");
  console.log(result.rows);
  result.rows.forEach((country) => {
    test.push(country.country_code);
  });
  return test;     
}

app.get("/", async (req, res) => {
  //Write your code here.
  const visitedCountries = await checkVisited();  
  res.render("index.ejs", {countries:visitedCountries, total: visitedCountries.length});
});


app.post("/add", async (req, res) => {
  let addedCountry = req.body.country;
  // addedCountry = addedCountry.charAt(0).toUpperCase() + addedCountry.slice(1);
  try {
    const countrymatch = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE $1", ['%' + addedCountry.toLowerCase() + '%']);
    const countrymatchEqual = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) = $1", [addedCountry.toLowerCase()]);
    const result = countrymatch.rows.length > 1 ? countrymatchEqual : countrymatch;
    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(`INSERT INTO visited_countries (country_code) VALUES ($1)`, [countryCode]);
      res.redirect("/");

    }catch (error) {
      const visitedCountries = await checkVisited(); 
      console.error("Country has already been added, Try again");
      res.render("index.ejs", {countries: visitedCountries, total: visitedCountries.length, error: "Country has already been added, Try again" });
    }
  } catch (error) {
    const visitedCountries = await checkVisited();
    console.error("Country name does not exist, Try again");
    res.render("index.ejs", {countries: visitedCountries, total: visitedCountries.length, error: "Country name does not exist, Try again" });
  }
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
