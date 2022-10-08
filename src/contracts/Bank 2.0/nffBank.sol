// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract nffBank{

    address public owner;
    uint256 public minDeposit;
    uint256 public nftLiquidationPrice;
    uint256 public discountFactor;
    address public oracleAddr;
    //Use to store user's eth balance
    mapping(address => uint256) addressToBalances;
    //Use to check user's address existance
    mapping(address => bool) userChecker;
    //Use to check if an NFT colelction is supported
    mapping(address => bool) supportedNft;
    //Use to store key (address) of people who deposit ETH
    address[] private ethDepositorList;
    //For debugging supported NFT
    address[] private supportedNftList;

    using SafeMath for uint256;

    constructor(){
        minDeposit = 0.5 ether;
        owner = msg.sender;
        //initial discount factor
        discountFactor = 70;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sorry you are not the owner");
        _;
    }

/*__________________________________ETH Banking_________________________________ */

    //User deposite ETH through this function
    function depositETH() external payable{
        require(msg.value >= minDeposit, "minimum deposit requirement not met");
        addressToBalances[msg.sender] += msg.value;
        userChecker[msg.sender] = true;
        if(isUserInList(msg.sender) == false){
            ethDepositorList.push(msg.sender);
        }
    }

    //called by ChainLink Keepers Time-based Trigger
    function paidInterest() private{
        
    }

    //User withdrawETH through this function
    function withdrawETH(uint256 amount) external payable {
        require (addressToBalances[msg.sender] >= amount);
        addressToBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

/*__________________________________NFT Liquidating________________________________ */

    function liquidateNFT(address contractAddr, uint256 tokenId) external payable{
        //First check if the NFT collection is verified on our platform
        require(supportedNft[contractAddr], "Your NFT collection is not verified");
        ERC721 Nft = ERC721(contractAddr);
        //Second check if the user approved this contract to use the NFT token
        require(Nft.isApprovedForAll(msg.sender, address(this)), "This contract must be approved to use your NFT");
        //Third check if the user own the NFT token
        require(Nft.ownerOf(tokenId) == msg.sender, "caller must own the NFT"); //no need
        //All statisfied then call transfer
        Nft.transferFrom(msg.sender, address(this), tokenId);
        //Set condition on amout paid later
        payable(msg.sender).transfer(nftLiquidationPrice);
    }

/*__________________________________Getter_____________________________________ */
    
    //Check Individual balance for GUI
    function getUserBalance(address addr) public view returns(uint256){
        return addressToBalances[addr];
    }

    //Check all user list for debug
    function getethDepositorList() public view returns(address[] memory){
        return(ethDepositorList);
    }

    function getsupportedNftList() public view returns(address[] memory){
        return(supportedNftList);
    }

    function getsupportedNftMap(address contractAddr) public view returns(bool){
        return(supportedNft[contractAddr]);
    }

/*__________________________________Setter_____________________________________ */
    
    //Add a collection to the supportedNFT array (onlyOwner)
    function addSuppCollection(address contractAddr) external onlyOwner{
        supportedNft[contractAddr] = true;
        supportedNftList.push(contractAddr);
    }

    //Set minimum deposit amount (onlyOwner)
    // Please use https://eth-converter.com/ to see convertion rate
    function setMinDeposit(uint256 amountInWei) external onlyOwner{
        minDeposit = amountInWei;
    }

    // Set the orcacle address (onlyOwner)
    // Should be called using Constructor, Deploy oracle first then this contract to get the oracle contract address
    function setOracleAddr(address contractAddr) external onlyOwner{
        oracleAddr = contractAddr;
    }

    //only allow the oracle contract to call this
    function setLiquidationPrice(uint256 amount) external{
        require(msg.sender == oracleAddr, "Only the orcacle contract can call this function");
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

}