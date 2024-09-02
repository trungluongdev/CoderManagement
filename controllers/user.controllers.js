const { sendResponse, AppError } = require("../helpers/utils.js");
const { default: mongoose } = require("mongoose");
const User = require("../models/User.js");

const userController = {};
//Create a user
userController.createUser = async (req, res, next) => {
  try {
    const info = req.body;
    if (!info) throw new AppError(402, "Bad Request", "Create user Error");
    if (!info.name) throw new AppError(410, "Bad Request", "Missing Name");
    const created = await User.create(info);
    sendResponse(
      res,
      200,
      true,
      { user: created },
      null,
      "Create User Successfully"
    );
  } catch (error) {
    next(error);
  }
};

//Get All Users
userController.getUsers = async (req, res, next) => {
  const allowedFilter = ["name", "tasks", "role", "search"];
  let newFilter = {};

  try {
    if (Object.keys(req.query).length > 0) {
      const query = req.query;
      var checkFilter = Object.keys(query);
      const checkedFilter = checkFilter.filter((filter) =>
        allowedFilter.includes(filter)
      );
      if (checkedFilter.length === 0) {
        throw new AppError(402, "Bad Request", "Invalid Query");
      }
      if (query.search) {
        newFilter.name = { $regex: new RegExp(query.search, 'i') };
      } else {
        let replacedFilters = Object.keys(query).map((key) => {
          const newKey = checkedFilter[key] || key;
          return { [newKey]: query[key] };
        });
        newFilter = replacedFilters.reduce((a, b) => Object.assign({}, a, b));
      }
    }
    const listOfFound = await User.find(newFilter);
    if (listOfFound.length === 0) {
      sendResponse(res, 200, true, null, "Couldn't find user ");
    }
    sendResponse(
      res,
      200,
      true,
      { users: listOfFound },
      null,
      "Get User List Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

//Search user by his/her name
userController.searchUser = async (req, res, next) => {
  const name = req.query.search;
  // const name = req.params.name;
  try {
    if (!name) {
      throw new AppError(402, "Bad Request", "Name parameter is missing");
    }
    const foundUsers = await User.find({ name: { $regex: new RegExp(name, 'i') } });
    if (foundUsers.length === 0) {
      return sendResponse(res, 200, true, [], null, "No users found with the provided name");
    }
    sendResponse(
      res,
      200,
      true,
      { user: found },
      null,
      "Get User Successfully!"
    );
  } catch (error) {
    next(error);
  }
};
//Get User Task
userController.getUserTask = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(420, "Bad Request", "Invalid ID");
    }
    const found = await User.findById(id).populate("tasks");
    const tasks = found.tasks.length > 0 ? found.tasks : [];
    sendResponse(
      res,
      200,
      true,
      { tasks: found.task || "no task" },
      null,
      "Get User Tasks Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
