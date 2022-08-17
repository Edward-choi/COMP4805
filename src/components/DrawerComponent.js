import React, {useState} from "react";
import {Button,Drawer, List, ListItem, ListItemIcon, Icon} from '@material-ui/core'
import { ListItemText, Box, Stack} from "@mui/material";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'

//button colors
import { styled } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import { green } from '@material-ui/core/colors';

//icon
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import metafox from '../images/metafox.png'


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
                    <ListItem>
                        <Box 
                            sx={{ 
                                border: 2,
                                borderRadius: 2,
                                padding: 1,
                            }}
                        >
                            <Stack direction="row" alignItems="center" gap={2}>
                                <SettingsEthernetIcon style={{ color: 'black'}}/>
                                <ListItemText>Connect wallet</ListItemText>
                            </Stack>
                        </Box>
                    </ListItem>
                    
  
                    <ListItem>
                        <Button variant="outlined">
                            <img src={metafox} style={{ height: 45, width: 45}}/>
                            Metamask
                        </Button>
                    </ListItem> 

                
                </List>
            </Drawer>
        </div>
    )
}

export default DrawerComponent