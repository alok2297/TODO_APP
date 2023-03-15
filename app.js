const express = require("express");
const bodyParser = require("body-parser");

const app = express();
var items=["Buy food","Cook food","Eat food"];

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine','ejs');

app.get("/",function(req,res){
    var today = new Date();
    var cureentday = today.getDay();
    var day="";
    
    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    var day = today.toLocaleDateString("en-US",options);
    res.render("list",{kindOfDay:day, newListItems:items});
});

app.post("/",function(req,res){
    var item = req.body.newItem;
    //res.render("list",{newListItem:item});
    items.push(item);
    res.redirect("/");
});

app.listen(3000,function(){
    console.log("Server started on port 3000");
});
