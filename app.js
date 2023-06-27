const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]  // Updated property name
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find().then(function(foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function() {
        console.log("Successfully saved default items to DB");
        res.redirect("/");
      }).catch(function(err) {
        console.log(err);
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  }).catch(function(err) {
    console.log(err);
  });
});

app.post("/", async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    try {
      const foundList = await List.findOne({ name: listName });
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/" + foundList.name);
    } catch (error) {
      console.log(error);
    }
  }
});

app.post("/delete", async function(req, res) {
  const CheckItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    try {
      await Item.findByIdAndRemove(CheckItemId);
      console.log("Successfully deleted the checked items");
      res.redirect("/");
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: CheckItemId } } }
      );
      res.redirect("/" + listName);
    } catch (error) {
      console.log(error);
    }
  }
});

app.get("/:CustomListName", async function(req, res) {
  const CustomListName = _.capitalize(req.params.CustomListName);
  try {
    const foundList = await List.findOne({ name: CustomListName });
    if (!foundList) {
      const list = new List({
        name: CustomListName,
        items: defaultItems
      });
      await list.save();
      res.redirect("/" + CustomListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });  // Updated property name
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/work", function(req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  item.save();
  res.redirect("/work");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
