import React, { useState } from "react";
import { IpfsImage } from 'react-ipfs-image'
import { useEthers } from "@usedapp/core";
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ContractAddress from './ContractAddress.json'
import bankAbi from '../contracts/Bank/abi.json';
import nftAbi from '../contracts/NFT/abi.json';
import { Contract } from '@ethersproject/contracts';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function ListNFTCard({ nft }) {
  const { library } = useEthers();
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    borderRadius: 40
  }));

  const [pay, setPay] = useState(false);
  const [dueDay, setDueDay] = useState(dayjs());

  const bankAddress = ContractAddress.bank;
  const bankContract = new Contract(bankAddress, bankAbi, library.getSigner());
  const nftAddress = ContractAddress.nft;
  const nftContract = new Contract(nftAddress, nftAbi, library.getSigner());

  async function executeTransaction(nft, bank, tokenId) {
    await nftContract.setApprovalForAll(bank, true);
    await bankContract.buyNFT(nft, tokenId);
  }

  if (nft.title != null && nft.rawMetadata.image != null) {
    return (
      <div>
        {
          nft.rawMetadata.image.startsWith("https")
            ?
            <Item>
              <img src={nft.rawMetadata.image} alt="" className="NFTImg"
                onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png' }} />
              {nft.title}<br />
              <Button variant="contained" style={{
                borderRadius: 10, padding: "9px 5px", fontSize: "9px", margin: "12px 5px 10px 5px", width: "45%"
              }} onClick={() => setPay(true)}>
                Down Payment
              </Button>
              <Button variant="outlined" style={{
                borderRadius: 10, padding: "9px 5px", fontSize: "9px", margin: "12px 5px 10px 5px", width: "45%"
              }} onClick={() => executeTransaction(nft.contract.address, bankAddress, nft.tokenId)}>
                Full Payment
              </Button>
              <Dialog
                open={pay} onClose={() => setPay(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                  style: { borderRadius: "2rem" }
                }}
              >
                <DialogTitle id="alert-dialog-title">
                  {"Down Payment Details"}
                </DialogTitle>
                <DialogContent id="alert-dialog-description">
                  <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item md={6} xs={12}>
                      <img src={nft.rawMetadata.image} alt="" className="NFTImg"
                        onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png' }} />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item md={6}>
                          <DialogContentText id="alert-dialog-description">
                            Name:<br></br>
                            Full payment:<br></br>
                            Down payment:<br></br>
                            Interest rate:<br></br>
                          </DialogContentText>
                        </Grid>
                        <Grid item md={6} >
                          <DialogContentText id="alert-dialog-description">
                            {nft.title}<br></br>
                            10 ETH<br></br>
                            6 ETH<br></br>
                            3%<br></br>
                          </DialogContentText>
                        </Grid>
                      </Grid>
                      <Box marginTop={2}>Please select the loan maturity date.</Box>
                      <Box marginTop={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker minDate={dayjs()} label="Loan maturity date" openTo="year"
                            views={['day', 'month']} value={dueDay}
                            onChange={(newValue) => { setDueDay(newValue); }}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setPay(false)}>Back</Button>
                  <Button onClick={() => setPay(false)} autoFocus>
                    Confirmed
                  </Button>
                </DialogActions>
              </Dialog>
            </Item>
            :
            <Item>
              {/* https://developers.cloudflare.com/web3/ipfs-gateway/reference/updating-for-ipfs/ <- speed depends on this free gateway*/}
              <IpfsImage hash={nft.rawMetadata.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs' className="NFTImg"
                onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png' }} />
              {nft.title}<br />
              <Button variant="contained" style={{
                borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "80%"
              }} onClick={() => executeTransaction(nft.contract.address, bankAddress, nft.tokenId)}>
                Purchase
              </Button>
            </Item>
        }

      </div>
    )
  }
  else {
    return (null)
  }
}


export default ListNFTCard;

