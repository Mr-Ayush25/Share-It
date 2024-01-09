// Initializers and Constants
const createRoomBtn = document.getElementById("sender-start-con-btn");
const selectedFile = document.getElementById("file-input");
const allFiles = document.querySelector(".files-list");
const receiverButton = document.getElementById("receiver-start-con-btn");
const socket = io();
let receiverId;

//! Required Functions
// RandomId Generator
function randomIdGenerator() {
  return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
    Math.random() * 999
  )}-${Math.trunc(Math.random() * 999)}`;
}

//Sharing a file function
function shareFile(metadata, buffer, progress_node) {
  //console.log(metadata);
  socket.emit("file-meta", {
    uid: receiverId,
    metadata: metadata,
  });
  socket.on("fs-share", () => {
    let chunk = buffer.slice(0, metadata.buffer_size);
    buffer = buffer.slice(metadata.buffer_size, buffer.length);
    progress_node.innerText =
      Math.trunc(
        ((metadata.total_buffer_size - buffer.length) /
          metadata.total_buffer_size) *
          100
      ) + "%";
    if (chunk.length != 0) {
      socket.emit("file-raw", {
        uid: receiverId,
        buffer: chunk,
      });
    }
  });
}

// RoomId setup Function
function roomIdSetup() {
  const joinId = randomIdGenerator();
  //console.log(joinId);
  document.querySelector("#join-id").innerHTML = `
  <b>Room Id</b>
  <span>${joinId}</span>
  `;
  //   Socket.emit is use to emit data from client to server in arguments 1st is the emmiter event,2nd is data to emmit.
  socket.emit("sender-join", {
    uid: joinId,
  });

  // socket.on will get trigger if another user joined the room
  socket.on("init", (uid) => {
    receiverId = uid;
    //console.log(receiverId);
    document.querySelector(".join-screen").classList.remove("active");
    document.querySelector(".fs-screen").classList.add("active");
  });
}

// File Selection Handle
function fileSelector(e) {
  let file = e.target.files[0];
  if (!file) return;

  // Create a new instance of the FileReader object
  let reader = new FileReader();
  //console.log(reader);
  // Define an event handler for the 'load' event, which is triggered when the reading operation is complete
  reader.onload = function () {
    // The contents of the file are available in 'reader.result', which is a binary data representation
    // Convert the binary data to a Uint8Array, representing an array of 8-bit unsigned integers
    let buffer = new Uint8Array(reader.result);
    // Log the Uint8Array to the console
    //console.log(buffer);

    let el = document.createElement("div");
    el.classList.add("item");
    el.innerHTML = `
    <div class="progress">0%</div>
    <div class="filename">${file.name}</div>
    `;

    // adding element to screen
    allFiles.appendChild(el);

    shareFile(
      {
        filename: file.name,
        total_buffer_size: buffer.length,
        buffer_size: 2048,
      },
      buffer,
      el.querySelector(".progress")
    );
  };

  // Start the reading operation and specify that the result should be an ArrayBuffer
  reader.readAsArrayBuffer(file);
}

// Event Listeners
createRoomBtn.addEventListener("click", roomIdSetup);
selectedFile.addEventListener("change", fileSelector);
receiverButton.addEventListener("click", function () {
  // Redirect the user to ./receiver.html
  window.location.href = "./receiver.html";
});
