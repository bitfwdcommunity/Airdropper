# Airdropper

This is a simple node.js script that will allow you to airdrop tokens from an account to a fixed list of accounts.

## Tutorial
A tutorial on how to use this is provided on medium here. Check it out!

## Requirements
1. List of accounts that you want to airdrop to in the form of a file named "balances.json" (can be obtained by using parity export state functionality)
2. An account with the tokens on it that you will be airdropping from. Account access is currently done by using a seed or privateKey.
3. The contract address of the token contract that holds the tokens you are trying to send.
4. The ABI of the of the token contract that holds the tokens you are trying to send.

## Getting Started
1. Install npm dependencies
2. Create a config.js file with the following text:
```
modules.export = {
  seed: 'your-seed-goes-here',
  contractAddress: 'token-contract-address-goes-here',
  apiKey: 'your-infura-api-key-goes-here',
  abi: 'token-contract-abi-goes-here'
}
```
If you are using a private key, use the privateKey field instead of seed but not both.
3. Go into the index.js file and modify the following fields to your liking.
```
AIRDROP_QTY: amount of tokens per airdrop
DURATION: time between api calls (infura has no rate limit afaik)
GAS_LIMIT: amount of gas per tx (default at 300000)
GAS_PRICE: gas price in gwei you are willing to pay per tx (default at 5gwei)
INITIAL_TOKENS: total amount of tokens being airdropped
```

4. Run index.js using node. In the event that the script crashes, take the last known index that the script sent out at and replace the `startingIndex` with that number.

The script will print out every time a transaction is mined.
