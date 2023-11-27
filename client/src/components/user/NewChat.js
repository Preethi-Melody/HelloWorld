import React, { useEffect, useState } from "react";

import ConvoListItem from "../ConvoListItem";
import SearchBar from "../misc/SearchBar";

export default function ProfileDrawer({ open, setter }) {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchUsers = () => {
    if (keyword.length < 2) {
      return null;
    }
    setLoading(true);

    fetch(`${process.env.REACT_APP_BASE_URL}/api/user/multi?keyword=${keyword}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${localStorage.getItem("app-token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      }).catch(err => {return})
  };

  useEffect(() => {
    fetchUsers();
  }, [keyword]);


  return (null);
}