const { Schema, model } = require("mongoose");

const msgSchema = new Schema(
  {
    from: {
      type: String,
    },
    text: String,
    to: {
      type: String,
    },
    time: String,
  },
  { timestamps: true }
);

const msgModel = model("message", msgSchema);
module.exports = msgModel;
