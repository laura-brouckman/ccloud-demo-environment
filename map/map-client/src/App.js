import { useEffect, useState } from "react";
import "./index.css";
import { io } from "socket.io-client";
import { Map } from "./Map";

const socket = io("http://localhost.:3000");

function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messagesByDriverId, setMessagesByDriverId] = useState({});
  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    socket.on("location_update", (msg) => {
      const { driverid } = msg;
      setMessagesByDriverId((prevMessages) => ({
        ...prevMessages,
        [driverid]: msg,
      }));
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pong");
    };
  }, []);

  return { socketData: messagesByDriverId, isConnected };
}

function App() {
  const { socketData, isConnected } = useSocket();
  if (!isConnected) {
    return <div>Connecting websocket...</div>;
  }

  return <Map data={socketData} />;
}

export default App;
