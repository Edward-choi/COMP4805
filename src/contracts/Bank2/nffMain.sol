// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";

contract nffMain{
    /*__________________________________Shared variabes______________________________________ */

    address public priceOracleAddr;
    address public bankOracleAddr;
    address public owner;
    /*_____________________________________From NFT Bank____________________________________ */
    uint256 public minDeposit;
    uint256 public nftFloorPrice;
    uint256 public nftLiquidationPrice;
    uint256 public discountFactor;
    //Use to store user's eth balance
    mapping(address => uint256) addressToBalances;
    mapping(address => uint256) addressToPrinciple;
    //Use to check user's address existance
    mapping(address => bool) userChecker;
    //Use to check if an NFT colelction is supported
    mapping(address => bool) supportedNft;
    //Use to store key (address) of people who deposit ETH
    address[] private ethDepositorList;
    //For saving supported NFT (Can be implemented by saving every data from liquidated NFT)
    address[] private supportedNftList;
    /*__________________________________Bank Risk Management_________________________________ */
    uint256 public reserveRatio; //To guarantee the bank have enough eth for withdraw
    uint256 public userDeposit; //Total users deposite value
    uint256 public payoutRatio; //payout ratio of this contract
    uint256 public LoanToValue; //LTV ratio that control risk of a loan
    int256 public netProfit; //Profit that the contract made from nft loan (can be negative)
    uint256 public APY; //APY in uint256
    /*____________________________________From NFT Loan______________________________________ */
    /*
    * Check if a loan is due every day at 00:00, if current time > due time, the loan is defaulted
    * Future development: Implement BokkyPooBahsDateTimeLibrary https://github.com/bokkypoobah/BokkyPooBahsDateTimeLibrary
    */
    //defaultRate = number of times that the customer can pay their loan later
    uint256 public defaultRate;
    uint256 public baseInterstRate;
    //The Loan structure InLoan = instalment Loan
    //The Nft token uniquely define the Loan
    struct InLoan{
        address loanOwner;
        uint256 nftValue; //How much this contract contribute to the loan
        uint256 outstandBalance; //Outstanding Balance of the customer
        uint256 debt;
        uint256 startTime;
        uint256 dueTime;
        uint256 nextPayDay;
        uint256 baseCumuRate;
        uint256 cumuRate;
        uint256 defaultCount;
        uint256 LoanRate;
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
    address[] private customerList;
    //For tracking which nft is in a loan, no dups in this array
    NftToken[] private nftInLoan;
    //For storing a list of Loan to be removed can be private
    InLoan[] private loanRemoveList;

    using SafeMath for uint256;
    using SignedSafeMath for int256;

    constructor(){
        owner = msg.sender;
        //Below from NFT Bank
        minDeposit = 0.5 ether;
        //initial discount factor
        discountFactor = 70;
        //initial defaultRate (Max number of default)
        defaultRate = 3;
        //initial interstRate in percent times 10^18
        baseInterstRate = 5000000000000000000;
        //initial reserve ratio in percent
        reserveRatio = 50;
        //initial LTV ratio in percent
        LoanToValue = 60;
        //initial Payout ratio in percent
        payoutRatio = 90;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sorry you are not the owner");
        _;
    }

/*_____________________________Below from NFT Banking____________________________ */

/*__________________________________ETH Banking_________________________________ */

    //User deposite ETH through this function
    function depositETH() external payable{
        require(msg.value >= minDeposit, "minimum deposit requirement not met");
        addressToBalances[msg.sender] += msg.value;
        addressToPrinciple[msg.sender] += msg.value;
        userChecker[msg.sender] = true;
        if(isUserInList(msg.sender) == false){
            ethDepositorList.push(msg.sender);
        }
        userDeposit += msg.value;
    }

    //Called by Oracle
    function paidInterest() internal{
        calAPY();
        for (uint256 i = 0; i < ethDepositorList.length; i++){
            uint256 interest = addressToBalances[ethDepositorList[i]].mul(APY).div(10**18).div(365).div(100);
            addressToBalances[ethDepositorList[i]] += interest;
            netProfit -= int256(interest);
            userDeposit += interest;
        }
    }

    function calAPY() internal{
        if (netProfit <= 0){
            APY = 0;
        }
        else{
            APY = uint256(netProfit).mul(10**18).mul(payoutRatio).div(100).mul(100).div(userDeposit);
        }
    }

    function acceptLiquidation(uint256 liquidatePrice) public view returns(bool){
        if (address(this).balance < liquidatePrice){
            return false;
        }
        if(address(this).balance - liquidatePrice >= userDeposit.mul(reserveRatio).div(100)){
            return true;
        }
        else{
            return false;
        }
    }

    //User withdrawETH through this function
    function withdrawETH(uint256 amount) external payable {
        require (addressToBalances[msg.sender] >= amount);
        addressToBalances[msg.sender] -= amount;
        if(addressToBalances[msg.sender] == 0){
            for(uint256 i = 0; i < ethDepositorList.length; i++){
                if(ethDepositorList[i] == msg.sender){
                    ethDepositorList[i] = ethDepositorList[ethDepositorList.length - 1];
                    ethDepositorList.pop();
                }
            }
        }
        if (amount > addressToPrinciple[msg.sender]){
            addressToPrinciple[msg.sender] = 0;
        }
        else{
            addressToPrinciple[msg.sender] -= amount;
        }
        payable(msg.sender).transfer(amount);
        userDeposit -= amount;
    }

/*__________________________________NFT Liquidating________________________________ */

    function liquidateNFT(address contractAddr, uint256 tokenId) external payable{
        require(acceptLiquidation(nftLiquidationPrice), "Sorry we do not accept anymore NFT right now");
        //First check if the NFT collection is verified on our platform
        require(supportedNft[contractAddr], "Your NFT collection is not verified");
        ERC721 Nft = ERC721(contractAddr);
        //Second check if the user approved this contract to use the NFT token
        require(Nft.isApprovedForAll(msg.sender, address(this)), "This contract must be approved to use your NFT");
        //Third check if the user own the NFT token
        require(Nft.ownerOf(tokenId) == msg.sender, "caller must own the NFT");
        //All statisfied then call transfer
        Nft.transferFrom(msg.sender, address(this), tokenId);
        //Set condition on amount paid later
        payable(msg.sender).transfer(nftLiquidationPrice);
        //Add to NFT cost
        netProfit -= int256(nftLiquidationPrice);
    }

/*__________________________________Getter_____________________________________ */
    
    //Check Individual balance for GUI
    function getUserBalance(address addr) public view returns(uint256){
        return addressToBalances[addr];
    }

    function getUserPrinciple(address addr) public view returns(uint256){
        return addressToPrinciple[addr];
    }

    //Check all user list for debug
    function getethDepositorList() public view returns(address[] memory){
        return(ethDepositorList);
    }

    function getsupportedNftList() public view returns(address[] memory){
        return(supportedNftList);
    }

/*__________________________________Setter_____________________________________ */
    
    //Add a collection to the supportedNFT array (onlyOwner)
    function addSuppCollection(address contractAddr) external onlyOwner{
        if (supportedNft[contractAddr] != true){
            supportedNftList.push(contractAddr);
        }
        supportedNft[contractAddr] = true;
    }

    //Remove collection from the supportedNFT array (onlyOwner)
    function removeSuppCollection(address contractAddr) external onlyOwner{
        for (uint256 i = 0; i<supportedNftList.length; i++){
            if(supportedNftList[i] == contractAddr){
                supportedNftList[i] = supportedNftList[supportedNftList.length - 1];
                supportedNftList.pop();
            }
        }
    }

    //Set minimum deposit amount (onlyOwner)
    // Please use https://eth-converter.com/ to see convertion rate
    function setMinDeposit(uint256 amountInWei) external onlyOwner{
        minDeposit = amountInWei;
    }

    // Set the orcacle address (onlyOwner)
    // Should be called using Constructor, Deploy oracle first then this contract to get the oracle contract address
    function setOracleAddr(address priceOracle, address bankOracle) external onlyOwner{
        priceOracleAddr = priceOracle;
        bankOracleAddr = bankOracle;
    }

    //only allow the oracle contract to call this
    function setAssetPrice(uint256 amount) external{
        require(msg.sender == priceOracleAddr, "Only the price orcacle contract can call this function");
        nftFloorPrice = amount;
        nftLiquidationPrice = amount.mul(discountFactor).div(100);
    }

    /*
    * Set a discount factor in terms of percentage (Used in setLiquidationPrice)
    * percentage = 80 implies a 80% discount on the OpenSea floor price
    * if OpenSea floor Price = 10e percentage = 80 implies that the bank will only
    * pay 8e for the NFT
    * Only take integer no floating point please
    */
    function setDiscountFactor(uint256 percentage) external onlyOwner{
        discountFactor = percentage;
    }

/*__________________________________Other_____________________________________ */
    
    //Check if a user is in this list 
    function isUserInList(address input) private view returns(bool){
        for (uint256 i = 0;  i < ethDepositorList.length; i++){
            if (ethDepositorList[i] == input){
                return true;
            }
        }
        return false;
    }

/*___________________________Below from NFT Loaning____________________________ */

/*__________________________________NFT Loaning_________________________________ */
    //For starting a nft instalment loan. block.timestamp gives you the current time in unix timestamp
    //Please use https://www.unixtimestamp.com/ for conversion
    function startLoan(address nftContractAddr, uint256 tokenId, uint256 dayTillDue) external payable{
        require(msg.value < nftFloorPrice, "Please consider direct buying instead of loan");
        require(acceptLoan(nftFloorPrice, msg.value), "Minimum down payment requirement not met");
        NftToken memory token = NftToken(nftContractAddr, tokenId);
        require(checkNftBalance(token), "The contract doesnt own this NFT");
        require(!checkNftInList(token), "The NFT you selected is on others instalment loan");

        //Create the loan, msg.value = down payment
        uint256 dueTime = block.timestamp + 86400*dayTillDue;
        uint256 loanInterest = setLoanInterest(nftFloorPrice, msg.value);
        uint256 baseCRate = calBaseCumuRate(block.timestamp, dueTime);
        InLoan memory temp = InLoan(
            msg.sender, //loanOwner
            nftFloorPrice, //nftValue
            nftFloorPrice - msg.value, //outstanding balance
            nftFloorPrice - msg.value, //debt
            block.timestamp, //start time
            dueTime, //due time
            block.timestamp + 86400, //next pay day
            baseCRate,
            baseCRate,
            0,
            loanInterest, 
            token
        ); //block.timestamp = now unix time stamp, 86400 = 1 day

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
        //Add to NFT Loan Profit
        netProfit += int256(msg.value);
    }

    function calBaseCumuRate(uint256 start, uint256 end) internal pure returns(uint256){
        uint256 tempp = 10**18;
        return tempp.div((end-start).div(86400));
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
                //Add to NFT Loan Profit
                netProfit += int256(msg.value);
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

    //Can be internal
    function acceptLoan(uint256 nftValue, uint256 downPayment) internal view returns(bool){
        if (downPayment <= 0){
            return false;
        }
        //Calculate the percentage of eth that this contract contribute to the loan and compare to the LoanToValue (60%) requirement
        else if( (nftValue - downPayment).mul(100).div(nftValue) > LoanToValue ){
            return false;
        }
        else{
            return true;
        }
    }

    function setLoanInterest(uint256 nftValue, uint256 downPayment) internal view returns(uint256){
        //Every 10% above LoanToValue, decrease 0.2% in interest rate
        if ( (nftValue - downPayment).mul(100).div(nftValue) >= LoanToValue){
            return baseInterstRate;
        }
        else{
            return baseInterstRate - ( LoanToValue - (nftValue - downPayment).mul(100).div(nftValue) ).mul(10**18).mul(2).div(100);
        }
    }

    function buyNFT(address nftContractAddr, uint256 tokenId) external payable{
        NftToken memory token = NftToken(nftContractAddr, tokenId);
        require(supportedNft[nftContractAddr], "Your NFT collection is not verified");
        require(checkNftBalance(token), "The contract doesnt own this NFT");
        require(!checkNftInList(token), "The NFT you selected is on others instalment loan");
        require(msg.value == nftFloorPrice, "You pay too much or too less");
        transferNft(token,msg.sender);
        //Add to NFT Profit
        netProfit += int256(msg.value);
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
    //only callable by the bank Oracle
    function callDueLoan() internal{
        for (uint256 i=0; i < customerList.length; i++){
            for(uint256 j=0; j < addressToInLoans[customerList[i]].length; j++){
                if(addressToInLoans[customerList[i]][j].dueTime < block.timestamp){
                    if(addressToInLoans[customerList[i]][j].defaultCount >= defaultRate){
                        loanRemoveList.push(addressToInLoans[customerList[i]][j]);
                    }
                }
                if(addressToInLoans[customerList[i]][j].nextPayDay < block.timestamp){
                    //Check accumulative percentage, if doesnt fullfill, add to defaultcount
                    if( (addressToInLoans[customerList[i]][j].cumuRate + addressToInLoans[customerList[i]][j].baseCumuRate).div(10**18) < 1){
                        //Does not fullfill the daily instalment
                        if( addressToInLoans[customerList[i]][j].debt - addressToInLoans[customerList[i]][j].debt.mul(addressToInLoans[customerList[i]][j].cumuRate).div(10**18) 
                        < addressToInLoans[customerList[i]][j].outstandBalance){
                            addressToInLoans[customerList[i]][j].defaultCount++;
                            addressToInLoans[customerList[i]][j].nextPayDay += 86400;
                            addressToInLoans[customerList[i]][j].cumuRate += addressToInLoans[customerList[i]][j].baseCumuRate;
                        }
                        //Fullfilled the daily instalment
                        else{
                            addressToInLoans[customerList[i]][j].nextPayDay += 86400;
                            addressToInLoans[customerList[i]][j].cumuRate += addressToInLoans[customerList[i]][j].baseCumuRate;
                        }
                    }
                    else{
                        addressToInLoans[customerList[i]][j].cumuRate = 1000000000000000000;
                        addressToInLoans[customerList[i]][j].nextPayDay += 86400;
                        addressToInLoans[customerList[i]][j].defaultCount++;
                    }
                }
            }
        }
        removeDefaultLoan(loanRemoveList);
        delete loanRemoveList;
    }

    //Change interest on every NFT based on defaultRate
    //only allow the oracle contract to call this
    function chargeInterest() internal{
        for (uint256 i=0; i < customerList.length; i++){
            for(uint256 j=0; j < addressToInLoans[customerList[i]].length; j++){
                uint256 temp;
                if(addressToInLoans[customerList[i]][j].defaultCount == 0){
                    temp = addressToInLoans[customerList[i]][j].outstandBalance.mul(addressToInLoans[customerList[i]][j].LoanRate).div(10**18).div(100);
                    addressToInLoans[customerList[i]][j].outstandBalance += temp;
                    addressToInLoans[customerList[i]][j].debt += temp;
                }
                else if(addressToInLoans[customerList[i]][j].defaultCount == 1){
                    temp = addressToInLoans[customerList[i]][j].outstandBalance.mul(addressToInLoans[customerList[i]][j].LoanRate.mul(2)).div(10**18).div(100);
                    addressToInLoans[customerList[i]][j].outstandBalance += temp;
                    addressToInLoans[customerList[i]][j].debt += temp;
                }
                else if(addressToInLoans[customerList[i]][j].defaultCount == 2){
                    temp = addressToInLoans[customerList[i]][j].outstandBalance.mul(addressToInLoans[customerList[i]][j].LoanRate.mul(3)).div(10**18).div(100);
                    addressToInLoans[customerList[i]][j].outstandBalance += temp;
                    addressToInLoans[customerList[i]][j].debt += temp;
                }
                else if(addressToInLoans[customerList[i]][j].defaultCount == 3){
                    temp = addressToInLoans[customerList[i]][j].outstandBalance.mul(addressToInLoans[customerList[i]][j].LoanRate.mul(4)).div(10**18).div(100);
                    addressToInLoans[customerList[i]][j].outstandBalance += temp;
                    addressToInLoans[customerList[i]][j].debt += temp;
                }
            }
        }
    }

    //Remove all defaulted loan from all the array and mapping
    function removeDefaultLoan(InLoan[] memory removeList) private{
        for(uint256 i=0; i < removeList.length; i++){
            //Search the Loan index from addressToInLoans
            for (uint256 j=0; j < addressToInLoans[removeList[i].loanOwner].length; j++){
                if(addressToInLoans[removeList[i].loanOwner][j].nft.nftContractAddr == removeList[i].nft.nftContractAddr && 
                   addressToInLoans[removeList[i].loanOwner][j].nft.tokenId == removeList[i].nft.tokenId){
                    
                    //remove the loan from addressToInLoans
                    addressToInLoans[removeList[i].loanOwner][j] = 
                    addressToInLoans[removeList[i].loanOwner][addressToInLoans[removeList[i].loanOwner].length -1];
                    addressToInLoans[removeList[i].loanOwner].pop();
                    
                    //remove the loan from nftInLoan list so that it will be avalible for loaning out again
                    removeNftList(removeList[i].nft);
                    //Decrease the customers number of loans
                    customAddrToNumLoans[removeList[i].loanOwner] -= 1;

                    if (customAddrToNumLoans[removeList[i].loanOwner] <= 0){
                    //remove customer from the customerList if they dont have any loan
                        removeCustomerList(removeList[i].loanOwner);
                    }           
                }
            }

        }
    }

    /*__________________________________Getter_____________________________________ */

    //Return an array of InLoans of a user
    function getAllUserLoan(address addr) public view returns(InLoan[] memory){
        return addressToInLoans[addr];
    }

    //Return the number of Loans that a user have
    function getUserNumLoan(address addr) public view returns(uint256){
        return customAddrToNumLoans[addr];
    }

    //Return all NFT that is currently in a loan
    function getAllNftLoan() public view returns(NftToken[] memory){
        return nftInLoan;
    }

    function getAllDefaultLoan() public view returns(InLoan[] memory){
        return loanRemoveList;
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

    /*__________________________________Checker_____________________________________ */

    //Return true if a loan is fully repaid, false otherwise
    //For future use just in case, no use right now
    function checkLoanPaid(address addr, NftToken memory token) internal view returns(bool){ //internal
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
    function checkLoanExist(address addr, NftToken memory token) internal view returns(bool){ //internal
        for(uint256 i = 0; i<addressToInLoans[addr].length; i++){
            if(addressToInLoans[addr][i].nft.tokenId == token.tokenId &&
               addressToInLoans[addr][i].nft.nftContractAddr == token.nftContractAddr){
                return true;
            }
        }
        return false;
    }

    //Check if the nft is in the loan list
    function checkNftInList(NftToken memory token) internal view returns(bool){
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
    function checkNftBalance(NftToken memory token) internal view returns(bool){
        ERC721 Nft = ERC721(token.nftContractAddr);
        if (Nft.ownerOf(token.tokenId) == address(this)){
            return true;
        }
        else{
            return false;
        }
    }

    //For degugging
    function checkCustomerInList(address addr) internal view returns(bool){
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

    //Widthdraw All ETH for testnet purpose only
    function withdraw() public onlyOwner {
        Address.sendValue(payable(msg.sender), address(this).balance);
    }

    function addstartUpFund() external payable onlyOwner{
        netProfit += int256(msg.value);
    }

    //Forward one day for all loans next payment day and due time, for testing the contract only
    function fowardOneDay() external onlyOwner{
        for (uint256 i=0; i < customerList.length; i++){
            for(uint256 j=0; j < addressToInLoans[customerList[i]].length; j++){
                addressToInLoans[customerList[i]][j].nextPayDay -= 86400;
                addressToInLoans[customerList[i]][j].dueTime -=86400;
            }
        }
    }

    /*_____________________________Oracle Access___________________________________*/
    //Called by ChainLink Keepers Time-based Trigger
    function bankOracleControl() external{
        require(msg.sender == bankOracleAddr, "Only the bank orcacle contract can call this function");
        callDueLoan();
        chargeInterest();
        paidInterest();
    }

}