const express = require("express");
let configViewEngine = (app) => {
    app.use(express.static("./src/public")); //định nghĩa đường dẫn tĩnh cho css js imgs
    app.set("view engine", "ejs");
    app.set("views", "./src/views"); //định nghĩa đường dẫn tĩnh cho các file view
};
module.exports = configViewEngine;