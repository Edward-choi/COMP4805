import React, { useEffect } from 'react'
import { IpfsImage } from 'react-ipfs-image'
import { useEthers, useCall } from "@usedapp/core";
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ContractAddress from './ContractAddress.json'
import bankAbi from '../contracts/Bank/abi.json';
import nftAbi from '../contracts/NFT/abi.json';
import { Contract } from '@ethersproject/contracts';

function SellNFTCard({ nft, price }) {
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

	const { account } = useEthers();
	const { value } = useCall(account && nftAddress && {
        contract: new Contract(nftAddress, nftAbi),
        method: 'isApprovedForAll',
        args: [account, bankAddress]
    }) ?? {};
    const approved = value ? value[0] : false;

	async function executeTransaction(nft, bank, tokenId) {
		try{
			if (!approved){
				const tx = await nftContract.setApprovalForAll(bank, true);
				await tx.wait();
				try{
					const tx = await bankContract.liquidateNFT(nft, tokenId);
					await tx.wait();
					alert("You have successfully sold your NFT");
				}catch(err){
					if(err.message === "MetaMask Tx Signature: User denied transaction signature."){
						alert("Please sign the message on Metamask")
					}
					else{
						alert("Your NFT is not supported or We do not accept anymore NFT now");
					}
				}
			}
			else{
				try{
					const tx = await bankContract.liquidateNFT(nft, tokenId);
					await tx.wait();
					alert("You have successfully sold your NFT");
				}catch(err){
					if(err.message === "MetaMask Tx Signature: User denied transaction signature."){
						alert("Please sign the message on Metamask");
					}
					else{
						alert("Your NFT is not supported or We do not accept anymore NFT now");
					}
				}
			}
		}
		catch(err){
			alert("Please sign the message on Metamask");
		}
	}

	if (nft.title != null && nft.rawMetadata.image != null) {
		return (
			<div>
				<Item>
					{
						nft.rawMetadata.image.startsWith("https") ?
						<img src={nft.rawMetadata.image} alt="" className="NFTImg"
							onError={({ currentTarget }) => { currentTarget.onerror = null; 
							currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png' }} />
						:
						<IpfsImage hash={nft.rawMetadata.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs' className="NFTImg"
							onError={({ currentTarget }) => { currentTarget.onerror = null; 
							currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png' }} />
					}
					<div style={{ fontWeight: 'bold' }}>
					{nft.title}<br />
					{nft.contract.address.toLowerCase() === nftAddress.toLowerCase() ? <div>Sell Price: {price.toFixed(4)} ETH<br /></div> : <div>Sell Price: Unverified<br /></div>}
					</div>
					<Button variant="contained" style={{
						borderRadius: 10, padding: "9px 18px", fontSize: "12px", margin: "12px 15px 10px 15px", width: "80%"
					}} onClick={() => executeTransaction(nft.contract.address, bankAddress, nft.tokenId)}>
						Sell
					</Button>

				</Item>

			</div>
		)
	}
	else {
		return (null)
	}
}


export default SellNFTCard;

