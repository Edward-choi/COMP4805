# COMP4805 FYP

https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md

In: src\contracts\Bank 2.0\nffMain.sol
Please enable optimization with 200 under advanced configureations in remix solidity compliler

Deposite ETH: depositETH();

Widthdraw ETH: withdrawETH(uint256 amount);

Sell NFT instantly: liquidateNFT(address contractAddr, uint256 tokenId);

Buu\y NFT instantly: buyNFT(address nftContractAddr, uint256 tokenId); //subject to future change

Start NFT Loan: startLoan(address nftContractAddr, uint256 loanAmount, uint256 dueTime, uint256 tokenId); //loan amount: The price of the loan

Repay NFT Loan: repayLoan(address nftContractAddr, uint256 tokenId);
