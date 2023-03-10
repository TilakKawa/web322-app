/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Tilak Rajeshkumar Kawa Student ID: 164542219_ Date: 19th Feb 2023
*
*  Online (Cyclic) Link: https://fantastic-cyan-blackbuck.cyclic.app
*
********************************************************************************/ 

var express = require("express");
var path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { initialize, getAllPosts, getPublishedPosts, getCategories ,addPost, getPostsByMinDate, getPostById, getPostsByCategory} = require("./blog-service.js");

app.use(express.static("public"));

var HTTP_PORT = process.env.PORT || 8080;
cloudinary.config({
    cloud_name: 'da1grmqxq',
    api_key: '699698182773399',
    api_secret: 'Y76Q1PkGSWg7R6LeHQ3Jkh5hax4',
    secure: true
});
const upload = multer();

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
  getPublishedPosts()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send("Error reading data");
    });
});

app.get("/posts", function (req, res) {
  if (req.query.category) {
    getPostsByCategory(req.query.category)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      });
  } 
  
  else if (req.query.minDate) {
    getPostsByMinDate(req.query.minDate)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      });
  } 
  
  else {
    getAllPosts()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      });
  }
});

app.get("/post/:value", (req, res) => {
    getPostById(req.params.value)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send("Error reading data");
      })    
  })

app.get("/categories", function (req, res) {
  getCategories()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send("Error reading data");
    });
});

app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req)
    .then((uploaded) => {
      req.body.featureImage = uploaded.url;
      const date = new Date()
      let blogPost = {};

      blogPost.body = req.body.body;
      blogPost.title = req.body.title;
      blogPost.postDate = Date.now();
      blogPost.category = req.body.category;
      blogPost.featureImage = req.body.featureImage;
      blogPost.published = req.body.published;

      if (blogPost.title) {
        addPost(blogPost);
      }
      res.redirect("/posts");
    })
    .catch((err) => {
      res.send(err);
    });
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    res.send("Error reading data");
  });