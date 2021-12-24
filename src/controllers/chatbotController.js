require("dotenv").config();
// cài đặt request để sử dụng api của bên thứ 3 ở đây là facebook npm install request
const request = require("request")

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

            //khi nguời dùng gửi tin nhắn tới page entry.messageing[0] sẽ lấy thông tin tin nhắn gửi tới trong đó thuộc tính sender.id là PSID của người gửi qua đó lấy thông tin người gửi
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

};
// xử lý tin nhắn gửi tới
function handleMessage(sender_psid, received_message) {
    let response;

    // Checks if the message contains text
    if (received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
        }
    } else if (received_message.attachments) { // nếu tin nhắn gửi tới là file đính kèm thì xử lý thế nào
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Đây có phải bức ảnh bạn gửi?", //đây là tiêu đề chính của tin nhắn trả lời khi tin nhắn tới là file đính kèm
                        "subtitle": "Ấn vào button ở dưới để trả lời.", //tiêu để phụ dùng để hướng dẫn người gửi tin nhắn bấm nút
                        "image_url": attachment_url,
                        "buttons": [{
                                "type": "postback",
                                "title": "Yes!", // có thể chỉnh sửa để chuyển sang tiếng việt
                                "payload": "yes", // không thay ở đây payload giống như là id của button
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Send the response message
    callSendAPI(sender_psid, response);
}
// hàm callSendAPI để gửi api tới server facebook sử dụng để gửi tin nhắn
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid // xác định người nhận bằng sender_psid
        },
        "message": response // nội dung gửi tin nhắn
    };
    // sử dụng thư viện request đã cài ở trên để send api
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
// xử lý khi người dùng tao tác bấm nút trong tin nhắn gửi tới
function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Thanks!" }
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}
module.exports = {
    getHomePage: getHomePage,
    getWebhook: getWebhook,
    postWebhook: postWebhook
}