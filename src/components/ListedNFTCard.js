import React, { useState, useEffect } from "react";
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
import { parseEther, formatEther } from "ethers/lib/utils";

function ListNFTCard({ nft , irate}) {
	const { account, library } = useEthers();
	const Item = styled(Paper)(({ theme }) => ({
		backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
		...theme.typography.body2,
		padding: theme.spacing(2),
		color: theme.palette.text.secondary,
		borderRadius: 40
	}));

	const [pay, setPay] = useState(false);
	const [dueDay, setDueDay] = useState(dayjs());
	const [price, setPrice] = useState(0);
	const [LTV, setLTV] = useState(0);
	const bankAddress = ContractAddress.bank;
	const bankContract = new Contract(bankAddress, bankAbi, library.getSigner());
	const nftAddress = ContractAddress.nft;
	const nftContract = new Contract(nftAddress, nftAbi, library.getSigner());
	var deposit = 0;
	var varInterest = 0;

	async function fullPayment(nft, tokenId) {
		try{
			const floorPrice = await bankContract.nftFloorPrice();
			const tx = await bankContract.buyNFT(nft, tokenId, { value: floorPrice });
			await tx.wait();
			alert("Congrates you now own this NFT");
		}catch(err){
			if(err.message === "MetaMask Tx Signature: User denied transaction signature."){
				alert("Please sign the message on Metamask")
			}
			else{
				alert("Please pay the correct amount of ETH");
			}
		}
	}

	async function downPayment(nft, dueDay, tokenId) {
		setPay(false);
		const floorPrice = await bankContract.nftFloorPrice();
		setPrice(formatEther(floorPrice));
		var d = new Date();
		try{
			const tx = await bankContract.startLoan(nft, tokenId, Math.round((dueDay - d.getTime()) / 86400000, 1), { value: parseEther((deposit).toString()) });
			await tx.wait();
			alert("NFT Loan Accepted !");
		}catch(err){
			if(err.message === "MetaMask Tx Signature: User denied transaction signature."){
				alert("Please sign the message on Metamask")
			}
			else if (deposit >= price){
				alert("Please consider direct buying instead of loan")
			}
			else{
				alert("Please select an appropriate date and fullfill the minimum deposit");
			}
		}
	}

	useEffect(() => {
		if (bankContract && account) {
			async function getPrice() {
				const floorPrice = await bankContract.nftFloorPrice();
				setPrice(formatEther(floorPrice));
				// console.log(floorPrice);
			}
			getPrice();
		}
	}, [account]);

	useEffect(() => {
		if (bankContract) {
			async function getLTV() {
				const ltv = await bankContract.LoanToValue();
				setLTV(formatEther(ltv)*(10**18));
			}
			getLTV();
		}
	}, [bankContract]);

	const handleInputChange = event => {
		deposit = event.target.value;
		if (deposit < price && deposit >= price*(1-LTV/100)){
			varInterest = (irate - ( LTV - ((price - deposit)*100/price))*2/100).toFixed(2)
			document.getElementById("irate").innerHTML = varInterest.toString() + "%";
		}
		else{
			varInterest = 5
			document.getElementById("irate").innerHTML = varInterest.toString() + "%";
		}
		console.log(varInterest)
	};

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
					<div style={{ fontWeight: 'bold' }}>
					{nft.title}<br />
					Price: {parseFloat(price).toFixed(2)} ETH<br />
					</div>
					<Button variant="contained" style={{
						borderRadius: 10, padding: "9px 5px", fontSize: "9px", margin: "12px 5px 10px 5px", width: "45%"
					}} onClick={() => setPay(true)}>
						Down Payment
					</Button>
					<Button variant="outlined" style={{
						borderRadius: 10, padding: "9px 5px", fontSize: "9px", margin: "12px 5px 10px 5px", width: "45%"
					}} onClick={() => fullPayment(nft.contract.address, nft.tokenId)}>
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
								<Grid item md={5} xs={12}>
									<img src={nft.rawMetadata.image} alt="" className="NFTImg"
										onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png' }} />
								</Grid>
								<Grid item md={7} xs={12}>
									<Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
										<Grid item md={7}>
											<DialogContentText id="alert-dialog-description">
												Name:<br></br>
												Full payment:<br></br>
												Down payment:<br></br>
												Interest rate:<br></br>
											</DialogContentText>
										</Grid>
										<Grid item md={5} >
											<DialogContentText id="alert-dialog-description">
												{nft.title}<br></br>
												{price} ETH<br></br>
												{(price * (1-LTV/100)).toFixed(3)} ETH<br></br>
												<div id="irate">5%<br></br></div>
											</DialogContentText>
										</Grid>
									</Grid>
									<Box marginTop={2}>Please select the loan maturity date.</Box>
									<Box marginTop={2}>
										<LocalizationProvider dateAdapter={AdapterDayjs}>
											<DatePicker minDate={dayjs()} label="Loan maturity date" openTo="year"
												views={['day', 'month']} value={dueDay}
												onChange={(newValue) => { setDueDay(newValue) }}
												renderInput={(params) => <TextField {...params} />}
											/>
										</LocalizationProvider>
									</Box>
									<Box marginTop={2}>
										<TextField id="Down Payment Amount" label="ETH" variant="outlined" 
											type="number"
											onChange={handleInputChange}
											InputLabelProps={{
												shrink: true,
											}}
											inputProps={{
												style: {
												  height: 60,
												  paddingTop: 0,
												  paddingBottom: 0
												},
											  }}
										/>
									</Box>
								</Grid>
							</Grid>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setPay(false)}>Back</Button>
							<Button onClick={() => downPayment(nft.contract.address, dueDay.$d.getTime(), nft.tokenId)} autoFocus>
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


export default ListNFTCard;

