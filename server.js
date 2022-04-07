/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Roger Wu, Student ID: 146740204, Date: March 29, 2022
*
*  Online (Heroku) URL: https://tranquil-scrubland-87036.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/YKRogerWu/web322-app.git
*
********************************************************************************/ 

const express = require("express");
const app = express();

//use env variable file
const env = require('dotenv')
env.config()

const path = require("path");
const blog_service = require("./blog-service");

const multer = require("multer"); // to deal with image upload
const upload = multer(); // no { storage: storage } since we are not using disk storage

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const stripJs = require('strip-js');
app.use(express.urlencoded({extended: true})); // to stop category add a new image <AS-5>

const exphbs = require('express-handlebars');
const { database } = require("pg/lib/defaults");

app.engine('.hbs', exphbs.engine({extname: '.hbs', //extname: change the default ext name from ".handlebars" to ".hbs"
    defaultLayout: 'main', //defaultLayout: the name of the default layout (site's frame) is "main", just made it visible here!
    helpers:{
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
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
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
        
    }
    
}));
app.set('view engine', '.hbs');

cloudinary.config({
    cloud_name: 'dwbnafaji',
    api_key: '187948162784954',
    api_secret: 'OqsKW35x7LEzgpAQhW-p2LgJAWc',
    secure: true
});


//define local host port
const HTTP_PORT = process.env.PORT || 8080;

//to return CSS file
app.use(express.static('public')); 

function onHttpStart(){
    console.log("Express http server listening on:", HTTP_PORT)
    return new Promise(function(req, res){
        blog_service.initialize().then(function(data){
            console.log(data)
        }).catch(function(err){
            console.log(err);
        })
    })
}

//Assignment-4 added
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});



//routing
app.get("/", function(req, res){
    res.redirect("/blog");
});
app.get("/about", function(req, res){
    //res.sendFile(path.join(__dirname,"./views/about.html"));
    res.render("about.hbs");
});

app.get('/blog', async (req, res) => {

    let viewData = {}
    let posts = {}
    let noOfCate;
    try{
        if(req.query.category){
            posts = await blog_service.getPublishedPostsByCategory(req.query.category)
        }else{
            posts = await blog_service.getPublishedPosts();
        }
        viewData.posts = posts
        // sort the published posts by descending postDate
        viewData.posts.sort((a,b) => b.id - a.id);
        // set the newest post to display
        viewData.post = viewData.posts[0];

    }catch(err){
        viewData.message = "no results";
    }

    try{
        let categories = await blog_service.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    for (var i = 0; i < viewData.categories.length; i++) 
    {
        var accu = 0;

        for (var j = 0; j < viewData.posts.length; j++) 
        {
            if(viewData.posts[j].category == viewData.categories[i].id)
                accu++;
        }
        viewData.categories[i].postNo = accu
    }
    res.render("blog", {data: viewData})
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
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
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
        viewData.post = await blog_service.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
    
    try{
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog.hbs", {data: viewData})
});

app.get("/posts", function(req, res){

    if(req.query.category){
        blog_service.getPostsByCategory(req.query.category).then((data)=>{
            res.render("posts",{ posts: data });
        })
    }
    else if(req.query.minDate){
        blog_service.getPostsByMinDate(req.query.minDate).then((data)=>{
            res.render("posts",{ posts: data });
        })
    }
    else{
        blog_service.getAllPosts().then((data)=>{
            //chronologically rearrange the post order
            var rever_data = data.reverse();

            res.render("posts",{ posts: rever_data });
        }).catch(function(err){
            res.render("posts.hbs", {message: "no results"}); 
        })
    }
});

app.get("/post/:id", (req, res)=>{
    blog_service.getPostById(req.params.id).then((data)=>{
        res.json(data)
    }).catch((error)=>{
        console.log(error)
        res.status(404).sendFile(path.join(__dirname,"./views/status-404.html"))
    })
    
})

app.get("/categories", function(req, res){
    blog_service.getCategories().then((data)=>{
        if(data[0]){
            res.render("categories", {categories: data})
        }
        else{
            res.render("categories.hbs", {message: "no results"});
        }
    }).catch(function(err){
        res.render("categories.hbs", {message: "no results"});
    });
});

app.get("/posts/add", (req, res)=>{
    blog_service.getCategories().then((data)=>{
        res.render("addPost", {categories: data});
    }).catch((error)=>{
        res.render("addPost", {categories: []}); 
    })
})

app.post("/posts/add", upload.single("featureImage"), (req, res)=>{

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog_service.addPost(req.body).then((data)=>{
            res.redirect("/posts");
        }).catch((error)=>{
            res.status(500).send(error)
        })
    });
    
})

var editting_post_id; //targeting the post which is under edition

app.get("/posts/edit/:id", async (req, res)=>{
    let viewData = {} 

    blog_service.getEdittedPostById(req.params.id).then((data)=>{
        if(data){
            editting_post_id = data.id
            viewData.post = data;
        }
        else{
            viewData.post = null;
        }
    }).catch(()=>{
        viewData.post = null;
    }).then(blog_service.getCategories).then((data)=>{
        viewData.categories = data
        for(let i = 0; i < viewData.categories.length; i++){
            if(viewData.categories[i].id == viewData.post.category){
                //**to offer the "selected" attribute in HTML 
                viewData.categories[i].selected = true; 
            }
        }
    }).catch(()=>{
        viewData.categories = [];
    }).then(()=>{
        if(viewData.post == null){
            res.status(404).send("Post not found")
        }
        else{
            res.render("editPost.hbs", {viewData: viewData})
        }
    })
})

app.post("/posts/edit", (req, res)=>{
    blog_service.editPostById(req.body, editting_post_id).then(()=>{
        res.redirect("/blog/" + editting_post_id)
    }).catch(()=>{
        res.status(500).send(error)
    })
})

app.get("/categories/add", (req, res)=>{
    res.render("addCategory.hbs");
})

app.post("/categories/add", (req, res)=>{
        
    blog_service.addCategory(req.body).then((data)=>{
        res.redirect("/categories");
    })
})

app.get("/categories/delete/:id", (req, res)=>{
    blog_service.deleteCategoryById(req.params.id).then(()=>{
        res.redirect("/categories")
    }).catch(()=>{
        res.status(500).render("categories", {message: "Unable to Remove Category / Category not found"})
    })
})

app.get("/posts/delete/:id", (req, res)=>{
    blog_service.deletePostById(req.params.id).then(()=>{
        res.redirect("/posts")
    }).catch(()=>{
        res.status(500).render("posts", {message: "Unable to Remove Post / Post not found"})
    })
})

//no matching route (404 route)
app.get('*', function(req, res){
    var errMessage = { message_404: "Sorry, the page you requested does not exist."};
    res.render("status-404.hbs", {
        msg: errMessage
    });
  });

//build the connection
app.listen(HTTP_PORT, onHttpStart);
