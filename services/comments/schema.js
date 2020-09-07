const { Schema, model } = require("mongoose");
const ProfilesModel = require("../profiles/schema");

const commentSchema = new Schema(
  {
    comment: {
      type: String,
    },
    username: String,
    postId: String,
    user: ProfilesModel.schema,
  },
  { timestamps: true }
);

const commentModel = model("comment", commentSchema);
module.exports = commentModel;
