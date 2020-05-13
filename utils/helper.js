const is_loggedIn=function (req,res,next) {
    if(req.isAuthenticated()){
        next();
    }
    else
    res.redirect("/login_page")
}

const is_loggedOut=function (req,res,next) {
    if(!req.isAuthenticated()){
        req.flash('info',"already logged out")
        res.redirect("/login_page")
    }
    next()
}

const Redirect_loggedIn=function (req,res,next) {
    if(req.isAuthenticated()){
        res.redirect("/")
    }
    next()
}
module.exports={is_loggedIn,Redirect_loggedIn,is_loggedOut}