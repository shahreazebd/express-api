const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

if (process.env.NODE_ENV !== "production") require("dotenv").config();

const mongoose = require("mongoose");

// models
const User = require("./models/User");
const { remove } = require("./models/User");

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("database connected!!");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

connectMongo();

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send({ message: "API is running" });
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.send({ message: "Success", data: users });
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/users", async (req, res, next) => {
  try {
    const { name, age } = req.body;

    const user = new User({ name, age });

    await user.save();

    res.send({ status: "User created", data: user });
  } catch (error) {
    const err = new Error(error.message);

    err.status = 400;

    next(err);
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    console.log(req.params.id);

    const user = await User.findById(req.params.id);

    if (!user) res.send({ message: "No user found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.age) user.age = req.body.age;

    await user.save();

    res.send({ message: "Successfully updated", data: user });
  } catch (error) {
    console.log(error.message);
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.remove();

    res.send({ message: "Successfully removed" });
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/:id", (req, res) => {
  res.send({
    body: req.body,
    params: req.params,
    query: req.query,
  });
});

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .send({ error: { status: err.status, message: err.message } });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
