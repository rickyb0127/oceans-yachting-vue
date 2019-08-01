const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

var dbRoute;
if(process.env.NODE_ENV === "production") {
  dbRoute = process.env.DB_ROUTE;
} else {
  const config = require('./config.js');
  dbRoute = config.dbRoute;
}

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

if(process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/public/"));
  app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });
  app.get('/edit-blog', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });
  app.get('/edit-company-profile', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });
  app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });
}

const employees = require("./routes/api/employees");
const users = require("./routes/api/users");
const posts = require("./routes/api/posts");
const backgrounds = require("./routes/api/backgrounds");

app.use("/api/employees", employees);
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/backgrounds", backgrounds);

app.listen(process.env.PORT || 8081);
