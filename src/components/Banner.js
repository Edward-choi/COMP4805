import * as React from 'react';
import Box from '@mui/material/Box';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonIcon from '@mui/icons-material/Person'



function Banner(props) {
    var icon;
    var type = props.type;
    switch (type) {
        case "Borrow":
            icon = <VerticalAlignBottomIcon sx={{ fontSize: "2rem" }} />;
            break;
        case "Deposit":
            icon = <AddCircleOutlineIcon sx={{ fontSize: "2rem" }} />;
            break;
        case "Dashboard":
            icon = <PersonIcon sx={{ fontSize: "2rem" }} />;
            break;
    }
    return (
        <Box className='banner' display="flex" justifyContent="center" alignItems="center">
            <div className='heading'>{icon}<div>{props.type}</div></div>
        </Box>
    )
}

export default Banner;