const asyncHandler = require("express-async-handler");
const { ContactModel } = require("../database");
const axios = require("axios");
//@desc Get all contacts
//@route GET /api/contacts
//@access private
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await ContactModel.find({ userId: req.user.id });
  res.status(200).json(contacts);
});

//@desc Create New contact
//@route POST /api/contacts
//@access private
const createContact = asyncHandler(async (req, res) => {
  console.log("The request body is :", req.body);
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory !");
  }
  const contact = await ContactModel.create({
    name,
    email,
    phone,
    userId: req.user.id,
  });

  const payload = {
    event: "ADD_CONTACT",
    contact,
  };

  //publishUserEvent(payload);
  publishMessage(JSON.stringify(payload));
  res.status(201).json(contact);
});

//@desc Get contact
//@route GET /api/contacts/:id
//@access private
const getContact = asyncHandler(async (req, res) => {
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

//@desc Update contact
//@route PUT /api/contacts/:id
//@access private
const updateContact = asyncHandler(async (req, res) => {
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      "User doesn't have permission to update other user contacts"
    );
  }

  const updatedContact = await ContactModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  console.log("The updated contact is:", updatedContact); // Corrected variable name

  const payload = {
    event: "UPDATE_CONTACT",
    contact: updatedContact,
  };

  //publishUserEvent(payload);
  publishMessage(JSON.stringify(payload));
  res.status(200).json(updatedContact);
});

//@desc Delete contact
//@route DELETE /api/contacts/:id
//@access private
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User don't have permission to update other user contacts");
  }
  await ContactModel.deleteOne({ _id: req.params.id });
  const payload = {
    event: "DELETE_CONTACT",
    contact,
  };
  //publishUserEvent(payload);
  publishMessage(JSON.stringify(payload));
  res.status(200).json(contact);
});

//@desc add favourite contact
//@route PUT /favourite
//@access private
const addFavouriteContact = asyncHandler(async (req, res) => {
  //res.status(200).json("Added");
  const userId = req.user.id;
  const contact = await ContactModel.findById(req.body.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  console.log("The contact exisit for adding to favourite : ", contact);
  const payload = {
    event: "ADD_TO_FAVOURITE",
    contact,
  };
  console.log("the payload is : ", payload);
  //publishUserEvent(payload);
  publishMessage(JSON.stringify(payload));
  res.status(200).json(contact);
});

//@desc add favourite contact
//@route PUT /favourite
//@access private
const removeFavouriteContact = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  const payload = {
    event: "REMOVE_FROM_FAVOURITE",
    contact,
  };

  //publishUserEvent(payload);
  publishMessage(JSON.stringify(payload));
  res.status(200).json(contact);
});

const publishUserEvent = async (payload) => {
  axios.post("http://localhost:8000/api/users/app-event", { payload });
};

module.exports = {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  addFavouriteContact,
  removeFavouriteContact,
};
