const express = require("express");
const chatbotController = require("./../controllers/chatbotController");
let router = express.Router(); // định nghĩa router
let initWebRoutes = (app) => {
    router.get("/", chatbotController.getHomePage);
    router.get("/webhook", chatbotController.getWebhook);
    router.post("/webhook", chatbotController.postWebhook);
    return app.use("/", router);
};
module.exports = initWebRoutes