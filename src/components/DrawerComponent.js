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
import metafox from '../images/metafox.png';

//web3
import { ethers } from "ethers";
import Web3 from "web3";

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
    const [walletAddress, setWalletAddress] = useState(null);
    const [displayWalletAddress, setdisplayWalletAddress] = useState(null);
    const [walletBalance, setWalletBalance] = useState(null);

    async function handdleConnect(){
        const web3 = new Web3(Web3.givenProvider);
        const accounts = await web3.eth.requestAccounts();
        setWalletAddress(accounts[0]);
        setdisplayWalletAddress(accounts[0].substring(0,11) + "..." + accounts[0].substring(34,43));
        const balance = await web3.eth.getBalance(accounts[0]);
        setWalletBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(4));
    }

    return (
        <div>
            <GreenTooltip title="Wallet">
                <ColorButton size="large" color="white" aria-label="wallet" onClick={()=>setOpenDrawer(true)}>
                    <AccountBalanceWalletOutlinedIcon />
                </ColorButton>
            </GreenTooltip>
            <Drawer onClose={()=>setOpenDrawer(false)} open={openDrawer} anchor='right'>
                <List>
                    <ListItem>
                        <Box 
                            display="flex" justifyContent="center" minHeight="9vh"                            
                            sx={{ border: 2,borderTop: 0,borderLeft: 0,borderRight: 0,padding: 1, width: 200}}
                        >
                            <Stack direction="row" alignItems="center" gap={2}>
                                <SettingsEthernetIcon style={{ color: 'black'}}/>
                                <ListItemText>Connect wallet</ListItemText>
                            </Stack>
                        </Box>
                    </ListItem>
                    
                    <ListItem>
                        <Button variant="outlined" style={{width: 200, borderRadius: 10, borderColor: 'black'}} onClick={handdleConnect}>
                            <img src={metafox} style={{ height: 45, width: 45}}/>
                            Metamask
                        </Button>
                    </ListItem>

                    <ListItem>
                        <Box display="flex" justifyContent="center" minHeight="30vh"                        
                            sx={{ border: 2,borderRadius: 5,padding: 1,width: 200}}
                        >                      
                            <ListItemText>
                                <p>Wallet Address: {displayWalletAddress}</p>
                                <p>ETH Balance: {walletBalance}</p>
                            </ListItemText>
                            
                        </Box>
                    </ListItem>

                </List>
            </Drawer>
        </div>
    )
}

export default DrawerComponent