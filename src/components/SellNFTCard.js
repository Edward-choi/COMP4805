import React from 'react'
import { IpfsImage } from 'react-ipfs-image'
import { useEthers, useCall } from "@usedapp/core";
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ContractAddress from './ContractAddress.json'
import bankAbi from '../contracts/Bank/abi.json';
import nftAbi from '../contracts/NFT/abi.json';
import { Contract } from '@ethersproject/contracts';

function SellNFTCard({ nft }) {
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
		if (!approved){
			const Approvaltx = await nftContract.setApprovalForAll(bank, true);
			await Approvaltx.wait();
			await bankContract.liquidateNFT(nft, tokenId);
		}
		else{
			await bankContract.liquidateNFT(nft, tokenId);
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
					{nft.title}<br />
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

