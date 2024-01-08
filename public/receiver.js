// Initializers and Constants
const connectRoomBtn = document.getElementById("receiver-start-con-btn");
const socket = io();
let senderId;
let fileShare = {};

//! Required Functions
// RandomId Generator
function randomIdGenerator() {
  return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
    Math.random() * 999
  )}-${Math.trunc(Math.random() * 999)}`;
}

// RoomId setup Function
function roomIdSetup() {
  senderId = document.querySelector("#join-id").value;
  //console.log(senderId);
  if (!senderId) {
    alert("Enter room ID to join");
  }
  const joinId = randomIdGenerator();
  //console.log(joinId);
  //   Socket.emit is use to emit data from client to server in arguments 1st is the emmiter event,2nd is data to emmit.
  socket.emit("receiver-join", {
    uid: joinId,
    sender_uid: senderId,
  });

  document.querySelector(".join-screen").classList.remove("active");
  document.querySelector(".fs-screen").classList.add("active");
}

// Function to listen for incoming file
(() => {
  socket.on("fs-meta", function (metadata) {
    fileShare.metadata = metadata;
    fileShare.transmitted = 0;
    fileShare.buffer = [];
    let el = document.createElement("div");
    el.classList.add("item");
    el.innerHTML = `
        <div class="progress">0%</div>
        <div class="filename">${metadata.filename} </div>`;
    document.querySelector(".files-list").appendChild(el);

    fileShare.progress_node = el.querySelector(".progress");

    socket.emit("fs-start", {
      uid: senderId,
    });
  });

  socket.on("fs-share", (buffer) => {
    //console.log(buffer);
    fileShare.buffer.push(buffer);
    fileShare.transmitted += buffer.byteLength;
    fileShare.progress_node.innerText =
      Math.trunc(
        (fileShare.transmitted / fileShare.metadata.total_buffer_size) * 100
      ) + "%";
    if (fileShare.transmitted == fileShare.metadata.total_buffer_size) {
      download(new Blob(fileShare.buffer), fileShare.metadata.filename);
      fileShare = {};
    } else {
      socket.emit("fs-start", {
        uid: senderId,
      });
    }
  });
})();

// Event Listeners
connectRoomBtn.addEventListener("click", roomIdSetup);
