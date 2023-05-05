const express = require("express");
const bodyParser = require("body-parser");
const mongooose = require("mongoose");
const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine','ejs');

mongooose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser :true});

const itemSchema = {
    name : String
};
const Item = mongooose.model("Item",itemSchema);


const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item" 
});

const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {
   Item.find().then(function (foundItems) {
      if(foundItems.length===0){                               // checking the array initally 0 and only add the data one time 
         Item.insertMany(defaultItems).then(function () {
            console.log("Successfully saved defult items to DB");
          }).catch(function (err) {
            console.log(err);
          });
          res.redirect("/");        
      }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
   }).catch(function (err) {
     console.log(err);
   });
 });

 app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const item = new Item({
       name: itemName
    });
    item.save();
    res.redirect("/");
 });
 
 app.post("/delete",function(req,res){
   const CheckItemId = req.body.checkbox;
   Item.findByIdAndRemove(CheckItemId).then(function(){
      console.log("Sucessfully deleted the checked items");
      res.redirect("/");
   }).catch(function(err){
      console.log(err);
   });
 });

app.get("/work", function(req, res) {
    Item.find({}, function(err, foundItems) {
       if (err) {
          console.log(err);
       } else {
          res.render("list", {listTitle: "Work List", newListItems: foundItems});
       }
    });
 });

 app.post("/work", function(req, res) {
    const itemName = req.body.newItem;
    const item = new Item({
       name: itemName
    });
    item.save();
    res.redirect("/work");
 });

app.listen(3000,function(){
    console.log("Server started on port 3000");
});
