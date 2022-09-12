import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NFTList from './NFTList.js'
import {Network, Alchemy} from "alchemy-sdk"

import { useEthers, useEtherBalance, Mainnet, Goerli } from "@usedapp/core";
import { useEffect, useState } from 'react'
import { formatEther } from "ethers/lib/utils";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    height: '20rem',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    borderRadius: 40
}));


function HomePage() {
    const { account } = useEthers()
    const Balance = useEtherBalance(account, { refresh: 'never'})
    const [EthData, setEthData] = useState([])
    const [nfts, setNfts] = useState([])

    const settings = {
        apiKey: "6RB8WVyUkqB6YjCiiKX57HqZL7RRiVYL", // Replace with your Alchemy API Key.
        network: Network.ETH_MAINNET, // Replace with your network.
        'filters[]': 'SPAM&filters[]=AIRDROPS',
    };

    const getNftData = () => {
        const alchemy = new Alchemy(settings);
        alchemy.nft.getNftsForOwner(account).then(function (response) {
            const data = response.ownedNfts
            setNfts(data)
            // debugger
        }).catch(function (error){
            console.error(error);
        });
    }

    useEffect(() => {
        //Get ETH price data
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@ticker')
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // debugger
            setEthData(data)
        }

    }, [])

    useEffect(() => {
        getNftData()
    }, [account])

    return (
        <Box className='homePage'>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

                <Grid item md={4} xs={12}>
                    <Item style={{ height: "41rem" }}>
                        <div>
                            <AccountBalanceIcon className='homePageTitle' />
                            <div className='homePageFont1 homePageTitle'>My NFTs</div>
                            <div>&nbsp;Total ERC721 Token</div>
                        </div>
                        <Divider sx={{ borderBottomWidth: 5 }} />
                        <Box sx={{ height: "31rem" }}>
                            <List>
                                {nfts.map((nft, index) => {
                                    return <NFTList nft={nft} key={index} />
                                })}
                            </List>
                        </Box>
                        <Divider sx={{ borderBottomWidth: 5 }} />
                        <div className='bottomButtonContainer'>
                            <Button variant="contained" component={Link} to="/viewnft" style={{
                                borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "70%"
                            }}>
                                Deposit NFTs
                            </Button>
                        </div>
                    </Item>
                </Grid>

                <Grid item md={4} xs={12}>
                    <Grid container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Item>
                                <div >
                                    <AddCircleOutlineIcon className='homePageTitle' />
                                    <div className='homePageFont1 homePageTitle'>My Account</div>
                                    <div>&nbsp;Total Balance</div>
                                </div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Box sx={{ height: "10rem" }}></Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" component={Link} to="/deposit" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "40%"
                                    }}>
                                        Deposit ETH
                                    </Button>
                                    <Button variant="outlined" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "40%"
                                    }}>
                                        Withdraw ETH
                                    </Button>
                                </div>
                            </Item>
                        </Grid>
                        <Grid item xs={12}>
                            <Item>
                                <div >
                                    <HistoryIcon className='homePageTitle' />
                                    <div className='homePageFont1 homePageTitle'>History</div>
                                    <div>&nbsp;Record</div>
                                </div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Box sx={{ height: "10rem" }}></Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "70%"
                                    }}>
                                        View History
                                    </Button>
                                </div>
                            </Item>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item md={4} xs={12}>
                    <Grid container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Item>
                                <div>
                                    <VerticalAlignBottomIcon className='homePageTitle' />
                                    <div className='homePageFont1 homePageTitle'>My Borrows</div>
                                    <div>&nbsp;Total Debt</div>
                                </div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Box sx={{ height: "10rem" }}></Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" component={Link} to="/borrow" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "40%"
                                    }}>
                                        Borrow ETH
                                    </Button>
                                    <Button variant="outlined" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "40%"
                                    }}>
                                        My Borrows
                                    </Button>
                                </div>
                            </Item>
                        </Grid>

                        <Grid item xs={12}>
                            <Item>
                                <div >
                                    <AccountBalanceWalletIcon className='homePageTitle' />
                                    <div className='homePageFont1 homePageTitle'>My Wallet</div>
                                    <div>&nbsp;{account}</div>
                                </div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Box sx={{ height: "10rem", padding: "1rem" }}>
                                    {Balance && <Box>ETH Balance: {parseFloat(formatEther(Balance)).toFixed(4)} Ξ</Box>}
                                    Ethereum Price: ${parseFloat(EthData.c).toFixed(2)} <br />
                                    24h Price Change: ${parseFloat(EthData.p).toFixed(2)} <br />
                                    24h Percentage Change: {parseFloat(EthData.P).toFixed(2)}%

                                </Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "70%"
                                    }}>
                                        View On Ethereum
                                    </Button>
                                </div>
                            </Item>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default HomePage;