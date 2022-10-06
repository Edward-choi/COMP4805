// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./nffBank.sol";

contract nffLoan{
    /*
    * Check if a loan is due every day at 00:00, if current time > due time, the loan is defaulted
    *
    */
    address public owner;
    address public bankaddr;
    uint256 interstRate;
    uint256 downPayment;
    //The Loan structure InLoan = instalment Loan
    struct InLoan{
        address loanOwner;
        uint256 loanAmount;
        uint256 outstandBalance;
        uint256 startTime;
        uint256 dueTime;
        NftToken nft;
    }
    struct NftToken{
        address nftContractAddr;
        uint256 tokenId;
    }
    //For mapping between owner and thier loans
    mapping(address => InLoan[]) addressToInLoans;
    //For tracking customers
    address[] public customerList;
    //For tracking which nft is in a loan
    NftToken[] public nftInLoan;

    using SafeMath for uint256;

    constructor(){
        downPayment = 1 ether;
        owner = msg.sender;
        //initial interstRate
        interstRate = 5;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sorry you are not the owner");
        _;
    }

    /*__________________________________NFT Loaning_________________________________ */

    //For starting a nft instalment loan. block.timestamp gives you the current time in unix timestamp
    //Please use https://www.unixtimestamp.com/ for conversion
    function startLoan(address nftContractAddr, uint256 loanAmount, uint256 dueTime, uint256 tokenId) external payable{
        require(msg.value >= downPayment, "down payment requirement not met");
        require(msg.value < loanAmount, "Please consider direct buying instead of loan");
        NftToken memory token = NftToken(nftContractAddr, tokenId);
        require(checkNftBalance(token), "The contract doesnt own this NFT");
        require(!checkNftInList(token), "The NFT you selected is on others instalment loan");
        //Create the loan
        InLoan memory temp = InLoan(msg.sender, loanAmount, 
        loanAmount - msg.value, block.timestamp, dueTime, token);
        //Append the loan into the array inside the map
        addressToInLoans[msg.sender].push(temp);
        //Append the sender address to the customer list
        customerList.push(msg.sender);
        //Append the nft to the loaning list
        nftInLoan.push(token);
    }

    //For User to call for repaying the loan
    function repayLoan(address nftContractAddr, uint256 tokenId) external payable{
        NftToken memory token = NftToken(nftContractAddr, tokenId);
        //Check if the loan exist in the beginning
        require(checkLoanExist(msg.sender,token), "No such loan, please check the NFT contract or tokenId");
        //A for loop to locate the loan matching the NFT contractaddr and tokenID
        for(uint256 i = 0; i<addressToInLoans[msg.sender].length; i++){
            if (addressToInLoans[msg.sender][i].nft.nftContractAddr == nftContractAddr && 
                addressToInLoans[msg.sender][i].nft.tokenId == tokenId){
                require(msg.value <= addressToInLoans[msg.sender][i].outstandBalance, "You have overpaid the loan");
                //Decrease the outstanding balance of the matching loan
                addressToInLoans[msg.sender][i].outstandBalance -= msg.value;
                //Check if the loan is fully paid
                if (addressToInLoans[msg.sender][i].outstandBalance <= 0){
                    //Remove the loan if it is fully paid
                    transferNft(addressToInLoans[msg.sender][i].nft, msg.sender);
                    removeLoan(msg.sender,token);
                }
            }
        }
    }

    //Only callable by the contract to remove the paid loan
    function removeLoan(address addr, NftToken memory token) private{
        //A for loop to locate the loan matching the the NFT contractaddr and tokenID
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            //Check if the loan exist and if it is paid
            if (addressToInLoans[addr][i].nft.tokenId == token.tokenId &&
                addressToInLoans[addr][i].nft.nftContractAddr == token.nftContractAddr){
                //Set the matching loan to the last loan of the array
                addressToInLoans[addr][i] = addressToInLoans[addr][addressToInLoans[addr].length - 1];
                //pops the array to get rig of the last item
                addressToInLoans[addr].pop();
            }
        }
        for (uint256 i = 0; i<nftInLoan.length; i++){
            if(nftInLoan[i].nftContractAddr == token.nftContractAddr && nftInLoan[i].tokenId == token.tokenId){
                nftInLoan[i] = nftInLoan[nftInLoan.length-1];
                nftInLoan.pop();
            }
        }
    }

    /*__________________________________Getter_____________________________________ */

    //Return an array of InLoans of a user
    function getAllUserLoan(address addr) public view returns(InLoan[] memory){
        return addressToInLoans[addr];
    }

    function callDueLoan() public view{
        for(uint256 i = 0; i < customerList.length; i++){
            for(uint256 j = 0; j < addressToInLoans[customerList[i]].length; j++){
                if (addressToInLoans[customerList[i]][j].dueTime < block.timestamp){
                    
                }
            }
        }
    }

    /*__________________________________Setter_____________________________________ */

    //Only called by the contract
    function removeNftList(NftToken memory token) private{
        for(uint256 i = 0; i<nftInLoan.length; i++){
            //Check if the nft in the list or not
            if (nftInLoan[i].nftContractAddr == token.nftContractAddr 
            && nftInLoan[i].tokenId == token.tokenId){
                //Set the matching nft to the last nft of the array
                nftInLoan[i] = nftInLoan[nftInLoan.length -1];
                //pops the array to get rig of the last item
                nftInLoan.pop();
            }
        }
    }

    /*__________________________________Checker_____________________________________ */

    //Return true if a loan is fully repaid, false otherwise
    //For future use just in case
    function checkLoanPaid(address addr, NftToken memory token) public view returns(bool){
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            if(addressToInLoans[addr][i].nft.tokenId == token.tokenId &&
               addressToInLoans[addr][i].nft.nftContractAddr == token.nftContractAddr && 
               addressToInLoans[addr][i].outstandBalance <= 0){
                return true;
            }
        }
        return false;
    }

    //Check if a loan exist
    function checkLoanExist(address addr, NftToken memory token) public view returns(bool){
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            if(addressToInLoans[addr][i].nft.tokenId == token.tokenId &&
               addressToInLoans[addr][i].nft.nftContractAddr == token.nftContractAddr){
                return true;
            }
        }
        return false;
    }

    //Check if the nft is in the loan list
    function checkNftInList(NftToken memory token) public view returns(bool){
        for(uint256 i = 0; i<nftInLoan.length; i++){
            //Check if the nft in the list or not
            if (nftInLoan[i].nftContractAddr == token.nftContractAddr && 
                nftInLoan[i].tokenId == token.tokenId){
                return true;
            }
        }
        return false;
    }

    //Check if the this contract owns the nft
    function checkNftBalance(NftToken memory token) public view returns(bool){
        ERC721 Nft = ERC721(token.nftContractAddr);
        if (Nft.ownerOf(token.tokenId) == address(this)){
            return true;
        }
        else{
            return false;
        }
    }

    /*__________________________________Other_____________________________________ */

    //Transfer the nft to the customer, only called by the contract
    function transferNft(NftToken memory token, address transferTo) private {
        ERC721 Nft = ERC721(token.nftContractAddr);
        Nft.transferFrom(address(this), transferTo, token.tokenId);
    }

    function withdraw() public onlyOwner {
        Address.sendValue(payable(msg.sender), address(this).balance);
    }
}