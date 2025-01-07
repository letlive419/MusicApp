import React, { useEffect } from "react";
import axios from "axios";
import querystring from "querystring";



function Home() {
  const client_id = process.env.REACT_APP_CLIENT_ID;
  var redirect_uri = "http://localhost:8080/callback"
  var scope = "user-read-private";
    
    useEffect(() => {
       
         
    },[])
 
    function handleTop5() {
      window.location.href = "http://localhost:8080/home";
    }

    async function getTracks() {
      const response = await axios.get("http://localhost:8080/token")
      console.log(response)
    }
  
  return (
    <div>
      <h1>Music Spotify API</h1>
      <button onClick={handleTop5}>Login</button>
      <button onClick={getTracks}>Get Tracks</button>
    </div>
  );
}

export default Home;
