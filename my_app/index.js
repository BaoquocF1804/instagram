const express = require("express");
const mongoose = require("mongoose");
const route = require("./src/routes");
const bodyParser = require("body-parser");
const http = require("http");
const socketio = require("socket.io");
const chatIo = require("./src/io/chat");
const { ExpressPeerServer } = require("peer");
const app = express();
const server = http.createServer(app);
require("dotenv").config();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const io = new socketio.Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(express.json());

//Connect to mongodb
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log("can't connect");
  });

//MVC to create REST API
route(app);

chatIo(io);
server.listen(process.env.PORT, () =>
  console.log("listening on port " + process.env.PORT)
);

//Peer

const peerExpress = require("express");

const peerApp = peerExpress();

const peerServer = require("http").createServer(peerApp);

const peerPort = 4001;

peerApp.use("/peer", ExpressPeerServer(peerServer, { debug: true }));
peerServer.listen(peerPort);

peerServer.on("connection", (client) => {
  console.log("peer client", client.id);
});
peerServer.on("disconnect", (client) => {
  console.log("peer client leave");
});
