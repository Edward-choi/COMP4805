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
        uint256 loanId;
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
        //Check the customer loan list to determine the loanId
        uint256 index = addressToInLoans[msg.sender].length;
        //Create the loan
        NftToken memory token = NftToken(nftContractAddr, tokenId);
        InLoan memory temp = InLoan(msg.sender, index ,loanAmount, 
        loanAmount - msg.value, block.timestamp, dueTime, token);
        //Append the loan into the array inside the map
        addressToInLoans[msg.sender].push(temp);
        //Append the sender address to the customer list
        customerList.push(msg.sender);
        //Append the nft to the loaning list
        nftInLoan.push(token);
    }

    //For User to call for repaying the loan
    function repayLoan(uint loanId) external payable{
        //Check if the loan exist in the beginning
        require(checkLoanExist(msg.sender,loanId), "No such loan, please check the loanId");
        //A for loop to locate the loan matching the loanId
        for(uint256 i = 0; i<addressToInLoans[msg.sender].length; i++){
            if (addressToInLoans[msg.sender][i].loanId == loanId){
                require(msg.value <= addressToInLoans[msg.sender][i].outstandBalance, "You have overpaid the loan");
                //Decrease the outstanding balance of the matching loan
                addressToInLoans[msg.sender][i].outstandBalance -= msg.value;
                //Check if the loan is fully paid
                if (checkLoanPaid(msg.sender,loanId)){
                    //Remove the loan if it is fully paid
                    transferNft(addressToInLoans[msg.sender][i].nft.nftContractAddr, addressToInLoans[msg.sender][i].nft.tokenId, msg.sender);
                    removeLoan(msg.sender,loanId);
                }
            }
        }
    }

    //Only callable by the contract to remove the paid loan
    function removeLoan(address addr, uint256 loanId) private{
        //A for loop to locate the loan matching the loanId
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            //Check if the loan exist and if it is paid
            if (addressToInLoans[addr][i].loanId == loanId){
                //Set the matching loan to the last loan of the array
                addressToInLoans[addr][i] = addressToInLoans[addr][addressToInLoans[addr].length - 1];
                //pops the array to get rig of the last item
                addressToInLoans[addr].pop();
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
    //For future use
    function checkLoanPaid(address addr, uint loanId) public view returns(bool){
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            if(addressToInLoans[addr][i].loanId == loanId && addressToInLoans[addr][i].outstandBalance <= 0){
                return true;
            }
        }
        return false;
    }

    //Check if a loan exist
    function checkLoanExist(address addr, uint loanId) public view returns(bool){
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            if(addressToInLoans[addr][i].loanId == loanId){
                return true;
            }
        }
        return false;
    }

    function checkNftInList(NftToken memory token) public view returns(bool){
        for(uint256 i = 0; i<nftInLoan.length; i++){
            //Check if the nft in the list or not
            if (nftInLoan[i].nftContractAddr == token.nftContractAddr 
            && nftInLoan[i].tokenId == token.tokenId){
                return true;
            }
        }
        return false;
    }

    /*__________________________________Other_____________________________________ */

    //Transfer the nft to the customer, only called by the contract
    function transferNft(address contractAddr, uint256 tokenId, address transferTo) private {
        ERC721 Nft = ERC721(contractAddr);
        Nft.transferFrom(address(this), transferTo, tokenId);
    }

    function withdraw() public onlyOwner {
        Address.sendValue(payable(msg.sender), address(this).balance);
    }
}