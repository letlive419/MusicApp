import React, { useEffect } from "react";
import axios from "axios";



function Home () {
    
    useEffect(() => {
        async function getToken() {
            const response = await axios.post(url1, request_data, config);
            
                return response.data.access_token;
                
                }
            

        const fetchData = async () => {
        const token = await getToken()
        console.log(token)
        axios.get("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb",{headers: {"Content-Type": "application/x-www-form-urlencoded", Authorization: "Bearer " + token}})
        .then((response) => {
            console.log(`Recommendation response: `, response)
           
                })
            }
        fetchData()
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

const url1 = "https://accounts.spotify.com/api/token"
    
const request_data = {
    grant_type: "client_credentials",
    client_id:process.env.REACT_APP_CLIENT_ID,
    client_secret:process.env.REACT_APP_CLIENT_SECRET
}

const config = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    }

    
    
    return(
        <div>
            <h1>Music Spotify API</h1>
        </div>
    )
}

export default Home;