import React, {useState} from "react";
import {Button,Drawer, List, ListItem, ListItemIcon} from '@material-ui/core'
import { ListItemText } from "@mui/material";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'

//button colors
import { styled } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import { green } from '@material-ui/core/colors';

//button icon
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[300],
    },
}));

const GreenTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: green[500],
      color: 'rgba(255,255,255, 1)',
      boxShadow: theme.shadows[1],
      fontSize: 15,
    },
}));

const DrawerComponent = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    
    return (
        <div>
            <GreenTooltip title="Wallet">
                <ColorButton size="large" color="white" aria-label="wallet" onClick={()=>setOpenDrawer(true)}>
                    <AccountBalanceWalletOutlinedIcon />
                </ColorButton>
            </GreenTooltip>
            <Drawer
                onClose={()=>setOpenDrawer(false)}
                open={openDrawer}
                anchor='right'
            >
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <ListItemText>Connect Wallet</ListItemText>
                        </ListItemIcon>
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default DrawerComponent