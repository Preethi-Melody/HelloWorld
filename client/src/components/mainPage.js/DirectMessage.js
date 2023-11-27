import { QuestionAnswerOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import ConversationBottomBar from "../conversation/ConversationBottomBar";
import ConversationTopBar from "../conversation/ConversationTopBar";
import Message from "../conversation/Message";
import { io } from "socket.io-client";

const endpoint = process.env.REACT_APP_BASE_URL
var tempConversation, socket;

export default function DirectMessage() {
  const { conversation, user, fetchConversations, giveNotification, setConversation } =
    useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typer, setTyper] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    tempConversation = conversation?._id;
  }, [conversation]);

  useEffect(() => {
    socket = io(endpoint);
    socket.emit("joinChat", user?._id);
    socket.on("chatJoined", (msg) => {});
  }, []);

  const fetchMessages = () => {
    if (!conversation) return;
    setLoadingMessages(true);
    fetch(`${process.env.REACT_APP_BASE_URL}/api/msg/${conversation._id}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${localStorage.getItem("app-token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.msgs);
          socket.emit("joinRoom", conversation._id);
          socket.on("roomJoined", (msg) => {
            // console.log("joined : " + msg);
          });
        }
        setLoadingMessages(false);
      });
  };

  const sendMessage = (msg, url) => {
    if (msg === "") return;
    fetch(`${process.env.REACT_APP_BASE_URL}/api/msg/${conversation._id}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${localStorage.getItem("app-token")}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        msg: msg,
        url: url,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUploading(false)
        setMessages((prev) => prev && [...prev, data.message]);
        socket.emit("sendMessage", data.message);
        fetchConversations();
        if (!data.success) {
          console.log(data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      const conversation_id = msg.conversation_id._id;
      if (conversation_id === tempConversation) {
        setMessages((prev) => prev && [...prev, msg]);
        fetchConversations();
      } else {
        fetchConversations();
        const sender = msg.sender.name;
        giveNotification("info", `New message from @${sender}`);
      }
    });
  }, []);

  useEffect(() => {
    const obj = {
      id: conversation?._id,
      typer: user,
    };
    typing === true
      ? socket.emit("Typing...", obj)
      : socket.emit("NotTyping", obj.id);
  }, [typing]);

  useEffect(() => {
    socket.on("isTyping", (obj) => {
      const typer = obj.typer;
      if (typer._id === user._id) return;
      if (obj.id !== tempConversation) return;
      setTyper(typer);
    });

    socket.on("isNotTyping", (typer) => {
      setTyper(null);
    });

    socket.on("chatCleared", (obj) => {
      if (obj.id === tempConversation) {
        setMessages([]);
      }
      fetchConversations();
    });

    socket.on("chatDeleted", (obj) => {
      if (obj.id === tempConversation) {
        setConversation(null);
      }
      fetchConversations();
      giveNotification("info", `${obj.name} deleted the chat`);
    });

  }, []);

  useEffect(() => {
    let box = conversation ? document.getElementById("messaegBox") : null;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages, typer]);

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      sx={{ height: "100%" }}
    >
      {conversation ? (
        <>
          <ConversationTopBar socket={socket} fetchMsgs={fetchMessages} />
          <Stack
            direction="column"
            sx={{ height: "82%", overflowY: "scroll", px: 4 }}
            id="msgBox"
          >
            {!loadingMessages ? (
              <>
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <Message
                      message={message}
                      self={message.sender._id === user._id ? true : false}
                      sender={message.sender}
                      key={message._id}
                    />
                  ))
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#c3c3c3",
                    }}
                  >
                    <Typography variant="h6">say hello</Typography>
                    <IconButton
                      onClick={(e) => sendMessage("Hello👋")}
                      size="large"
                      id="quickMsg"
                    >
                      👋
                    </IconButton>
                    <Typography variant="h6">to your friend</Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {typer && (
              <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                <Avatar
                  alt={`${typer?.name}`}
                  src={`${process.env.REACT_APP_BASE_URL}/${typer?.pfp}`}
                  sx={{ height: "32px", width: "32px", m: 1 }}
                />
                <Box
                  className="chat-bubble"
                  sx={{
                    bgcolor: "#d3d3d3",
                    width: "4rem",
                    display: "flex",
                    borderRadius: 1,
                    height: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Box className="typing">
                    <Box className="dot"></Box>
                    <Box className="dot"></Box>
                    <Box className="dot"></Box>
                  </Box>
                </Box>
              </Stack>
            )}
          </Stack>
          {uploading && (
                  <Stack direction="row"  sx={{ bgColor: "#03c40a" ,p : 1, mb : 1, alignSelf : 'flex-end'}}>
                    <Typography sx={{pr : 1}} variant="body1">File Uploading</Typography>
                    <CircularProgress size="1.5rem"/>
                  </Stack>
                )}
          <ConversationBottomBar
            sendMessage={sendMessage}
            setTyping={setTyping}
            setUploading={setUploading}
          />
        </>
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            opacity: "0.6",
          }}
        >
          <QuestionAnswerOutlined
            sx={{ height: "300px", width: "300px", color: "lightgreen" }}
          />
          <Typography variant="h6">
            Select a conversation and start messaging 😉
          </Typography>
        </Box>
      )}
    </Stack>
  );
}