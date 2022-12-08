// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';
import "./nffMain.sol";

contract nffPriceOracle is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public floorPrice;
    address public bankaddr;
    bytes32 private jobId;
    uint256 private fee;
    string public osURL;
    string public jsonPATH;

    event RequestFloorPrice(bytes32 indexed requestId, uint256 volume);

    /**
     * Initialize the link token and target oracle
     * Goerli Testnet details:
     * Link Token: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Oracle: 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7 (Chainlink DevRel)
     * jobId: ca98366cc7314957b8c012c72f05aeeb
     * https://docs.chain.link/any-api/testnet-oracles
     */
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        jobId = 'ca98366cc7314957b8c012c72f05aeeb';
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
        osURL = 'https://testnets-api.opensea.io/api/v1/collection/nff-comp4805/stats';
        jsonPATH = 'stats,floor_price';
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     *
     * After that, the floorPrice will be inserted into nffBank.sol uint256 nftLiquidationPrice
     */
    function requestFloorPriceData() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        /*
        * Set the URL to perform the GET request on OpenSea testnet API
        * Please read the doc: https://docs.opensea.io/reference/retrieving-collection-stats-testnets
        */
        req.add('get', osURL);
        /*
        Set the path to find the desired data in the API response, where the response format is:
        {"stats":
          {
            "floor_price":
          }
        }
        */
        req.add('path', jsonPATH);

        // Multiply the result by 1000000000000000000 to remove floor price decimals (uint256 format)
        int256 timesAmount = 10**18;
        req.addInt('times', timesAmount);

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    //Receive the response in the form of uint256
    function fulfill(bytes32 _requestId, uint256 _floorPrice) public recordChainlinkFulfillment(_requestId) {
        emit RequestFloorPrice(_requestId, _floorPrice);
        floorPrice = _floorPrice;
        //Insert the floorPrice to nffBank.sol uint256 nftLiquidationPrice
        nffMain(bankaddr).setAssetPrice(floorPrice);
    }

    //Allow withdraw of Link tokens from the contract
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }

    //Set the nffBank address
    function setBankAddr(address contractAddr) public onlyOwner{
        bankaddr = contractAddr;
    }

    //Set url and path for api fetch
    function setApi(string memory url, string memory jsPath) public onlyOwner{
        osURL = url;
        jsonPATH = jsPath;
    }

}
