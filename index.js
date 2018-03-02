const ethers = require('ethers');
const utils = ethers.utils;
const Wallet = ethers.Wallet;
const providers = ethers.providers;
const contract = ethers.contract;
const BigNumber = require('bignumber.js');
const config = require('./config.js');
const balances = require('./balances.json').state;

// disable converting to exponent form
BigNumber.config({ EXPONENTIAL_AT: 1e+9 })

const provider = new providers.JsonRpcProvider('http://localhost:8545', 'ropsten')

const contractAddress = config.contractAddress;
const abi = config.abi;

const AIRDROP_QTY = "1000000000000000000";
const DURATION = 0.1;
const GAS_LIMIT = 300000;
const GAS_PRICE = 5000000000; // 5 gwei
const STARTING_INDEX = -1;
const INITIAL_TOKENS = "100000000000000000000000000";

let wallet;
if (config.seed)
{
  wallet = Wallet.fromMnemonic(config.seed);
}
else
{
  wallet = new Wallet("0x" + config.privateKey);
}

wallet.provider = provider;

const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
const walletAddress = wallet.getAddress();

main();

// main function call where airdrop takes place
async function main()
{
  let nonce;
  let sumBalance;

  // get current account nonce &&
  // calculate sum of account balances (in case you have a complex airdrop mechanism)
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

  // send a tx with given amount every duration
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
// the default function here sends 1000 tokens per tx
// the commented out function attempts to send tokens based on the proportion
// of total eth's the account has relative to other accounts
// i.e. if you have 1% of the ETH, you will receive 1% of the tokens
function calculateDrop(balance, sumBalance)
{
  // const initialTokens = new BigNumber(INITIAL_TOKENS);
  // const bal = new BigNumber(balance);
  // const sumBal = new BigNumber(sumBalance.toString());
  // const percentage = bal.dividedBy(sumBalance);
  // const amount = percentage.multipliedBy(initialTokens);
  //
  // return utils.bigNumberify(amount.toString());
  return utils.bigNumberify(AIRDROP_QTY);
}

// sums up the total ether balance of the accounts that have been filtered out
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

  console.log('tx mined at index:', index, 'with hash:', minedTx.hash, 'and balance:', balance.toString());
}
