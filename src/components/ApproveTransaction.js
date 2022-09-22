import { useContractFunction } from "@usedapp/core";
import abi from '../contracts/NFT/abi.json';
import ContractAddress from './ContractAddress.json'
import { Contract } from '@ethersproject/contracts';

function ApproveTransaction(address) {
    const contractAddress = ContractAddress.nft;
    const contract = new Contract(contractAddress, abi);

    const { send, state } = useContractFunction(contract, "setApproveForAll");
    return send(address, true);
}

export default ApproveTransaction;