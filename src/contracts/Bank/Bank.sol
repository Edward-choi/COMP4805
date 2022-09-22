// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Nff is ERC721A, Ownable {
    uint256 maxBatchSize_ = 10;
    uint256 collectionSize_ = 10000;
    uint256 public mintPrice = 1 ether;
    string public baseTokenURI;
    
    mapping(address => uint256) balances;
    // mapping(uint256 => NFT) private _idToNFT;
    // struct NFT {
    //     address nftContract;
    //     uint256 tokenId;
    //     address payable seller;
    //     address payable owner;
    //     uint256 price;
    //     bool listed;
    // }

    constructor() ERC721A("Nff", "NFF") {}

    function balanceOf(address account) public view override returns (uint256) {
        return balances[account];
    }

    function deposit() payable public returns(bool) {
        balances[msg.sender] += msg.value;
        return true;
    }

    function withdraw(uint256 amount) public payable returns(bool) {
        require (balanceOf(msg.sender) >= amount);
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        return true;
    }

    function mint(uint256 quantity) external payable {
        // _safeMint's second argument now takes in a quantity, not a tokenId.
        require(quantity + _numberMinted(msg.sender) <= maxBatchSize_, "Exceeded mint limit");
        require(totalSupply() + quantity <= collectionSize_, "Minted out");
        require(msg.value >= (mintPrice * quantity), "Not enough ether to mint");
        _safeMint(msg.sender, quantity);
    }

    // function withdraw() external payable onlyOwner {
    //     payable(owner()).transfer(address(this).balance);
    // }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        baseTokenURI = baseURI;
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    function sellNFT(address contractAddr, uint256 tokenId) public payable {

        //Actually transfer the token to the new owner
        // ERC721A NFT = ERC721A(contractAddr);
        ERC721A(contractAddr).setApprovalForAll(msg.sender, true);
        ERC721A(contractAddr).transferFrom(msg.sender, address(this), tokenId);

        //Transfer the listing fee to the marketplace creator
        // payable(msg.sender).transfer(price);
    }

    function buyNFT(address contractAddr, uint256 tokenId) public payable {
        // uint price = 0;

        //Actually transfer the token to the new owner
        // ERC721A NFT = ERC721A(contractAddr);
        
        ERC721A(contractAddr).safeTransferFrom(address(this), msg.sender, tokenId);

        //Transfer the listing fee to the marketplace creator
    }

}