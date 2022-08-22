import React, { useState } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@mui/material/Divider';
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import eth from '../images/eth.png';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';

function DepositPage() {
    const { account } = useEthers()
    const MainnetBalance = useEtherBalance(account, { chainId: Mainnet.chainId })
    const balance = MainnetBalance ? parseFloat(formatEther(MainnetBalance)).toFixed(4) : "";
    const [slideIn, setSlideIn] = useState(true);
    const handleToggle = () => {
        setSlideIn(!slideIn);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" textAlign="center">
            <Grid container rowSpacing={0} columnSpacing={0}>
                <Grid item xs={12}>
                    <Box className='depositContainer1' display="inline-flex">
                        <Box textAlign="left">
                            <div className='depositFont1'>Deposit ETH</div>
                            <div className='depositFont2'>Available in Wallet: {balance}</div>
                        </Box>
                        <img src={eth} style={{ height: 45, width: 45 }} className='ethIcon' />
                    </Box>
                    
                </Grid>
                <Divider sx={{ borderBottomWidth: 5, width: "50%", borderBlockColor: "lightgray", margin: "auto" }} onClick={handleToggle} style={{cursor:'pointer'}}/>
                <Grid item xs={12}>
                    <Collapse in={slideIn} timeout={500} >
                        <Box className='depositContainer2' display="inline-flex">
                            <Box textAlign="left">
                                <div className='depositFont1'>Deposit ETH</div>
                                <div className='depositFont2'>Available in Wallet: {balance}</div>
                            </Box>
                            <img src={eth} style={{ height: 45, width: 45 }} className='ethIcon' />
                            
                        </Box>
                        <Divider sx={{ borderBottomWidth: 5, width: "50%", borderBlockColor: "lightgray", margin: "auto" }}/>
                    </Collapse>
                </Grid>

                <Grid item xs={12}>
                    <Box className='depositContainer3' display="inline-flex" onClick={handleToggle}>
                        <Box textAlign="left">
                            <div className='depositFont1'>Deposit ETH</div>
                            <div className='depositFont2'>Available in Wallet: {balance}</div>
                        </Box>
                        <img src={eth} style={{ height: 45, width: 45 }} className='ethIcon' />
                    </Box>
                </Grid>
            </Grid>
            {/* <Box className='depositContainer1' display="inline-flex">
                <Box>
                    <div className='depositFont1'>Deposit ETH</div>
                    <div className='depositFont2'>Available in Wallet: {balance}</div>
                </Box>
                <img src={eth} style={{ height: 45, width: 45 }} className='ethIcon' />

            </Box> */}
        </Box>
    )
}

export default DepositPage;