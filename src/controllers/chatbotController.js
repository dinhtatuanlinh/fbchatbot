require("dotenv").config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let getHomePage = (req, res) => {
    return res.send("xin chao");
};
let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.

    // fb sẽ truyền các tham số dưới lên server để kiểm tra verify token mình đã cung cấp cho nó
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // nếu verify token cung cấp là đúng sẽ trả ra kết quả bên dưới

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};
// khi kết nối được với webhook facebook facebook sẽ kiểm tra event gửi tới đâu ví dụ như fanpage thì body.object ở dưới là page
// sau đó nó sẽ kiểm tra event là gì nếu là chat thì sẽ thực hiện như ở dưới
let postWebhook = (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            //khi nguời dùng gửi tin nhắn tới page các hàm dưới sẽ ghi lại PSID của người gửi PSID là mã nhận dạng người gửi
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

};
module.exports = {
    getHomePage: getHomePage,
    getWebhook: getWebhook,
    postWebhook: postWebhook
}