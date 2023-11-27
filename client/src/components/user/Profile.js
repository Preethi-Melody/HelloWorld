import React, { useContext, useState } from "react";
import AppContext from "../../AppContext";


export default function ProfileDrawer({ open, setter }) {
    const { uploadImage, user, setUserData } = useContext(AppContext)
    const [loading, setLoading] = useState(false)
    const [changing, setChanging] = useState(false);

    const [menu, setMenu] = useState({
        anchorEl: null,
        open: false
    });
    const handleClick = event => {
        setMenu({ open: true, anchorEl: event.currentTarget });
    };
    
    const handleClose = () => {
        setMenu({ open: false });
    };

    const handleImage = (file) => {
        setLoading(true)
        uploadImage(file).then(url => {
            setLoading(false);
            updateUser({ "pfp": url })
        }).catch((err) => {
            setLoading(false);
            console.log(err);
        });
    }

    const updateUser = (data) => {
        fetch(process.env.REACT_APP_BASE_URL + '/api/user/', {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                "authorization": `Bearer ${localStorage.getItem('app-token')}`
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(data => {
            setUserData(data.user)
        }).catch(err => console.log(err.message))
    }
    return null;
}