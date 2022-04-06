
const Sequelize = require('sequelize');

var sequelize = new Sequelize('dc2l9ovlrr78mi', 'bpxzehqmrvyoxa', 'f2b2c0e66ca5bd4691242f5aa3bf4864d91d589ec7072606a3b5638a37090407', {
    host: 'ec2-44-194-167-63.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {

    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define('Category', {
    
    category: Sequelize.STRING
})

Post.belongsTo(Category, {foreignKey: 'category'});

//module data
var posts = [];
var categories = [];

var fs = require("fs");
//const { resolve } = require('path');

//initializer
module.exports.initialize = function(){
    return new Promise((resolve, reject)=>{        
        sequelize.sync().then(()=>{
            resolve()
        }).catch((error)=>{
            console.log(error)
            reject("unable to sync the database")
        })
    })
}

//get all posts (module.exports: customized module)
module.exports.getAllPosts = function(){
    return new Promise((resolve, reject)=>{ 
        Post.findAll().then((posts)=>{
            resolve(posts)
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}

//get all published posts
module.exports.getPublishedPosts= function() {
    var publishedPosts = [];
    return new Promise((resolve, reject)=>{        
        Post.findAll({
            where:{
                published: true
            }
        }).then((posts)=>{
             //Visualize newline break on view engine
             for(let i = 0; i < posts.length; i++){
                 posts[i].body = posts[i].body.replaceAll("\n", "</br>")
             }
            resolve(posts)
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}

//get all categories
module.exports.getCategories = function(){
    return new Promise((resolve, reject)=>{        
        Category.findAll().then((data)=>{
            resolve(data)
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}
//added by assignment-4
module.exports.getPublishedPostsByCategory= function(category){
    var publishedPosts = [];
    return new Promise((resolve, reject)=>{        
        Post.findAll({
            where:{
                category: category,
                published: true
            }
        }).then((posts)=>{
            resolve(posts)
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}

module.exports.addPost = function(postData){
    return new Promise((resolve, reject)=>{        
        postData.published = (postData.published) ? true : false;
        
        for(var index in postData){
            if(postData[index]==""){
                postData[index]=null
            }
        }

        postData.postDate = getCurrentFormattedDate();
        Post.create({
            body: postData.body,
            featureImage: postData.featureImage,
            published: postData.published=(postData.published)? true:false,
            postDate: getCurrentFormattedDate(), // new Date()
            title: postData.title,
            category: postData.category
        }).then(()=>{
            console.log("Post created")
            resolve()
        }).catch((error)=>{
            console.log(error)
            reject("unable to create post")
        })
    })
}

//The function returns a current date in a format of YYYY-MM-DD
function getCurrentFormattedDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports.getPostsByCategory = function(category){
    var postsByCategory = [];
    return new Promise((resolve, reject)=>{        
        Post.findAll({
            where:{
                category: category
            }
        }).then((posts)=>{
            resolve(posts)
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}

module.exports.getPostsByMinDate = function(minDateStr){
    var postsByMinDate = [];
    return new Promise((resolve, reject)=>{   
        const { gte } = Sequelize.Op;     
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((posts)=>{
            resolve(posts)
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}

module.exports.getPostById = (id)=>{
    return new Promise((resolve, reject)=>{       
        Post.findAll({
            where:{
                id: id
            }
        }).then((post)=>{
            //Visualize newline break on view engine
            post[0].body = post[0].body.replaceAll("\n", "</br>")
            resolve(post[0])
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}

module.exports.getEdittedPostById = (id)=>{
    return new Promise((resolve, reject)=>{       
        Post.findAll({
            where:{
                id: id
            }
        }).then((post)=>{   
            resolve(post[0])
        }).catch((error)=>{
            console.log(error)
            reject("no results returned")
        })
    })
}

module.exports.editPostById = (data, id) =>{
    return new Promise((resolve, reject)=>{
        Post.update({
            body: data.body, 
            title: data.title,
            category: data.category,
            published: data.published? true: false
        },{
            where: {id: id}
        }).then((data)=>{
            console.log("Post updated successfully: " + data)
            resolve(data)
        }).catch(()=>{
            reject("Unable to update post")
        })
    })
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve, reject)=>{        

        for(var index in categoryData){
            if(categoryData[index]==""){
                categoryData[index]=null
            }
        }
        Category.create({
            category: categoryData.category
        }).then(()=>{
            console.log("Category created")
            resolve()
        }).catch((error)=>{
            console.log(error)
            reject("unable to create category")
        })
    })
}

module.exports.deleteCategoryById = (id) =>{
    return new Promise((resolve, reject)=>{
        Category.destroy({
            where:{
                id: id
            }
        }).then(()=>{
            console.log("Category deleted")
            resolve()
        })
        .catch((error)=>{
            reject("unable to delete category")
        })
    })
}

module.exports.deletePostById = (id) =>{
    return new Promise((resolve, reject)=>{
        Post.destroy({
            where:{
                id: id
            }
        }).then(()=>{
            console.log("post deleted")
            resolve()
        })
        .catch((error)=>{
            reject("unable to delete category")
        })
    })
}

