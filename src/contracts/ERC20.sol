// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function depositOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function deposit(uint256 amount) external returns (bool);
    function withdraw(uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract ERC20Basic is IERC20 {

    string public constant name = "ERC20Basic";
    string public constant symbol = "ERC";
    uint8 public constant decimals = 18;


    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    mapping(address => uint256) deposits;

    uint256 totalSupply_ = 120000 ether;


    constructor() {
        balances[msg.sender] = 10000 ether;
        balances[0xA7207a289D7ed09FA68D2c93c0e6b9d8Ac91F80F] = 10000 ether;
        balances[address(this)] = 100000 ether;
    }

    function totalSupply() public override view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function depositOf(address tokenOwner) public override view returns (uint256) {
        return deposits[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender]-numTokens;
        balances[receiver] = balances[receiver]+numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner]-numTokens;
        allowed[owner][msg.sender] = allowed[owner][msg.sender]-numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }

    function deposit(uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender]-numTokens;
        balances[address(this)] = balances[address(this)]+numTokens;
        deposits[msg.sender] = deposits[msg.sender]+numTokens;
        emit Transfer(msg.sender, address(this), numTokens);
        return true;
    }

    function withdraw(uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[address(this)]);
        require(numTokens <= deposits[msg.sender]);
        balances[msg.sender] = balances[msg.sender]+numTokens;
        balances[address(this)] = balances[address(this)]-numTokens;
        deposits[msg.sender] = deposits[msg.sender]-numTokens;
        emit Transfer(address(this), msg.sender, numTokens);
        return true;
    }
}
