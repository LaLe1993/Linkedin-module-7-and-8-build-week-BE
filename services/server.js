const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const postsRoutes = require("./posts");
const experienceRoute = require("./experience");
const commentRoutes = require("./comments");

const server = express();
const listEndpoints = require("express-list-endpoints");
const profilesRouter = require("./profiles/index");
const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers");

dotenv.config();

const port = process.env.PORT;
server.use(express.json());

server.use(cors());
server.use("/posts", postsRoutes);
server.use("/profile", experienceRoute);
server.use("/profile", profilesRouter);
server.use("/comments", commentRoutes);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

console.log(listEndpoints(server));

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
mongoose.connection.on("connected", () => {
  console.log("connected to atlas");
});
