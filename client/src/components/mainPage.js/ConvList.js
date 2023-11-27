import React, { useContext, useEffect, useState } from "react";
import Navbar from "../misc/Navbar";
import SearchBar from "../misc/SearchBar";

import {
  List,
  Typography,
} from "@mui/material";
import ConvoListItem from "../ConvoListItem";
import AppContext from "../../AppContext";

export default function Left() {
    
  const {conversations , fetchConvos} = useContext(AppContext)
    
  useEffect(() => {
      fetchConvos();
  }, []);
 
  return (null);
}