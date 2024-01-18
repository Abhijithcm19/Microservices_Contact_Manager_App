const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../database");
const { JWT_SECRET } = require("../config");
const { subscribe } = require("../routes/userRoutes");

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userAvailable = await UserModel.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);
  const user = await UserModel.create({
    username,
    email,
    password: hashedPassword,
  });

  console.log(`User created ${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data us not valid");
  }
  res.json({ message: "Register the user" });
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  console.log("twt secret ", JWT_SECRET);
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const user = await UserModel.findOne({ email });
  //compare password with hashedpassword
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      JWT_SECRET,
      { expiresIn: "35m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("email or password is not valid");
  }
});

//@desc Current user info
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

//@desc  user profile
//@route POST /api/users/profile
//@access private
const userProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;
  console.log("req. from profile.............. ", req.user);
  const userProfile = await UserModel.findById(id);
  if (!userProfile) {
    res.status(400);
    throw new Error("User not found");
  }
  res.status(200).json(userProfile);
});

//@desc  user favourite user info
//@route GET /api/users/current
//@access private
const userFavourite = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const userProfile = await UserModel.findById(id).populate("favourite");
  if (!userProfile) {
    res.status(400);
    throw new Error("User not found");
  }
  res.status(200).json(userProfile.favourite);
});

const appEvents = asyncHandler(async (req, res, next) => {
  const { payload } = req.body;
  console.log("====User Service Received Event====", payload);
  subscribeEvents(payload);
  res.status(200).json(payload);
});

const subscribeEvents = async (payload) => {
  console.log("User Subscribe Event Triggered");
  const { event, contact } = payload;
  switch (event) {
    case "ADD_TO_FAVOURITE":
    case "REMOVE_FROM_FAVOURITE":
      manageFavourite(event, contact);
      break;
    case "ADD_CONTACT":
    case "UPDATE_CONTACT":
    case "DELETE_CONTACT":
      manageContact(event, contact);
      break;
    default:
      break;
  }
};

//@desc manage favourite contacts
const manageContact = async (event, { userId, _id, name, email, phone }) => {
  console.log("I am in manage contact", userId);
  const contact = { _id, name };
  const userProfile = await UserModel.findById(userId).populate("contact");
  if (userProfile) {
    let contactList = userProfile.contact;
    if (event === "ADD_CONTACT") {
      contactList.push(contact);
    } else {
      console.log("THe contactList is : ", contactList);
      let index = contactList.findIndex(
        (item) => item._id.toString() === contact._id.toString()
      );
      console.log("The index is : ", index);
      if (event === "UPDATE_CONTACT") {
        console.log("The current value is : ", contactList[index]);
        contactList[index] = contact;
      }
      if (event === "DELETE_CONTACT") {
        contactList.splice(index, 1);
      }
    }
    userProfile.contact = contactList;
    await userProfile.save();
  }
};

//@desc manage favourite contacts
const manageFavourite = async (event, { userId, _id, name, email, phone }) => {
  const contact = { _id, name, email, phone };
  const userProfile = await UserModel.findById(userId).populate("favourite");
  if (userProfile) {
    let favourite = userProfile.favourite;
    if (favourite.length > 0) {
      let isPresent = false;
      favourite.map((item) => {
        if (
          item._id.toString() === contact._id.toString() &&
          event === "REMOVE_FROM_FAVOURITE"
        ) {
          favourite.splice(favourite.indexOf(item), 1);
          isPresent = true;
        } else {
          isPresent = true;
        }
      });
      if (!isPresent) {
        favourite.push(contact);
      }
    } else {
      favourite.push(contact);
    }
    userProfile.favourite = favourite;
  }
  const updatedUserprofile = await userProfile.save();
};

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  userProfile,
  userFavourite,
  appEvents,
  subscribeEvents,
};
