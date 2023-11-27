const Conversation = require("../models/conversation");
const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const fs = require('fs');

const getOrAddConversation = async (req, res) => {
  if (req.body.grp) {
    let convo = await Conversation.find({ _id: req.body.id })
      .populate("members", "-password -contacts")
      .populate("admin", "-password -contacts")
      .populate("lastMsg");
    convo = await User.populate(convo, {
      path: "lastMsg.sender",
      select: "name pfp email",
    });
    res.status(StatusCodes.OK).json({ success: true, convo });
  } else {
    let convo = await Conversation.find({
      isGroup: false,
      $and: [{ members: req.user._id }, { members: req.body.id }],
    })
      .populate("members", "-password -contacts")
      .populate("lastMsg");

    convo = await User.populate(convo, {
      path: "lastMsg.sender",
      select: "name pfp email",
    });

    if (convo.length > 0) {
      res.status(StatusCodes.OK).json({ success: true, convo });
    } else {
      const conversation = {
        members: [req.user._id, req.body.id],
      };
      let convo = await Conversation.create(conversation);
      convo = await Conversation.find({ _id: convo._id }).populate(
        "members",
        "-password -contacts"
      );
      res.status(StatusCodes.OK).json({ success: true, convo });
    }
  }
};

const getAllConversations = async (req, res) => {
  let conversations = await Conversation.find({ members: req.user._id })
    .populate("members", "-password -contacts")
    .populate("admin", "-password -contacts")
    .populate("lastMsg")
    
    .sort({ updatedAt: -1 });
  conversations = await User.populate(conversations, {
    path: "lastMsg.sender",
    select: "name pfp email",
  });
  res.status(StatusCodes.OK).json({ success: true, conversations });
};

const deleteConversation = async (req, res) => {
  const id = req.body.id;
  const user = req.user._id;
  let conversation = await Conversation.findOne({ _id: id });
    conversation = await Conversation.findOneAndDelete({ _id: id });
    res.status(StatusCodes.OK).json({ success: true, msg: "chat deleted " });
};


module.exports = {
  getOrAddConversation,
  getAllConversations,
  deleteConversation,
};