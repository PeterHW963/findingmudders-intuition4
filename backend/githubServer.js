var express = require('express');
var cors = require('cors');
const fetch = (...args) => 
    import('node-fetch').then(({default: fetch}) => fetch(...args));
var bodyParser = require('body-parser');

require('dotenv').config();


const CLIENT_ID = process.env.VITE_GITHUB_CLIENT_KEY;
const CLIENT_SECRETS = process.env.VITE_GITHUB_CLIENT_SECRETS;

var app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/getAccessToken', async function (req, res) {
    console.log("client ID " + CLIENT_ID + " client secrets " + CLIENT_SECRETS);
    console.log(req.query.code);

    const params =  "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRETS + "&code=" + req.query.code;

    await fetch("https://github.com/login/oauth/access_token" + params, {
        method: "POST",
        headers: {
            "Accept": "application/json"
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        res.json(data)
    })
})

app.get('/getUserData', async function (req, res) {
    req.get("Authorization"); //bearer access token
    await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
            "Authorization" : req.get("Authorization") //bearer access token
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        res.json(data)
    })
})

app.listen(4000, function () {
    console.log("CORS server running on port 4000");
})