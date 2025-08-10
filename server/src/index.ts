import { WebSocketServer } from "ws";
import { port } from "./config/config.js";

const wss = new WebSocketServer({ port: port });

// Store rooms as: Map<socket, Set<roomIds>>
const allRooms = new Map();

wss.on("connection", (socket) => {
  console.log("User Connected");

  allRooms.set(socket, new Set()); // initialize empty room set

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      const { roomId } = parsedMessage.payload;
      allRooms.get(socket).add(roomId);
      console.log(`User joined room: ${roomId}`);
    }

    if (parsedMessage.type === "chat") {
      const { roomId, message } = parsedMessage.payload;
      allRooms.forEach((rooms, clientSocket) => {
        if (
          clientSocket !== socket &&
          rooms.has(roomId) 
        ) {
          clientSocket.send(message);
        }
      });
    }
  });

  socket.on("close", () => {
    console.log("User disconnected");
    allRooms.delete(socket);
  });
});
