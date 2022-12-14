import React, { useState, useEffect } from 'react'
import { IpfsImage } from 'react-ipfs-image'
import { useEthers } from "@usedapp/core";
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ContractAddress from './ContractAddress.json'
import bankAbi from '../contracts/Bank/abi.json';
import { Contract } from '@ethersproject/contracts';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { parseEther } from "ethers/lib/utils";
import abi from '../contracts/Bank/abi.json';
import { formatEther } from "ethers/lib/utils";

function LoanedNFTCard({ nft }) {
	var time = new Date(parseInt(nft.dueTime.toString() + "000")).toLocaleDateString("en-US")
	const { account, library } = useEthers();
	const Item = styled(Paper)(({ theme }) => ({
		backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
		...theme.typography.body2,
		padding: theme.spacing(2),
		color: theme.palette.text.secondary,
		borderRadius: 40
	}));

	const bankAddress = ContractAddress.bank;
	const bankContract = new Contract(bankAddress, bankAbi, library.getSigner());
	const [repay, setRepay] = useState(false);
	const [price, setPrice] = useState(0);
	var contract = null;
    if (library) {
        contract = new Contract(bankContract, abi, library.getSigner());
    }

	// const [loanAmount, setLoanAmount] = useState('');
	var repayment = 0;
	const handleLoanInputChange = event => {
		repayment = event.target.value;
	};

	function setMax() {
		document.getElementById("outlined-number").value = parseFloat(formatEther(nft.outstandBalance));
		repayment = (formatEther(nft.outstandBalance));
		console.log(formatEther(nft.outstandBalance));
	}

	function calNextMinPay(){
		const debt = parseFloat(formatEther(nft.debt));
		const ob = parseFloat(formatEther(nft.outstandBalance));
		const baseCuRate = parseFloat(formatEther(nft.baseCumuRate));
		const cuRate = parseFloat(formatEther(nft.cumuRate));
		console.log(debt,ob,baseCuRate,cuRate)
		if (baseCuRate + cuRate > 1){
			return ob.toFixed(3);
		}
		else if(debt*(baseCuRate + cuRate) - ob <= 0 ){
			return 0;
		}
		else{
			return (debt*(baseCuRate + cuRate) - ob).toFixed(4);
		}
	}

	async function executeTransaction(nft, tokenId) {
		// console.log("nftaddr:", nft)
		// console.log("tokenId:", formatEther(tokenId)*(10**18))
		try{
			const tx = await bankContract.repayLoan(nft, formatEther(tokenId)*(10**18), {value: parseEther(repayment.toString())});
			await tx.wait();
			alert("Transaction comfirmed")
		}catch(err){
			if(err.message === "MetaMask Tx Signature: User denied transaction signature."){
				alert("Please sign the message on Metamask");
			}
			else{
				alert("You have overpaid your loan");
			}
		}
		setRepay(false);
	}

	useEffect( () => {
        if (contract && account) {
            async function getPrice() {
				const floorPrice = await bankContract.nftFloorPrice();
                setPrice(formatEther(floorPrice));
                // console.log(floorPrice);
            }
            getPrice();
        }
    }, [account]);

	useEffect( () => {
        if (contract && account) {
            async function getPrice() {
				const floorPrice = await bankContract.nftFloorPrice();
                setPrice(formatEther(floorPrice));
                // console.log(floorPrice);
            }
            getPrice();
        }
    }, [account]);

	if (nft.name != null && nft.image != null) {
		return (
			<div>
				<Item>
					{
						nft.image.startsWith("https") ?
							<img src={nft.image} alt="" className="NFTImg"
								onError={({ currentTarget }) => {
									currentTarget.onerror = null;
									currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'
								}} />
							:
							<IpfsImage hash={nft.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs' className="NFTImg"
								onError={({ currentTarget }) => {
									currentTarget.onerror = null;
									currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'
								}} />
					}
					{nft.name}<br />
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
									<img src={nft.image} alt="" className="NFTImg"
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
												Next Min Payment:<br></br>
											</DialogContentText>
										</Grid>
										<Grid item md={5} >
											<DialogContentText id="alert-dialog-description">
												{nft.name}<br></br>
												{price} ETH<br></br>
												{(parseFloat(formatEther(nft.outstandBalance))).toFixed(4)} ETH<br></br>
												{time}<br></br>
												{calNextMinPay()} ETH<br></br>
											</DialogContentText>
										</Grid>
									</Grid>
									<Box marginTop={2}>Please select the repayment amount.</Box>
									<Box marginTop={2}>
										<TextField
											id="outlined-number"
											label="Repayment"
											type="number"
											// value= {loanAmount}
            								onChange= {handleLoanInputChange}
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
										<Button style={{ height: 60 }} onClick={() => setMax() }>Max</Button>
									</Box>
								</Grid>
							</Grid>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setRepay(false)}>Back</Button>
							<Button onClick={() => executeTransaction(nft.nft[0], nft.nft[1])} autoFocus>
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

