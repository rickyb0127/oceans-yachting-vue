const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

import AirbrakeClient from 'airbrake-js';

var airbrake = new AirbrakeClient({
  projectId: 232482,
  projectKey: 'a316566f51c9b5c1f1d38c099073dd59'
});

Vue.config.errorHandler = function (err, vm, info) {
  airbrake.notify({
    error: err,
    params: {info: info}
  });
}

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

const dbRoute = "mongodb://admin:Wookie2000@ds155411.mlab.com:55411/oceans-yachting";

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
}

const employees = require("./routes/api/employees");
const users = require("./routes/api/users");
const posts = require("./routes/api/posts");

app.use("/api/employees", employees);
app.use("/api/users", users);
app.use("/api/posts", posts);

app.listen(process.env.PORT || 8081);
