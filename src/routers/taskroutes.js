const express = require("express");
const Task = require("../models/taskModel");
const auth = require("../middleware/auth");

const router = new express.Router();

//creating tasks route
router.post("/tasks", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, createdBy: req.user._id });
    await task.save();
    res.send(task);
    console.log(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//get all tasks created by a specific user
//GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc or esc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    // const user = await User.findById(req.user._id);
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    const tasks = req.user.tasks;
    res.send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

//getting tasks by id route
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, createdBy: req.user._id });
    res.status(404).send(task);
  } catch (error) {
    res.status(500).send();
  }
});

//updating tasks route
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const allowedUpdates = ["description", "completed"];
  const updates = Object.keys(req.body);
  const isValide = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValide) {
    return res.status(400).send("error: invalide updates");
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => {
      return (task[update] = req.body[update]);
    });
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send();
  }
});

//deleting task by id route
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, createdBy: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
