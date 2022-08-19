import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    height: '20rem',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: 15
}));

function HomePage() {
    return (
        <Box className='homePage'>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={4}>
                    <Item style={{ height: "100%" }}>
                        <div className='homePageFont1'>My NFTs</div>
                        <Divider sx={{ borderBottomWidth: 5 }} />
                    </Item>
                </Grid>
                <Grid item xs={4}>
                    <Grid container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Item>
                                <div className='homePageFont1'>My Deposits</div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                            </Item>
                        </Grid>
                        <Grid item xs={12}>
                            <Item>
                                <div className='homePageFont1'>History</div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
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
                            </Item>
                        </Grid>
                        <Grid item xs={12}>
                            <Item>
                                <div className='homePageFont1'>My Wallet</div>
                                <Divider sx={{ borderBottomWidth: 5 }} />
                            </Item>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default HomePage;