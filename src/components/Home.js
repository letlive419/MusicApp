import React, { useEffect, useState, useRef } from "react";
import axios from "axios";





function Home() {
  
  const [token, setToken] = useState(null);
  const [items, setItems] = useState([])
  const playerRef = useRef(null);  // Store the player instance
  const [deviceID, setdeviceID] = useState(null)
  const [volume, setVolume] = useState(.05)
  const [title, setTitle] = useState("Please connect to Spotify via Spotify Connect")
  
    useEffect(() => {
        const getToken = async() => {
        const response = await axios.get("http://localhost:8080/token", {withCredentials: true})
        setToken(response.data)
        }    
        if(!token) {
          getToken()
        }
    }, [])


   useEffect(() => {
    if (token) {
    
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.onload = () => { console.log(token)};
      document.head.appendChild(script)
      if (!playerRef.current) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log("mounted spotify web playback")
        const usertoken = token;
        const player = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(usertoken); },
          volume: 0.5
      })

     // Ready event
     player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
        setdeviceID(device_id);
        playerRef.current = player;  // Store player in ref
    });

    // Not Ready event
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Error listeners
    player.addListener('initialization_error', ({ message }) => {
      console.error('Initialization Error:', message);
    });
    player.addListener('authentication_error', ({ message }) => {
      console.error('Authentication Error:', message);
    });
    player.addListener('account_error', ({ message }) => {
      console.error('Account Error:', message);
    });
    player.addListener('player_state_changed', ({track_window}) => {
      if (track_window) {
        setTitle(track_window.current_track.name)
        console.log(track_window)
      }
    })
  
    // Connect the player
    player.connect();

    

    
  }
  };
}
   },[token])

   
  
    function login() {
      window.location.href = "http://localhost:8080/home";
    }

    async function getTracks() {
      const response = await axios.get("http://localhost:8080/tracks",{withCredentials: true})
      console.log("Get Tracks, Your doing great!")
      if (items.length < 5) {
        const newItems = response.data.items?.map((tracks) => (
          {key: tracks.id, name: tracks.name, uri: tracks.uri}
        ))
        
        setItems([...items, ...newItems])
       
      }
      
    
        
      
    }
  
    function handleVolumeChange(event) {
      const newVolume = parseFloat(event.target.value);
      setVolume(newVolume);
      if (playerRef.current) {
        playerRef.current.setVolume(newVolume)
      } else {
        console.log("Player not ready")
      }
    };

    async function handlePlay(uri,title) {
      
        if (playerRef.current) {
              await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`, {uris: [uri]},
              {headers: 
              {Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
        }}
        
        );
        setTitle(title)
        console.log("track playing")
                
            } else {
              console.log("Player is not ready");
            }
      
      
    }
    async function handleResume() { 
      if (playerRef.current) {
        await playerRef.current.resume() 
      }
      else {
        console.log("Player not ready")
      }
    }
    async function handlePause(){
      
        if (playerRef.current) {
          await playerRef.current.pause()
        }
        else {
          console.log("Player not ready")
        }
    }

 
    

  return (
    <div>
      <h1>Music Spotify API</h1>
      {!token ? <button onClick={login}>Login</button> : <button onClick={getTracks}>Get Tracks</button> }
      <h1>Top Tracks!</h1>
      {items.map((item) => {
        return(
        <div>
        <button id={item.uri} onClick={() =>handlePlay(item.uri, item.name) }>{item.name}</button> 
        
        
        </div>

        )

      })}

      
      {(items.length > 1) ?
      
        <div>
        <h1> {title} </h1>
        <button  onClick={async () => {
          if (playerRef.current) {
            await playerRef.current.togglePlay();
          }
        }}>Play Song</button>
        <button  onClick={handlePause}>Pause</button>
        <button  onClick={handleResume}>Resume</button>
        <input type="range" value={volume} min={0} max={1} step={.01} onChange={handleVolumeChange}></input>
        </div>
       :
       console.log("Nothing to display") 
      }
    </div>
  );
}

export default Home;
