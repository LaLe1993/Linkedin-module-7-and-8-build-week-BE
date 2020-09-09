const { Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const v = require("validator");
const mongoose = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 3,
    },
    image: {
      type: Buffer,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: async (value) => {
          if (!v.isEmail(value)) {
            throw new Error("Email pattern is invalid");
          }
        },
      },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-Binary"],
      required: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
<<<<<<< Updated upstream
=======
    facebookId: String,
    LinkedInId: String,
>>>>>>> Stashed changes
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await UserModel.findOne({ email });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("unable to login");
    err.httpStatusCode = 401;
    throw err;
  }
  return user;
};

UserSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserSchema.post("validate", function (error, doc, next) {
  if (error) {
    error.httpStatusCode = 400;
    next(error);
  } else {
    next();
  }
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
