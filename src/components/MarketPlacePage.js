import React, { useEffect, useState } from 'react'
import { Network, Alchemy } from "alchemy-sdk"
import Box from '@mui/material/Box';
import ListedNFTCard from './ListedNFTCard.js'
import Grid from '@mui/material/Grid';
import ContractAddress from './ContractAddress.json'
import { Contract } from '@ethersproject/contracts';
import { useEthers } from "@usedapp/core";
import abi from '../contracts/Bank/abi.json';
import { formatEther, parseEther } from "ethers/lib/utils";

function MarketplacePage() {
    const {library } = useEthers();
    const contractAddress = ContractAddress.bank;
    const [nfts, setNfts] = useState([])
    var [freeNFTs, setFreeNFTs] = useState([])
    const [mortgage, setMortgage] = useState([])
    const [interest, setInterest] = useState(0)
    var contract = null;
    if (library) {
        contract = new Contract(contractAddress, abi, library.getSigner());
    }

    useEffect(() => {
        const settingsGetNft = {
            apiKey: "6RB8WVyUkqB6YjCiiKX57HqZL7RRiVYL", // Replace with your Alchemy API Key.
            network: Network.ETH_GOERLI, // Replace with your network.
        };
    
        const getNftData = () => {
            const alchemy = new Alchemy(settingsGetNft);
            alchemy.nft.getNftsForOwner(contractAddress).then(function (response) {
                const data = response.ownedNfts
                setNfts(data)
                // debugger
            }).catch(function (error) {
                console.error(error);
            });
        }
    
        getNftData()
    }, [contractAddress])

    useEffect( () => {
        if (contract) {
            async function getMortgage() {
                console.log(nfts.length);
                const mortgages = await contract.getAllNftLoan();
                setMortgage(mortgages);
                console.log(nfts);
                for (var i = 0; i < nfts.length; i++) {
                    var isFree = true;
                    for (var j = 0; j < mortgages.length; j ++) {
                        console.log(nfts[i].contract.address, mortgages[j].nftContractAddr.toString(), nfts[i].contract.address == mortgages[j].nftContractAddr.toString().toLowerCase());
                        if (nfts[i].contract.address == mortgages[j].nftContractAddr.toString().toLowerCase() && nfts[i].tokenId == mortgages[j].tokenId.toString()) {
                            isFree = false;
                        }
                    }
                    if (isFree) {
                        freeNFTs.push(nfts[i])
                        setFreeNFTs(freeNFTs);
                    }
                    console.log(freeNFTs);
                }

            }
            getMortgage();
        }
    }, [nfts, freeNFTs]);

    useEffect( () => {
        if (contract) {
            async function getInterest() {
                const irate = await contract.baseInterstRate();
                setInterest(parseFloat(formatEther(irate)));
            }
            getInterest();
        }
    }, [contract]);

    return (
        <Box display="flex" justifyContent="center" alignItems="center" textAlign="center">

            <Box className='marketplaceContainer' display="inline-flex">
                <Grid container rowSpacing={5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    {freeNFTs.map((nft, index) => {
                        return <Grid item md={3} xs={12}>
                            <ListedNFTCard nft={nft} key={index} irate={interest}/>
                        </Grid>
                    })}
                    {/* </div> */}
                </Grid>
            </Box>

        </Box>

    )

}

export default MarketplacePage;
