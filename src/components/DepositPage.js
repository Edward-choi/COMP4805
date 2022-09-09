import React, { useState } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import { useEthers, useEtherBalance, Goerli, useTokenBalance } from "@usedapp/core";
import { formatEther, formatUnits } from "ethers/lib/utils";
import eth from '../images/eth.png';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@mui/material/Button';

function DepositPage() {
    const { account } = useEthers()
    const GoerliBalance = useEtherBalance(account, { chainId: Goerli.chainId })
    const balance = GoerliBalance ? parseFloat(formatEther(GoerliBalance)).toFixed(4) : "";
    const [slideIn, setSlideIn] = useState(true);
    const [depositValue, setDepositValue] = useState(0);
    const depositInput = depositValue === 0 || depositValue ? depositValue : '';
    const handleToggle = () => {
        setSlideIn(!slideIn);
    };

    const erc20Balances = useTokenBalance("0x4526a0a7ffb468e4933f51c05a09493d7e65e1bb", account);
    const useStyles = makeStyles({
        input: {
            '& input[type=number]': {
                '-moz-appearance': 'textfield'
            },
            '& input[type=number]::-webkit-outer-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0
            },
            '& input[type=number]::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0
            }
        },
    });

    const marks = [
        {
            value: 0,
            label: '0%',
        },
        {
            value: 25,
            label: '25%',
        },
        {
            value: 50,
            label: '50%',
        },
        {
            value: 75,
            label: '75%',
        },
        {
            value: 100,
            label: '100%',
        },
    ];

    function valuetext(value) {
        return `${value}%`;
    }


    return (
        <Box display="flex" justifyContent="center" alignItems="center" textAlign="center">
            <Grid container rowSpacing={0} columnSpacing={0}>
                <Grid item xs={12}>
                    <Box className='depositContainer1' display="inline-flex" onClick={handleToggle} style={{ cursor: 'pointer' }}>
                    <Grid item xs={11}>
                        <Box textAlign="left">
                            <div className='depositFont1' style={{ marginBottom: "10px" }}>Deposit ETH</div>
                            <div className='depositFont2'>Available USDC in Wallet: {erc20Balances? parseFloat(formatEther(erc20Balances)).toFixed(4) : 0}</div>
                        </Box>
                        </Grid>
                        <img src={eth} style={{ height: 45, width: 45, margin: "auto" }} />
                    </Box>

                </Grid>
                <Divider sx={{ borderBottomWidth: 5, width: "50%", borderBlockColor: "lightgray", margin: "auto" }} />

                <Grid item xs={12}>
                    <Collapse in={slideIn} timeout={500} >
                        <Box className='depositContainer2' display="inline-flex">
                            <Grid item xs={4}>
                                <Box textAlign="left" marginLeft="5%">
                                    <Box className='depositFont2' marginBottom="5%">
                                        Utilization rate
                                    </Box>
                                    <Box fontWeight="bold">
                                        40.23 %
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box>
                                    <Box className='depositFont2' marginBottom="5%">
                                        Your balance
                                    </Box>
                                    <Box fontWeight="bold">
                                        {erc20Balances? parseFloat(formatEther(erc20Balances)).toFixed(4) : 0}
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box textAlign="right" marginRight="5%">
                                    <Box className='depositFont2' marginBottom="5%">
                                        Deposit APR
                                    </Box>
                                    <Box fontWeight="bold">
                                        7.47 %
                                    </Box>
                                </Box>
                            </Grid>
                        </Box>
                        <Divider sx={{ borderBottomWidth: 5, width: "50%", borderBlockColor: "lightgray", margin: "auto" }} />
                    </Collapse>
                </Grid>

                <Grid item xs={12}>
                    <Box className='depositContainer3' display="inline-flex">
                        <Box sx={{ width: "100%" }}>
                            <Box sx={{ border: 1 }} className="depositContainer3_1">

                                <Box textAlign="left">
                                    <Box className='depositFont2' style={{ marginBottom: "5px" }}>Amount</Box>
                                    <div className='depositFont3'><TextField
                                        id="outlined-number"
                                        variant="standard"
                                        InputProps={{
                                            disableUnderline: true,
                                        }}
                                        type="number"
                                        className={useStyles().input}
                                        value={depositInput.toFixed(4)}
                                        onChange={(e) => {
                                            var value = parseFloat(e.target.value);
                                            if (depositValue > formatEther(erc20Balances)) value = formatEther(erc20Balances);
                                            if (depositValue < 0) value = 0;
                                            setDepositValue(value);
                                        }}
                                        onBlur={(e) => {
                                            var value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                            if (depositValue > formatEther(erc20Balances)) value = formatEther(erc20Balances);
                                            if (depositValue < 0) value = 0;
                                            setDepositValue(value);
                                        }}
                                        disabled={erc20Balances == 0}
                                    /></div>
                                </Box>
                            </Box>
                            <Box sx={{ width: "90%", margin: "auto", marginTop: "5%" }}>
                                <Slider
                                    aria-label="Custom marks"
                                    defaultValue={0}
                                    getAriaValueText={valuetext}
                                    step={1}
                                    valueLabelDisplay="auto"
                                    value={(depositInput && erc20Balances) ? depositInput / formatEther(erc20Balances) * 100 : 0}
                                    marks={marks}
                                    onChange={(e) => {
                                        var value = erc20Balances ? parseFloat(e.target.value) / 100 * formatEther(erc20Balances) : 0;
                                        setDepositValue(value);
                                    }}
                                    disabled={erc20Balances == 0}
                                />
                            </Box>
                            <Button variant="contained" style={{
                                borderRadius: 20, padding: "12px 24px", fontSize: "18px", margin: "35px 10px 20px 10px", width: "90%"
                            }}>
                                Deposit
                            </Button>
                        </Box>
                    </Box>

                </Grid>
            </Grid>
        </Box>
    )
}

export default DepositPage;