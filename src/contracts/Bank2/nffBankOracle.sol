// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./nffMain.sol";

contract nffBankOracle{
    address public bankaddr;
    address public oracleAddr;
    address public owner;
    constructor(){
        bankaddr = 0x6826D0b1d84bB5FabC7CB59c2C98B3A30B7ac1cd;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sorry you are not the owner");
        _;
    }

    function accessGranted(address theSender) external view returns(bool){
        if (oracleAddr == address(0)){
            return true;
        }
        else if (oracleAddr == theSender){
            return true;
        }
        else{
            return false;
        }
    }

    function DailyBankOperation() public{
        require(this.accessGranted(msg.sender), "Sorry you are not the blockchain Oracle");
        nffMain(bankaddr).bankOracleControl();
    }

    function setBankOracleAddr(address theOracle) external onlyOwner(){
        oracleAddr = theOracle;
    }

}