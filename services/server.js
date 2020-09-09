const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const postsRoutes = require("./posts");
const experienceRoute = require("./experience");
const commentRoutes = require("./comments");
const userRouter = require("./auth/user");
const cookieParser = require("cookie-parser");
const socketio = require("socket.io");
const server = express();

const http = require("http");
const app = http.createServer(server);
const io = socketio(app);

const passport = require("passport");
server.use(passport.initialize());

//sockets
let users = [];
io.on("connection", (socket) => {
  let id = socket.id;
  let user;
  console.log("connected");
  socket.on("connectinfo", ({ username }) => {
    let userExists = users.find((user) => user.username === username);
    if (!userExists) {
      users.push({ username, id });
    }
    io.emit("updateUsers", users);
    user = username;
    console.log(users);
  });
  socket.on("chatmessage", ({ from, text, to }) => {
    let receiver = users.find((user) => user.username === to);
    let sender = users.find((user) => user.username === from);
    io.to(receiver.id).to(sender.id).emit("message", { from, text, to });
    console.log(from);
    console.log(to);
    console.log(receiver);
  });
  //

  //
  socket.on("disconnect", () => {
    let newUsers = users.filter((element) => element.username !== user);
    io.emit("userAfterDC", newUsers);
    console.log("disconnected", newUsers);
  });
});

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
server.use(cookieParser());

const listEndpoints = require("express-list-endpoints");
const profilesRouter = require("./profiles/index");
const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers");

const port = process.env.PORT || 3005;
server.use(express.json());

server.use(cors(corsOptions));
server.use("/posts", postsRoutes);
server.use("/profile", experienceRoute);
server.use("/profile", profilesRouter);
server.use("/comments", commentRoutes);
server.use("/user", userRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

//console.log(listEndpoints(server));

const url = "mongodb://localhost:27017/LinkedIn";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      console.log(`working on port ${port}`);
    })
  );

app.listen(3007, () => {
  console.log("socket on 3007");
});
/* mongoose.connection.on("connected", () => {
  console.log("connected to atlas");
});
 */
