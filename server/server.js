//** Using express session, cookies and mongodb to handle multiple sessions */

//module imports
require('dotenv').config();
const querystring= require("querystring");
const express = require("express");
const cors = require("cors")
const app = express();
const axios = require("axios")
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const scope = "streaming user-top-read user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state app-remote-control ";
const redirect_uri = "http://localhost:8080/callback"

const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto")
const mongoURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASS}@cluster0.tk2mf.mongodb.net/sessiondb?retryWrites=true&w=majority&appName=Cluster0`
const MongoStore = require("connect-mongo")
const mongoose = require("mongoose");
//Setup

mongoose.connect(mongoURI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true
}))
app.use(cookieParser())
app.use(
    session({
        secret:process.env.NODE_SECRET,
        resave:false,
        saveUninitialized:true,
        cookie: {
            httpOnly:true,
            maxAge:3600000
        },
        store: MongoStore.create({
            mongoUrl:mongoURI,
            collectionName:"users",
            ttl: 14*24*60*60,
        })
    })
)



function generateRandomId(length = 16) {
    return crypto.randomBytes(length).toString("base64").slice(0,length)
}

const PORT = process.env.PORT || 8080;
//routes

//user enters the home page 
app.get("/home",async(req, res) => {
    
    
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: client_id,
          scope: scope,
          redirect_uri: redirect_uri,
        }));
})
//home redirects the user to spotify and is sent to this callback
app.get("/callback", async(req, res) => {
    
    const code = req.query.code || null;
    const sessionID = req.sessionID;
   
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
   const token = await response.data.access_token;
   //callback redirects the user back to their domain
   await mongoose.connection.db.collection("users").updateOne({
    _id:sessionID},
    {$set: {"token":token}
   })
   res.redirect("http://localhost:3000")
   
}
})

//user retrieves the token used
app.get("/token", async(req, res) => {
    
    
    try {
        const session = await mongoose.connection.db.collection("users").findOne({_id: req.sessionID});
        
        if (!session || !session.token) {
            return
        }
        else {
            
            res.send(session.token)
        }
    } catch(exception) {
        
        res.send(exception)
    }
})

//user uses token to obtain tracks
app.get("/tracks", async(req, res) => {
    
    const session = await mongoose.connection.db.collection("users").findOne({_id: req.sessionID});
   
    const requestToken = session.token;
    const response = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10",{ headers: {
        Authorization: `Bearer ${requestToken}`
    }})
    res.send(response.data)
})



//port listening
app.listen(PORT, () => {
    console.log(`listening on port .... ${PORT}`)
})