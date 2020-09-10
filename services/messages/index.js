const express = require("express");
const msgModel = require("./schema");

const router = express.Router();

router.get("/", async (req, res) => {
  const messages = await msgModel.find();
  res.send(messages);
});

router.post("/", async (req, res) => {
  console.log(req.body);
  const newMsg = await new msgModel(req.body);
  newMsg.save();
  res.send("ok");
});

module.exports = router;
