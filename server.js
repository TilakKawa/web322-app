/*********************************************************************************
*  WEB322 – Assignment 04
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
const blogData = require("./blog-service");
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const { initialize, getAllPosts, getPublishedPosts, getCategories ,addPost, getPostsByMinDate, getPostById, getPostsByCategory} = require("./blog-service.js");

app.use(express.static("public"));

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

var HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
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
  res.redirect("/blog");
});

app.get("/about", function (req, res) {
  res.render("about");
});



app.get('/blog', async (req, res) => {
  
  // Declare an object to store properties for the view
  let viewData = {};
  
  try{
    // declare empty array to hold "post" objects
        let posts = [];
        
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
          }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
          }
          
          // sort the published posts by postDate
          posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
          
          // get the latest post from the front of the list (element 0)
          let post = posts[0]; 
          
          // store the "posts" and "post" data in the viewData object (to be passed to the view)
          viewData.posts = posts;
          viewData.post = post;
          
        }catch(err){
        viewData.message = "no results";
    }
    
    try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();
      
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    }catch(err){
      viewData.categoriesMessage = "no results"
    }
    
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
    
  });
  
  app.get("/posts", function (req, res) {
    if (req.query.category) {
      getPostsByCategory(req.query.category)
      .then((data) => {
        
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        res.render("posts", { message: "no results"});
      });
    } 
    
    else if (req.query.minDate) {
      getPostsByMinDate(req.query.minDate)
      .then((data) => {
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        res.render("posts", { message: "no results"});
      });
  } 
  
  else {
    getAllPosts()
    .then((data) => {
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        res.render("posts", { message: "no results"});
      });
    }
  });
  
  app.get('/blog/:id', async (req, res) => {
    
    // Declare an object to store properties for the view
    let viewData = {};
    
    try{
      
      // declare empty array to hold "post" objects
      let posts = [];
      
      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
        // Obtain the published "posts" by category
        posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
        // Obtain the published "posts"
        posts = await blogData.getPublishedPosts();
      }
      
      // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
  
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        
      }catch(err){
        viewData.message = "no results";
    }
    
    try{
      // Obtain the post by "id"
      viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
      viewData.message = "no results"; 
    }
    
    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();
        
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
      }catch(err){
        viewData.categoriesMessage = "no results"
      }
      
      // render the "blog" view with all of the data (viewData)
      res.render("blog", {data: viewData})
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
      res.render("categories", {categories: data});
    })
    .catch((err) => {
      res.render("categories", {message: "no results"});
    });
});

app.get("/posts/add", (req, res) => {
  res.render("addPost");
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
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

app.use(( req ,res) => 
{
  res.render("404");
});


app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { 
    navLink: function(url, options)
    {
      return '<li' + 
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) 
    {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
    },

    safeHTML: function(context){
      return stripJs(context);
    }
  
  }
}));
initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    res.send("Error reading data");
  });