// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./nffMain.sol";

contract nffBankOracle{
    address public bankaddr;
    address public oracleAddr;
    address public owner;
    constructor(){
        bankaddr = 0x10cB5313383CA891CD805e97bbd673fc1309Abe6;
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