import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import { Link } from 'react-router-dom';

import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NFTList from './NFTList.js'
import { Network, Alchemy } from "alchemy-sdk"

import { useEthers, useEtherBalance, useCall } from "@usedapp/core";
import { useEffect, useState, useContext } from 'react'
import { formatEther } from "ethers/lib/utils";

import Moment from 'react-moment';
import axios from 'axios';
import abi from '../contracts/Bank/abi.json';
import ContractAddress from './ContractAddress.json'
import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { Context } from './Context.js';

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
    const { account, library } = useEthers();
    const Balance = useEtherBalance(account, { refresh: 'never' })

    const [EthData, setEthData] = useState([])
    const [nfts, setNfts] = useState([])
    const link = "https://goerli.etherscan.io/address/" + account
    const [results, setResults] = useState([])
    const contractAddress = ContractAddress.bank;
    var contract = null;
    if (library) {
        contract = new Contract(contractAddress, abi, library.getSigner());
    }
    const ABI = new Interface(abi);
    const [depositBalance, setDepositBalance] = useState(0);
    const [userPrinciple, setUserPrinciple] = useState(0);
    const [APY, setAPY] = useState(0);
    const [mortgage, setMortgage] = useState([])
    const [mortNFTs, setMortNFTs] = useState([])
    // const [price, setPrice] = useState(0)
    var [totalDebt, setTotalDebt] = useState(0)

    //Fixed on 12/10/2022 11pm
    // const { principle } = useCall(account && contractAddress && {
    //     contract: new Contract(contractAddress, ABI),
    //     method: 'getUserPrinciple',
    //     args: [account]
    // }) ?? {};
    // const principleBalance = principle ? principle[0] : 0;

    const { own, setOwn } = useContext(Context)

    const displayableFunctions = ['buyNFT', 'depositETH', 'liquidateNFT', 'repayLoan', 'startLoan', 'withdraw'];

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
        const settings = {
            apiKey: "6RB8WVyUkqB6YjCiiKX57HqZL7RRiVYL", // Replace with your Alchemy API Key.
            network: Network.ETH_GOERLI, // Replace with your network.
        };
        const getNftData = () => {
            if (account) {
                const alchemy = new Alchemy(settings);
                alchemy.nft.getNftsForOwner(account).then(function (response) {
                    const data = response.ownedNfts
                    setNfts(data)
                    // debugger
                }).catch(function (error) {
                    console.error(error);
                });
            }
        }
        getNftData()
    }, [account])

    useEffect(() => {
        const apikey = "F8BTXW9R9QHDY2IUTMNDTZKGX423D7SYGV";
        const endpoint = "https://api-goerli.etherscan.io/api"
        if (account) {
            axios
                .get(endpoint + `?module=account&action=txlist&address=${account}&apikey=${apikey}&sort=desc`)
                .then(response => {
                    let temp = [];
                    response.data.result.forEach((req) => {
                        if (displayableFunctions.includes(req.functionName.substring(0, req.functionName.indexOf("("))) && req.to === ContractAddress.bank) {
                            temp.push(req);
                        }
                    })
                    setResults(temp)
                });
        }
    }, [account]);

    useEffect(() => {
        if (contract && account) {
            async function getBalance() {
                const balance = await contract.getUserBalance(account);
                setDepositBalance(balance);
                console.log(balance);
            }
            getBalance();
        }
    }, [account]);

    useEffect(() => {
        if (contract && account) {
            async function getBalance() {
                const balance = await contract.getUserPrinciple(account);
                setUserPrinciple(balance);
            }
            async function getPrinciple() {
                const p = await contract.getUserPrinciple(account);
                setUserPrinciple(p);
            }
            getBalance();
            getPrinciple();
        }
    }, [account]);

    useEffect(() => {
        if (contract && account) {
            async function getAPY() {
                const apy = await contract.APY();
                console.log("apy: ",parseFloat(formatEther(apy)));
                setAPY(parseFloat(formatEther(apy)));
            }
            getAPY();
        }
    }, [account]);

    useEffect(() => {
        if (contract && account) {
            async function getMortgage() {
                const mortgages = await contract.getAllUserLoan(account);
                setMortgage(mortgages);
            }
            getMortgage();
        }
    }, [account]);

    useEffect(() => {
        const settings = {
            apiKey: "6RB8WVyUkqB6YjCiiKX57HqZL7RRiVYL", // Replace with your Alchemy API Key.
            network: Network.ETH_GOERLI, // Replace with your network.
        };
        async function getNFTs(address, tokenId, i) {
            if (account && mortgage && account) {
                const alchemy = new Alchemy(settings);
                alchemy.nft.getNftMetadata(address, tokenId).then(function (response) {
                    const name = response.rawMetadata.name;
                    const image = response.rawMetadata.image;
                    const newObj = Object.assign({ name: name, image: image }, mortgage[i]);
                    mortNFTs.push(newObj)
                    totalDebt += parseFloat(formatEther(newObj.outstandBalance))
                    console.log(totalDebt);
                    setTotalDebt(totalDebt);
                    setMortNFTs(mortNFTs);
                    console.log(mortNFTs);
                }).catch(function (error) {
                    console.error(error);
                });
            }
        }
        for (var i = 0; i < mortgage.length; i++) {
            getNFTs(mortgage[i].nft.nftContractAddr.toString(), mortgage[i].nft.tokenId.toString(), i)
        }
        console.log(mortgage.length);
    }, [account, mortgage])

    // useEffect(() => {
    //     if (contract && account) {
    //         async function getPrice() {
    //             const floorPrice = await contract.nftFloorPrice();
    //             setPrice(formatEther(floorPrice));
    //         }
    //         getPrice();
    //     }
    // }, [account]);

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
                            <List key='hi3'>
                                {nfts.map((nft, index) => {
                                    return index < 5 && <NFTList nft={nft} key={index} />
                                })}
                            </List>
                        </Box>
                        <Divider sx={{ borderBottomWidth: 5 }} />
                        <div className='bottomButtonContainer'>
                            <Button variant="contained" component={Link} to="/viewnft" onClick={() => setOwn(true)} style={{
                                borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "70%"
                            }}>
                                View My NFTs
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
                                    <div className='homePageFont1 homePageTitle'>My Account</div><br />
                                    <div style={{ display: "inline-flex" }}>&nbsp;Total Balance</div>
                                    <div style={{ display: "inline-flex", float: "right" }}>{depositBalance ? parseFloat(formatEther(depositBalance)).toFixed(4) : 0} ETH</div>
                                </div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Box sx={{ height: "10rem", padding: "1rem" }}>
                                    <Grid container rowSpacing={2}>
                                        <Grid item xs={8}>
                                            {Balance && <Box>Total value: </Box>}
                                            APR: <br />
                                            {Balance && <Box>Total interest: </Box>}
                                        </Grid>
                                        <Grid item xs={4}>
                                            {Balance && <Box>${depositBalance ? (parseFloat(formatEther(depositBalance)).toFixed(4) * parseFloat(EthData.c).toFixed(2)).toFixed(4) : 0}</Box>}
                                            {APY && <Box>{APY ? APY.toFixed(2).toString() + " %" : "Please Connect Your Wallet"}</Box>}
                                            {Balance && <Box>{(depositBalance && userPrinciple) ? (parseFloat(formatEther(depositBalance)) - parseFloat(formatEther(userPrinciple))).toFixed(4) : 0} ETH</Box>}
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" component={Link} to="/deposit" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "40%"
                                    }}>
                                        Deposit ETH
                                    </Button>
                                    <Button variant="outlined" component={Link} to="/withdraw" style={{
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
                                <Box sx={{ height: "10rem", padding: "1rem", paddingTop: 0 }}>
                                    <List key='hi'>
                                        <Grid container>
                                            <Grid item xs={3}>
                                                <div style={{ fontWeight: 'bolder' }}>Time</div>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <div style={{ fontWeight: 'bolder' }}>Action</div>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <div style={{ fontWeight: 'bolder' }}>Amount</div>
                                            </Grid>
                                        </Grid>
                                        {Object.values(results).map((result, index) => {
                                            return index < 5 && account && (
                                                <Grid container rowSpacing={2}>
                                                    <Grid item xs={3}>
                                                        <Moment unix format="YYYY/MM/DD">{result.timeStamp}</Moment>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        {result.functionName ? result.functionName.substring(0, result.functionName.indexOf("(")) : ""}
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        {result.value ? parseFloat(formatEther(result.value)).toFixed(4) : 0} ETH
                                                    </Grid>
                                                </Grid>
                                            );
                                        })}
                                    </List>
                                </Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" component={Link} to="/history" style={{
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
                                    <div className='homePageFont1 homePageTitle'>My Borrows</div><br />
                                    <div style={{ display: "inline-flex" }}>&nbsp;Total Debt</div>
                                    <div style={{ display: "inline-flex", float: "right" }}>{depositBalance ? totalDebt.toFixed(4) : 0} ETH</div>
                                </div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Box sx={{ height: "10rem", padding: "1rem", paddingTop: 0 }}>
                                    <List key='hi2'>
                                        <Grid container>
                                            <Grid item xs={3}>
                                                <div style={{ fontWeight: 'bolder' }}>Name</div>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <div style={{ fontWeight: 'bolder' }}>Debt</div>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <div style={{ fontWeight: 'bolder' }}>Next payment</div>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <div style={{ fontWeight: 'bolder' }}>Default</div>
                                            </Grid>
                                        </Grid>
                                        {Object.values(mortNFTs).map((nft, index) => {
                                            return index < 5 && account && (
                                                <Grid container rowSpacing={2}>
                                                    <Grid item xs={3}>
                                                        {nft.name}
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        {nft.outstandBalance ? parseFloat(formatEther(nft.outstandBalance)).toFixed(4) : 0} ETH
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        {new Date(parseInt(nft.nextPayDay.toString() + "000")).toLocaleDateString("en-US")}
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        {nft.defaultCount.toString()}
                                                    </Grid>
                                                </Grid>
                                            );
                                        })}
                                    </List>
                                </Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" component={Link} to="/marketplace" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "40%"
                                    }}>
                                        Start Loan
                                    </Button>
                                    <Button variant="outlined" component={Link} to="/viewnft" onClick={() => setOwn(false)} style={{
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
                                    <Grid container rowSpacing={2}>
                                        <Grid item xs={8}>
                                            {Balance && <Box>ETH Balance: </Box>}
                                            Ethereum Price: <br />
                                            24h Price Change: <br />
                                            24h Percentage Change:
                                        </Grid>
                                        <Grid item xs={4}>
                                            {Balance && <Box>{parseFloat(formatEther(Balance)).toFixed(4)} Ξ</Box>}
                                            ${parseFloat(EthData.c).toFixed(2)} <br />
                                            ${parseFloat(EthData.p).toFixed(2)} <br />
                                            {parseFloat(EthData.P).toFixed(2)}%
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <div className='bottomButtonContainer'>
                                    <Button variant="contained" style={{
                                        borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "70%"
                                    }} target="_blank" component="a" href={link}>
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