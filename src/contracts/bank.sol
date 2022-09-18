// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bank {

    mapping(address => uint256) balances;

    function balanceOf(address account) public view returns (uint256) {
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
}