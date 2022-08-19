import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    height: '20rem',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: 40
}));

function HomePage() {
    return (
        <Box className='homePage'>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={4}>
                    <Item style={{ height: "100%" }}>
                        <div className='homePageFont1'>My NFTs</div>
                        <Divider sx={{ borderBottomWidth: 5 }} />
                        <Divider sx={{ borderBottomWidth: 5 }} className='bottomDivider2' />
                        <Button variant="contained" className='bottomDivider2' style={{
                            borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "10px", marginTop: "12px", width: "50%"
                        }}>
                            View My NFTs
                        </Button>
                    </Item>
                </Grid>
                <Grid item xs={4}>
                    <Grid container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Item>
                                <div className='homePageFont1'>My Deposits</div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Divider sx={{ borderBottomWidth: 5 }} className='bottomDivider' />
                                <Button variant="contained" className='bottomDivider' component={Link} to="/deposit" style={{
                                    borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "10px", marginTop: "12px", width: "30%"
                                }}>
                                    Deposit ETH
                                </Button>
                                <Button variant="outlined" className='bottomDivider' style={{
                                    borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "10px", marginTop: "12px", width: "30%"
                                }}>
                                    My Deposits
                                </Button>
                            </Item>
                        </Grid>
                        <Grid item xs={12}>
                            <Item>
                                <div className='homePageFont1'>History</div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Divider sx={{ borderBottomWidth: 5 }} className='bottomDivider' />
                                <Button variant="contained" className='bottomDivider' style={{
                                    borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "10px", marginTop: "12px", width: "50%"
                                }}>
                                    View History
                                </Button>
                            </Item>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    <Grid container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Item>
                                <div className='homePageFont1'>My Borrows</div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Divider sx={{ borderBottomWidth: 5 }} className='bottomDivider' />
                                <Button variant="contained" className='bottomDivider' component={Link} to="/borrow" style={{
                                    borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "10px", marginTop: "12px", width: "30%"
                                }}>
                                    Borrow ETH
                                </Button>
                                <Button variant="outlined" className='bottomDivider' style={{
                                    borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "10px", marginTop: "12px", width: "30%"
                                }}>
                                    My Borrows
                                </Button>
                            </Item>
                        </Grid>
                        <Grid item xs={12}>
                            <Item>
                                <div className='homePageFont1'>My Wallet</div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                                <Divider sx={{ borderBottomWidth: 5 }} className='bottomDivider' />
                                <Button variant="contained" className='bottomDivider' style={{
                                    borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "10px", marginTop: "12px", width: "50%"
                                }}>
                                    View On Ethereum
                                </Button>
                            </Item>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default HomePage;