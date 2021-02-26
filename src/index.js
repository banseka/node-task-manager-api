const app = require('./app')

const port = process.env.PORT;

app.listen(port, () => {
  console.log("server is now running on localhost " + port);
});

// // const Task = require('./models/taskModel')
// const User = require('./models/userModel')

// const main = async () => {
//   // const task =await  Task.findById("601888c7b345bc20e05cb7d6");

//   // await task.populate('createdBy').execPopulate()
//   // console.log(task.createdBy);
//   const user = await User.findById("6018829c65c4ed2280a694ad");
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks);
// }

// main()