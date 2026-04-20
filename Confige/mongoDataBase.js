require("dotenv").config();
const mongoose = require("mongoose");

const Mongo_url = process.env.MongoDB_URL;
mongoose.connect(Mongo_url);

const db = mongoose.connection;

db.on("connected", () => {
    console.log("Mongo Db successfully connected");
});

db.on("disconnect", () => {
    console.log("Mongo Db disconnected successfully");
})

db.on("error" , (err) => {
    console.log("Mongo Db have an Error : ", (err));
})

module.exports = db;