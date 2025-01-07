//module imports
require('dotenv').config();
const querystring= require("querystring");
const express = require("express");
const cors = require("cors")
const app = express();
const axios = require("axios")
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const scope = "streaming playlist-read-private";
const redirect_uri = "http://localhost:8080/callback"
var token = null
//Setup
app.use(cors())

  

const PORT = process.env.PORT || 8080;
//routes

app.get("/home",(req, res) => {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: client_id,
          scope: scope,
          redirect_uri: redirect_uri,
        }));
})

app.get("/callback", async(req, res) => {
    const code = req.query.code || null;
    
    if (code) {
        const response = await axios.post("https://accounts.spotify.com/api/token",
        querystring.stringify({
            code:code,
            redirect_uri:redirect_uri,
            grant_type:"authorization_code"
            }),
        {
            headers: {
                "content-type":"application/x-www-form-urlencoded",
                Authorization: "Basic "+ (new Buffer.from(client_id + ":" + client_secret).toString("base64"))}}
    )
   token = response.data;
   res.redirect("http://localhost:3000")
  
}
})

app.get("/token", (req, res) => {
    res.send(token)
})



//port listening
app.listen(PORT, () => {
    console.log(`listening on port .... ${PORT}`)
})