/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Roger Wu, Student ID: 146740204, Date: April 14, 2022
*
*  Online (Heroku) URL: https://tranquil-scrubland-87036.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/YKRogerWu/web322-app.git
*
********************************************************************************/ 

const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
})

let User; // to be define on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://root:root123@cluster0.yc0lz.mongodb.net/User-Agent?retryWrites=true&w=majority");

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = (userData)=> {
    return new Promise((resolve, reject)=> {
        //console.log("The userData password is:", userData.password, userData.password2)
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        }

        bcrypt.genSalt(10).then(salt => bcrypt.hash(userData.password, salt))
            .then(hash => {
                //console.log("registerUser:", userData.password)
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save((err) => {
                    if (err) {
                        if (err.code == '11000') reject("User Name already taken");
                        reject("There was an error creating the user: " + err);
                    }
                    resolve();
                })
            })
            .catch(err => {
                console.log("There was an error encrypting the password ")
                return reject("There was an error encrypting the password " + err); // Show any errors that occurred during the process
            });
    })
}

module.exports.checkUser = (userData)=> {
    return new Promise((resolve, reject) => {

        User.find({userName: userData.userName})
        .exec()
        .then((users) => {

             bcrypt.compare(userData.password, users[0].password).then((result) => {

                if (result) {

                        users[0].loginHistory.push({ 
                            dateTime: new Date().toString(), 
                            userAgent: userData.userAgent 
                        });

                        User.updateOne(
                            {userName: users[0].userName}, 
                            {$set: {loginHistory: users[0].loginHistory }}
                        ).exec()
                        .then(()=>{
                            resolve(users[0]);
                        })
                }else
                {
                    reject("Incorrect Password for user: " + userData.userName + ". Please try again.")
                }
            });
        //if the username is yet to register
        }).catch((err) => {
            console.log("Anonymous user of username", userData.userName ,"is trying to login -", err)
            reject("Username does not exist. Please try again!", err)
        })

    })
}

