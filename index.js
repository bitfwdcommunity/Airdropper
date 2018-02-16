const fs = require('fs');
const ethers = require('ethers');
const utils = ethers.utils;
const BN = require('bn.js');
const Wallet = ethers.Wallet;
const providers = ethers.providers;
const contract = ethers.contract;
const config = require('./config.js');
const addresses = './addresses.txt';

// set up provider
const network = providers.networks.ropsten;
const provider = new providers.InfuraProvider(network);

const contractAddress = config.contractAddress;
const abi = config.abi;
const wallet = Wallet.fromMnemonic(config.seed);
wallet.provider = provider;

// set up airdrop quantity
const airdropQty = "1000000000000000000000";

const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
const walletAddress = wallet.getAddress();

// tokenContract.functions.balanceOf(walletAddress)
//   .then(({ balance }) => console.log("Balance: ", balance.toString()));
//
// provider.on(walletAddress, blockNumber => console.log("balance changed in block: ", blockNumber));

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

  const buf = fs.readFileSync('./addresses.txt');

  buf.toString().split('\n')
    .some((addr) =>
      {
        if (addr == '') return true;
        airdrop(addr, nonce);
        nonce = nonce + 1;
      });
}

// function to generate airdrop transaction from wallet file, prints mined tx when complete
async function airdrop(address, nonce)
{
  const options =
  {
    gasLimit: 300000,
    gasPrice: 100000000000,
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

  console.log('tx mined: ', minedTx.hash);
}
