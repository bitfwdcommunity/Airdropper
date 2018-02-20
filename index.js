const ethers = require('ethers');
const utils = ethers.utils;
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

const AIRDROP_QTY = "1000000000000000000000";
const DURATION = 0.1;
const GAS_LIMIT = 300000;
const GAS_PRICE = 5000000000; // 5 gwei
const STARTING_INDEX = -1;
const INITIAL_TOKENS = "10000000000000000000000";

const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
const walletAddress = wallet.getAddress();

main();

// main function call where airdrop takes place
async function main()
{
  let nonce;
  let sumBalance;

  try
  {
    nonce = await wallet.getTransactionCount();
    sumBalance = await sumBalances();
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
    let amount = calculateDrop(balance, sumBalance);
    setTimeout(() =>
      {
        if (index <= STARTING_INDEX) return;
        airdrop(index, address, nonce, amount);
        nonce = nonce + 1;
      }, index * DURATION * 1000);
  })
}

// custom airdrop quantity calculator
function calculateDrop(balance, sumBalance)
{
  // const decimalPoints = 10000;
  // const initialTokens = utils.bigNumberify(INITIAL_TOKENS);
  // const bal = utils.bigNumberify(balance).mul(utils.bigNumberify(decimalPoints));
  // const percentage = bal.div(sumBalance);
  //
  // const amount = percentage.mul(initialTokens).div(decimalPoints);
  //
  // return amount;
  return utils.bigNumberify(AIRDROP_QTY);
}

function sumBalances()
{
  let sum = utils.bigNumberify(0);
  Object.entries(balances).forEach((addr, index) =>
  {
    sum = sum.add(utils.bigNumberify(addr[1].balance));
  })
  return sum;
}

// function to generate airdrop transaction from wallet file, prints mined tx when complete
async function airdrop(index, address, nonce, balance)
{
  const options =
  {
    gasLimit: GAS_LIMIT,
    gasPrice: GAS_PRICE,
    nonce: nonce
  }

  let tx, minedTx;

  try
  {
    tx = await tokenContract.transfer(address, balance, options);
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
