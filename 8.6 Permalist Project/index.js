import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  password: "admin",
  host: "localhost",
  database: "permalist",
  port: 5432,
})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();

// let items = [
//   { id: 1, title: "Buy milk" },
//   { id: 2, title: "Finish homework" },
// ];

app.get("/", async (req, res) => {
  const query = await db.query("SELECT * FROM items");
  const items = query.rows;
  // console.log(items);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  try {
    const newItem = req.body.newItem;
    const query = await db.query("INSERT INTO items (title) VALUES ($1)", [newItem]) ;
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }

});

app.post("/edit", async (req, res) => {
  try {
    const itemtoEditId = req.body.updatedItemId;
    const itemToEditTitle = req.body.updatedItemTitle;
    const query = await db.query("UPDATE items SET title = ($1) WHERE id = ($2)", [itemToEditTitle, itemtoEditId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", (req, res) => {
  try {
    const itemtoDelete = req.body.deleteItemId;
    const query = db.query("DELETE FROM items WHERE id = ($1)", [itemtoDelete]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
  
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
