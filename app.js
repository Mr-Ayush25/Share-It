import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Server Path name
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serving Static file using express
//console.log(dirname(fileURLToPath(import.meta.url)));
app.use(express.static(join(__dirname + "/public")));

// Getting the server instance from express.
const expServer = app.listen(PORT, () => {
  console.log("Server started " + PORT);
});
//console.log(expServer);

//! Using that Express server to Work With socket connection
const io = new Server(expServer);

// When a new client connects to the server using Socket.IO
io.on("connection", (socket) => {
  // Log a message to the server console when a user connects
  //console.log("a user connected");

  // Listen for the "sender-join" event from the client
  socket.on("sender-join", function (data) {
    // Log the data received from the client
    //console.log("from Server", data);

    // Join a room identified by the 'uid' received from the client
    socket.join(data.uid);
  });

  // Listen for the "receiver-join" event from the client
  socket.on("receiver-join", function (data) {
    // Log the data received from the client
    //console.log("from Server", data);

    // Join a room identified by the 'uid' received from the client
    socket.join(data.uid);

    // Emit an "init" event to the room specified by 'sender_uid'
    // This is likely used to initialize the receiver with information from the sender
    socket.in(data.sender_uid).emit("init", data.uid);
  });

  // Listen for the "file-meta" event from the client
  socket.on("file-meta", function (data) {
    //console.log("from file-meta", data);
    // Emit an "fs-meta" event to the room identified by 'uid' with the file metadata
    socket.in(data.uid).emit("fs-meta", data.metadata);
  });

  // Listen for the "fs-start" event from the client
  socket.on("fs-start", function (data) {
    // Emit an "fs-share" event to the room identified by 'uid'
    // This event presumably signals the start of the file-sharing process
    socket.in(data.uid).emit("fs-share", {});
  });

  // Listen for the "file-raw" event from the client
  socket.on("file-raw", function (data) {
    // Emit an "fs-share" event to the room identified by 'uid' with the raw file data
    // This is likely used to share the raw content of a file during the file-sharing process
    socket.in(data.uid).emit("fs-share", data.buffer);
  });
});
