const express = require("express");
const body_Parser = require("body-parser");
var http = require('http');
require("dotenv").config(); // đọc dữ liệu tròn file .env

const viewEngine = require("./config/viewEngine");
const initWebRoutes = require("./routes/web");


//  npm instal @babel/core @babel/node @babel/preset-env // cài thêm packet này để dọc import trong es6

let app = express();
// config view engine
viewEngine(app);
//parse request to json
app.use(body_Parser.json()); //
app.use(body_Parser.urlencoded({ extended: true }));

// init webroute
initWebRoutes(app);

let port = process.env.PORT || 8080; //process.env.PORT là biến được khai báo trong file .env

app.listen(port, () => {
    console.log("chatbot is running at: http://localhost:" + port);
});