import React, { useContext, useEffect, useState } from "react";
import Navbar from "../misc/Navbar";
import SearchBar from "../misc/SearchBar";
import { Box } from "@mui/system";

import {
  List,
  Typography,
} from "@mui/material";
import ConvoListItem from "../ConvoListItem";
import AppContext from "../../AppContext";

export default function Left() {
    
  const {conversations , fetchConversations} = useContext(AppContext)
    
  useEffect(() => {
    fetchConversations();
  }, []);
 
  return (
    <Box sx={{ borderRight: "1px solid #BEBEBE", height: "100%" }}>
      <Navbar />
      <SearchBar />
      {conversations ? (<List sx={{ overflowY: "auto", height: "82%" }}>
        {conversations.map((conversation) => (
          <ConvoListItem  convo={conversation} key={conversation._id}  />
        ))}
      </List>) : (<Typography  variant='subtitle1' color="dark">No conversations</Typography>)}
    </Box>
  );
}