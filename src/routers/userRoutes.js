const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const avatar = require("../multer/avatar");
const sharp = require("sharp");
const { sendWelcomeMessage, goodByeMessage } = require("../emails/account");

const router = new express.Router();

//crzting user route
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    sendWelcomeMessage(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//login uer route
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const token = await user.generateAuthToken();
    if (!user) {
      return res.status(404).send();
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      res.status(404).send();
    }

    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//loging out a user route
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

//logout all sessions route
router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//user profile picture upload route
router.post(
  "/users/me/avatar",
  auth,
  avatar.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
      })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//deleting user profile picture route
router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//fetching user profile picture by id
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

//fetching a user route
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//updating user route
router.patch("/users/me", auth, async (req, res) => {
  const allowedUpdates = ["name", "email", "age", "password"];
  const updates = Object.keys(req.body);
  const isValide = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValide) {
    return res.status(400).send("error: invalide updates");
  }

  try {
    updates.forEach((update) => {
      return (req.user[update] = req.body[update]);
    });
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});
//deleting user route
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    goodByeMessage(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
