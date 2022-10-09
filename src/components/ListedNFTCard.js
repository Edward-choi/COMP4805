import React, { useState } from "react";
import { IpfsImage } from 'react-ipfs-image'
import { Alchemy } from "alchemy-sdk"
import { useEthers, Goerli } from "@usedapp/core";
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ContractAddress from './ContractAddress.json'
import bankAbi from '../contracts/Bank/abi.json';
import nftAbi from '../contracts/NFT/abi.json';
import { Contract } from '@ethersproject/contracts';
import { NetworkPingTwoTone } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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
              <img src={nft.rawMetadata.image} className="NFTImg"
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
                open={pay} onClose={() => setPay(false)} aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Loan Term"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Please select the loan term. 
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setPay(false)}>Disagree</Button>
                  <Button onClick={() => setPay(false)} autoFocus>
                    Agree
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

