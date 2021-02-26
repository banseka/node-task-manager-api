const express = require("express");
const userRouter = require("./routers/userRoutes");
const taskRouter = require("./routers/taskRoutes");
const dotenv = require("dotenv");
require("./db/mongoose");

const app = express();

dotenv.config();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
