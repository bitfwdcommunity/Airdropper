const fs = require('fs');
const ethers = require('ethers');
const utils = ethers.utils;
const BN = require('bn.js');
const Wallet = ethers.Wallet;
const providers = ethers.providers;
const contract = ethers.contract;
const config = require('./config.js');
const balances = require('./balances.json').state;

// set up provider
const network = providers.networks.ropsten;
const apiKey = config.apiKey;
const provider = new providers.InfuraProvider(network, apiKey);

const contractAddress = config.contractAddress;
const abi = config.abi;
const wallet = Wallet.fromMnemonic(config.seed);
wallet.provider = provider;

// set up airdrop quantity; currently 1000 per drop
const airdropQty = "1000000000000000000000";
// set time between api calls
const duration = 0.1;
const gasLimit = 300000;
const gasPrice = 5000000000; // 5 gwei
const startingIndex = -1;

const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
const walletAddress = wallet.getAddress();

main();

// main function call where airdrop takes place
async function main()
{
  let nonce;

  try
  {
    nonce = await wallet.getTransactionCount();
  }
  catch(e)
  {
    console.log(e);
  }

  let index = 0;

  Object.entries(balances).forEach((addr, index) =>
  {
    let address = addr[0];
    let balance = addr[1].balance;
    setTimeout(() =>
      {
        if (index <= startingIndex) return;
        airdrop(index, address, nonce);
        nonce = nonce + 1;
      }, index * duration * 1000);
  })
}

// function to generate airdrop transaction from wallet file, prints mined tx when complete
async function airdrop(index, address, nonce)
{
  const options =
  {
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    nonce: nonce
  }

  let tx, minedTx;

  try
  {
    tx = await tokenContract.transfer(address, utils.bigNumberify(airdropQty), options);
  }
  catch (e)
  {
    console.log(e);
  }

  try
  {
    minedTx = await provider.waitForTransaction(tx.hash);
  }
  catch (e)
  {
    console.log(e);
  }

  console.log('tx mined at index:', index, 'with hash:', minedTx.hash);
}
