const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const uuid = require("uuid")

const rooms = [];

const callHandler = (socket) => {
  const createRoom = ({ userName, userId, calledId, signalData, creatorSocketId }) => {
    const roomId = uuid.v4()
    rooms.push({ creatorUserName: userName, creatorUserId: userId, calledId, roomId, creatorSignal: signalData, creatorSocketId });

    io.emit("room-added", rooms)
    socket.emit("room-created", roomId)
  }

  const joinRoom = ({ userName, userId, roomId, signalData }) => {
    const room = rooms.find(item => item.roomId === roomId);
    console.log(room, signalData)
    io.to(room.creatorSocketId).emit("user-joined", { signalData, userName, userId });
  }

  socket.on("create-room", createRoom)
  socket.on("joined-room", joinRoom)
}

app.get("/", (_, res) => {
  res.send("Server is running");
});

app.use(cors);

const port = 8080;

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  callHandler(socket)
  socket.on("disconnect", () => {
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
})