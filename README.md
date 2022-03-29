# Web322-app
Quick access to my up-to-date work!
<br/>Click here:point_right::point_right: https://tranquil-scrubland-87036.herokuapp.com/

### Description
An on-course blog website project, followed by the instructions of the course, Web Programming Tools and Frameworks (code: WEB322) directed by Professor :man_teacher: Suluxan Mohanraj at Seneca College, winter term 2022

| version        | Release    | Course Progress
| -------------- | -----------| ------------------------ |
| Assignment-2   | 2022-02-14 | Node.js & JavaScript
| Assignment-3   | 2022-02-20 | Express.js & Processing Forms with Express.js
| Assignment-4   | 2022-03-13 | Handlebars.js & Relational Database
| Assignment-5   | 2022-03-29 | MongoDB & AJAX Programming
| Assignment-6   | TBD        | Managing State Information, jQuery & Bootstrap Frameworks

### Assignment-4
#### Object
Worked on template engine using **HandleBars** (file extention: .hbs).

#### Features
1. Touched up the layout of the page using handlebar by separating the navbar and their contents.
2. Improve the `add post` functionality so that timestamp can be currectly printed.
3. Blog article can be sorted and listed through the `categories` button.
4. Protected the post body with `{{#safeHTML}}` label of Strip-JS. 

####  Added Environment, Framework, or Resource
* handlebar -- template engine
* strip-js -- strips out all JavaScript code from some HTML text (to prevent `<script>` in HTML file)
---
### Assignment-3
#### Object
Build upon the foundation established in Assignment 2 by providing new routes / views to support adding new posts and querying the data. 

#### Features
1. Added a route that enable addreses to retrieve articles by their category using `/posts?category=value` where `value` is the category number.
2. Added a route that enable addreses to access a post by its ID by `/post/value` where `id` is the article number.
3. Added a route that enable addreses to access posts by their published dates (or later ones) by `/post?minDate="dateString"` where `dateString` is date string object of the format like "2020-10-15".
4. User can add posts and upload a cover picture that all new post data are stored by JSON file and the picture will be uploaded to the Cloudinary repo.

####  Added Environment, Framework, or Resource
* Cloudinary -- Cloud Storage
* Multer -- middleware for handling multipart/form-data, which is primarily used for uploading files
* streamifier -- Converts a Buffer/String into a readable stream
---
### Assignment-2 
#### Object
Create and publish a web app that uses multiple routes which serve static files (HTML & CSS) as well as create a "blog service" module for accessing data.  This will serve as the "scaffolding" for future assignments.
#### Features
1. Created new blog webpage decor with Boostrap CSS framework
2. Establish a server that returns the corespnding needs of navagation bar item with JSON-formatted data
####  Added Environment and Framework
* Environment -- Node.js
* Framework -- Express.js, Boostrap

