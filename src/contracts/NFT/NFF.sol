// SPDX-License-Identifier: MIT
import './ERC721A.sol';
import "@openzeppelin/contracts/ownership/Ownable.sol";

pragma solidity ^0.8.4;

contract Nff is ERC721A, Ownable {
    uint256 maxBatchSize_ = 10;
    uint256 collectionSize_ = 10000;
    uint256 public mintPrice = 1 ether;
    string public baseTokenURI;

    constructor() ERC721A("Nff", "NFF") {}

    function mint(uint256 quantity) external payable {
        // _safeMint's second argument now takes in a quantity, not a tokenId.
        require(quantity + _numberMinted(msg.sender) <= maxBatchSize_, "Exceeded mint limit");
        require(totalSupply() + quantity <= collectionSize_, "Minted out");
        require(msg.value >= (mintPrice * quantity), "Not enough ether to mint");
        _safeMint(msg.sender, quantity);
    }

    function withdraw() external payable onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        baseTokenURI = baseURI;
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }
}