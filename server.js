var express = require("express");
var path = require("path");
var app = express();
const { initialize, getAllPosts, getPublishedPosts, getCategories } = require("./blog-service.js");
var posts = require("./data/posts.json");
var categories = require("./data/categories.json");

app.use(express.static("public"));

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}


app.get("/", function (req, res) {
    res.redirect("/about");
});

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function (req, res) {
    getPublishedPosts().then((data) => {
        res.send(data);
    })
        .catch((err) => {
            res.send(err);
        })
});

app.get("/posts", function (req, res) {
    getAllPosts().then((data) => {
        res.send(data);
    })
        .catch((err) => {
            res.send(err);
        })
});

app.get("/categories", function (req, res) {
    getCategories().then((data) => {
        res.send(data);
    })
        .catch((err) => {
            res.send(err);
        })
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
})