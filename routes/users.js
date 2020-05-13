const express = require("express");
const passport = require("passport");
const router = express.Router();
const bcrypt = require("bcrypt");
const {is_loggedOut,is_loggedIn,Redirect_loggedIn}=require('../utils/helper')

const User = require("../models/userModel");

router.get("/",is_loggedIn,(req,res)=>{
  res.render("index",{user:req.user.name})
})

// get all users
router.get("/users", is_loggedIn,(req, res) => {
  User.find({}).then((users) => {
    req.flash('messages',"we found following users")
    res.status(200).json({ users: users });
  });
});

router.get("/login_page",Redirect_loggedIn,(req,res)=>{
  res.render("login_page")
})

router.get("/signup_page",Redirect_loggedIn,(req,res)=>{
  res.render("signup_page")
})

router.get("/reset_page",(req,res)=>{
  res.render("reset_page")
})

// register a new user
router.post("/register", async (req, res) => {
  let errors = [];
  let { name, email, password, password2 } = req.body;
  if (!name || !email || !password || !password2)
    errors.push("fill all the fields");
  if (password.length < 6)
    errors.push("password must be at least 6 chars long");
  if (password != password2) errors.push("both passwords donot matched");
  if (errors.length > 0) {
    res.render('signup_page',{ errors: errors ,name:name,email:email,password:password,password2:password2});
  } else {
    await User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push("user already exists with that email");
        res.render('signup_page',{ errors: errors ,name:name,email:email,password:password,password2:password2});
      } else {
        password = bcrypt.hashSync(password, 10);
        const user = new User({
          name,
          email,
          password,
        });
        user.save();
        req.flash('info',"user saved")
        res.render("login_page")
      }
    });
  }
});

// login a user
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login_page",
    failureFlash: true,
  })(req, res, next);
});

// logout a user
router.get("/logout", is_loggedOut,(req, res) => {
  req.logout();
  req.flash('info',"you are logged out")
  res.redirect("/login_page")
});

// reset password
router.post("/reset", async (req, res) => {
  let errors=[]
  let { email, new_password } = req.body;
  if (!email || !new_password)
    errors.push("fill all the fields");
  if (new_password.length < 6)
    errors.push("password must be at least 6 chars long");
  if(errors.length>0)
  {
    res.render("reset_page",{email:email,new_password:new_password,errors:errors})
  }
  else{
    await User.findOne({ email: email }).then((user) => {
      if (user) {
        user.password = bcrypt.hashSync(new_password, 10);
        user.save();
        req.flash('info',"password updated")
        res.redirect("/login_page")
      } else {
        errors.push("user not found with that email")
        res.render("reset_page",{email,new_password,errors})
      }
    });
  }

});

module.exports = router;
