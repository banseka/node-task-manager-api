const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("./taskModel");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("enter a valide emaiil address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      trim: true,
      validate(value) {
        if (value.includes("password")) {
          throw new Error("password should not include the keyword password");
        }
      },
    },
    age: {
      type: Number,
      default: 10,
      validate(value) {
        if (value < 0) {
          throw new Error("age cannot be a negative number");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true,
  }
);

//vitual tasks User relation
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "createdBy",
});

//hash plain password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
  }

  next();
});

//geting user public profile sent only
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar
  return userObject;
};
//generating authentication tokens
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.jwt);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//finding user credentials for login
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("unable to login");
  }
  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("unable to login");
  }
  return user;
};
//delete all tasks a user created when the user is removed

userSchema.pre("remove", async function (next) {
  const user = this;
  Task.deleteMany({ createdBy: user._id });
  next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
