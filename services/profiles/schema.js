const { Schema, model } = require("mongoose");
const v = require("validator");

const ProfilesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    bio: {
      type: String,
    },
    area: {
      type: String,
      require: true,
    },
    image: {
      type: Buffer,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProfilesModel = model("Profiles", ProfilesSchema);
module.exports = ProfilesModel;
