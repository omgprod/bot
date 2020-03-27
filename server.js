const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();

const dialogFlowAccessToken = '103553404623466';
const facebookAccessToken = 'EAADPZB26NL4ABAPZBIv5cOFjrc9EF6kdkGfrmzZCqWNlrPvFZAJTLBf5FXgHLG9PT6A8Mj1meUsQRlSG0JxF4DsADFgeiWtV2ZAnu8YlcZAXFzsZCyHRLUh6TircP1weYIe534R7daPiIAZBx1IkxS3Nw0q5kZBB6FBRHTp6WhBR6xAZDZD';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
    let VERIFY_TOKEN = "EAADPZB26NL4ABAPZBIv5cOFjrc9EF6kdkGfrmzZCqWNlrPvFZAJTLBf5FXgHLG9PT6A8Mj1meUsQRlSG0JxF4DsADFgeiWtV2ZAnu8YlcZAXFzsZCyHRLUh6TircP1weYIe534R7daPiIAZBx1IkxS3Nw0q5kZBB6FBRHTp6WhBR6xAZDZD"
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            res.sendStatus(403);
        }
    }
    //if (req.query['hub.challenge']) res.send(req.query['hub.challenge']);
});

app.post('/webhook', (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {

            let webhook_event = entry.messaging[0];
            fetch('https://api.dialogflow.com/v1/query?v=20170712', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${dialogFlowAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: webhook_event.message.text,
                    sessionId: webhook_event.sender.id
                })
            })
            .then(res => res.json())
            .then((json) => {
                let sessionId = json.sessionId;
                let answer = json.result.fulfillment.speech;

                fetch(`https://graph.facebook.com/v2.6/me/messages?access_token=${facebookAccessToken}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "recipient":{
                          "id": sessionId
                        },
                        "message":{
                          "text": answer
                        }
                    })
                })
                .then(res => res.json())
                .then((json) => {
                    res.status(200);
                });
            });
            /*

            /DialogFlow

            */

        });
    } 
});

app.listen(3000, () => console.log('Chatbot started!'));