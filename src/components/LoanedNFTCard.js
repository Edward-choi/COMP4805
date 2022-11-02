import React, { useState } from 'react'
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
import TextField from '@mui/material/TextField';

function LoanedNFTCard({ nft }) {
	const { library } = useEthers();
	const Item = styled(Paper)(({ theme }) => ({
		backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
		...theme.typography.body2,
		padding: theme.spacing(2),
		color: theme.palette.text.secondary,
		borderRadius: 40
	}));

	const bankAddress = ContractAddress.bank;
	const bankContract = new Contract(bankAddress, bankAbi, library.getSigner());
	const nftAddress = ContractAddress.nft;
	const nftContract = new Contract(nftAddress, nftAbi, library.getSigner());
	const [repay, setRepay] = useState(false);

	async function executeTransaction(nft, bank, tokenId) {
		await nftContract.setApprovalForAll(bank, true);
		await bankContract.sellNFT(nft, tokenId);
		setRepay(false);
	}

	if (nft.title != null && nft.rawMetadata.image != null) {
		return (
			<div>
				<Item>
					{
						nft.rawMetadata.image.startsWith("https") ?
							<img src={nft.rawMetadata.image} alt="" className="NFTImg"
								onError={({ currentTarget }) => {
									currentTarget.onerror = null;
									currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'
								}} />
							:
							<IpfsImage hash={nft.rawMetadata.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs' className="NFTImg"
								onError={({ currentTarget }) => {
									currentTarget.onerror = null;
									currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'
								}} />
					}
					{nft.title}<br />
					<Button variant="contained" style={{
						borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "80%"
					}} onClick={() => setRepay(true)}>
						Repay
					</Button>
					<Dialog
						open={repay} onClose={() => setRepay(false)}
						aria-labelledby="alert-dialog-title"
						aria-describedby="alert-dialog-description"
						PaperProps={{
							style: { borderRadius: "2rem" }
						}}
					>
						<DialogTitle id="alert-dialog-title">
							{"Repayment Details"}
						</DialogTitle>
						<DialogContent id="alert-dialog-description">
							<Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
								<Grid item md={5} xs={12}>
									<img src={nft.rawMetadata.image} alt="" className="NFTImg"
										onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png' }} />
								</Grid>
								<Grid item md={7} xs={12}>
									<Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
										<Grid item md={7}>
											<DialogContentText id="alert-dialog-description">
												Name:<br></br>
												Floor price:<br></br>
												Outstanding payment:<br></br>
												Due date:<br></br>
											</DialogContentText>
										</Grid>
										<Grid item md={5} >
											<DialogContentText id="alert-dialog-description">
												{nft.title}<br></br>
												10 ETH<br></br>
												2 ETH<br></br>
												31/12/2022<br></br>
											</DialogContentText>
										</Grid>
									</Grid>
									<Box marginTop={2}>Please select the repayment amount.</Box>
									<Box marginTop={2}>
										<TextField
											id="outlined-number"
											label="Repayment"
											type="number"
											InputLabelProps={{
												shrink: true,
											}}
										/>
									</Box>
								</Grid>
							</Grid>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setRepay(false)}>Back</Button>
							<Button onClick={() => executeTransaction(null, null, null)} autoFocus>
								Confirmed
							</Button>
						</DialogActions>
					</Dialog>

				</Item>

			</div>
		)
	}
	else {
		return (null)
	}
}


export default LoanedNFTCard;
