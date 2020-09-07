const { Schema, model } = require("mongoose");
const ProfilesModel = require("../profiles/schema");

const postSchema = new Schema(
  {
    text: {
      type: String,
    },
    username: String,
    image: {
      type: Buffer,
    },
    user: ProfilesModel.schema,
  },
  { timestamps: true }
);

const postModel = model("post", postSchema);
module.exports = postModel;
