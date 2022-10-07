// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./nffBank.sol";

contract nffLoan{
    /*
    * Check if a loan is due every day at 00:00, if current time > due time, the loan is defaulted
    * Future development: Implement BokkyPooBahsDateTimeLibrary https://github.com/bokkypoobah/BokkyPooBahsDateTimeLibrary
    */
    address public owner;
    address public bankaddr;
    address public oracleAddr;
    uint256 public defaultRate;
    uint256 public interstRate;
    uint256 public downPayment;
    //The Loan structure InLoan = instalment Loan
    //The Nft token uniquely define the Loan
    struct InLoan{
        address loanOwner;
        uint256 loanAmount;
        uint256 outstandBalance;
        uint256 startTime;
        uint256 dueTime;
        uint256 defaultCount;
        NftToken nft;
    }
    struct NftToken{
        address nftContractAddr;
        uint256 tokenId;
    }
    //For mapping between owner and thier loans
    mapping(address => InLoan[]) addressToInLoans;
    //For mapping between customers and the number of loans
    mapping(address => uint256) customAddrToNumLoans;
    //For tracking customers, no dups in this array
    address[] public customerList;
    //For tracking which nft is in a loan, no dups in this array
    NftToken[] public nftInLoan;
    //For storing a list of Loan to be removed
    InLoan[] public loanRemoveList;

    using SafeMath for uint256;

    constructor(){
        downPayment = 1 ether;
        owner = msg.sender;
        //initial defaultRate
        defaultRate = 3;
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
        loanAmount - msg.value, block.timestamp, dueTime, 0, token);
        //Append the loan into the array inside the map
        addressToInLoans[msg.sender].push(temp);
        //Append the sender address to the customer list if he is a new customer
        if(!checkCustomerInList(msg.sender)){
            customerList.push(msg.sender);
        }
        //Increase the customers number of loan
        customAddrToNumLoans[msg.sender] += 1;
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
                    //Transfer the nft
                    transferNft(addressToInLoans[msg.sender][i].nft, msg.sender);
                    //Remove the loan
                    removePaidLoan(msg.sender,token);
                }
            }
        }
    }

    //Only callable by the contract to remove the paid loan from the addressToInLoans mapping InLoan[] aray
    function removePaidLoan(address addr, NftToken memory token) private{
        //A for loop to locate the loan matching the the NFT contractaddr and tokenID
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            //Check if the loan exist
            if (addressToInLoans[addr][i].nft.tokenId == token.tokenId &&
                addressToInLoans[addr][i].nft.nftContractAddr == token.nftContractAddr){
                //Set the matching loan to the last loan of the array
                addressToInLoans[addr][i] = addressToInLoans[addr][addressToInLoans[addr].length - 1];
                //pops the array to get rig of the last item
                addressToInLoans[addr].pop();
            }
        }
        //remove the nft from the NFT in loan list
        removeNftList(token);
        //Decrease the number of loans a customer holds
        customAddrToNumLoans[addr] -= 1;
        if (customAddrToNumLoans[addr] <= 0){
            //remove customer from the customerList if they dont have any loan
            removeCustomerList(addr);
        }
    }

    //Check which loan is due and remove those loan which doesn't fully paid
    //only callable by the oracle
    function callDueLoan() public{
        // require(msg.sender == oracleAddr, "Only the orcacle contract can call this function");
        for (uint256 i=0; i < customerList.length; i++){
            for(uint256 j=0; j< addressToInLoans[customerList[i]].length; j++){
                if(addressToInLoans[customerList[i]][j].dueTime < block.timestamp){
                    if(addressToInLoans[customerList[i]][j].defaultCount >= defaultRate){
                        loanRemoveList.push(addressToInLoans[customerList[i]][j]);
                    }
                    else{
                        addressToInLoans[customerList[i]][j].defaultCount++;
                    }
                }
            }
        }
        removeDefaultLoan(loanRemoveList);
        delete loanRemoveList;
    }

    /*__________________________________Getter_____________________________________ */

    //Return an array of InLoans of a user
    function getAllUserLoan(address addr) public view returns(InLoan[] memory){
        return addressToInLoans[addr];
    }

    function getUserNumLoan(address addr) public view returns(uint256){
        return customAddrToNumLoans[addr];
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

    //Only called by the contract
    //Remove a customer from the customer list
    function removeCustomerList(address addr) private{
        for(uint256 i = 0; i <customerList.length; i++){
            if(customerList[i] == addr){
                customerList[i] = customerList[customerList.length-1];
                customerList.pop();
            }
        }
    }

    function setDefaultRate(uint256 rate) public onlyOwner{
        defaultRate = rate;
    }

    function removeDefaultLoan(InLoan[] memory removeList) private{
        for(uint256 i=0; i < removeList.length; i++){
            //remove the loan from addressToInLoans
            for (uint256 j=0; j < addressToInLoans[removeList[i].loanOwner].length; j++){
                if(addressToInLoans[removeList[i].loanOwner][j].nft.nftContractAddr == removeList[i].nft.nftContractAddr && 
                   addressToInLoans[removeList[i].loanOwner][j].nft.tokenId == removeList[i].nft.tokenId){

                    addressToInLoans[removeList[i].loanOwner][j] = 
                    addressToInLoans[removeList[i].loanOwner][addressToInLoans[removeList[i].loanOwner].length -1];

                    addressToInLoans[removeList[i].loanOwner].pop();
                    
                    removeNftList(removeList[i].nft);
                    customAddrToNumLoans[removeList[i].loanOwner] -= 1;

                    if (customAddrToNumLoans[removeList[i].loanOwner] <= 0){
                    //remove customer from the customerList if they dont have any loan
                        removeCustomerList(removeList[i].loanOwner);
                    }           
                }
            }

        }
    }

    /*__________________________________Checker_____________________________________ */

    //Return true if a loan is fully repaid, false otherwise
    //For future use just in case, no use right now
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

    function checkCustomerInList(address addr) public view returns(bool){
        for(uint256 i =0; i < customerList.length; i++){
            if(customerList[i] == addr){
                return true;
            }
        }
        return false;
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