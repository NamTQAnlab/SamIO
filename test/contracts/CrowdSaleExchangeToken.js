import assertRevert from './helpers/assertRevert'
import ether from './helpers/ether'
import ethGetBalance from './helpers/web3'
// const web3ABI = require('web3-eth-abi');
var Web3 = require('web3');
// var web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require('fs');
var path = require('path');
const expectEvent = require('./helpers/expectEvent');
const BigNumber = web3.BigNumber;
const bn = require('./helpers/bignumber.js');
const time = require('./helpers/timer.js');
const should = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();
const amount      = bn.tokens(1000);
const PATToken               = artifacts.require("./PATToken.sol");
const CrowdsaleExchangeToken = artifacts.require("./CrowdsaleExchangeToken.sol");
const Crowdsale              = artifacts.require('./Crowdsale.sol');
const EscrowEx               = artifacts.require('./EscrowEx.sol')

// const { advanceBlock } = require('../helpers/advanceToBlock');

// const { EVMRevert } = require('../helpers/EVMRevert');
const BalanceSheet = artifacts.require("./BalanceSheet.sol");
const Registry = artifacts.require('./Registry.sol')
const regAtt = require('./helpers/registryAttributeConst.js');


contract('CrowdsaleExchangeToken', function(accounts){
  var CrowdSaleExchangeTokenContract ;
  var PATTokenContract;
  var data = fs.readFileSync(path.resolve(__dirname, 'RAXabi.json'), 'utf8');
  var contractAbi = data.toString();
  contractAbi = JSON.parse(contractAbi);
  const tokenSupply = new BigNumber('1e22');
  const rate = new BigNumber(1);
  const value = ether(2);
  const expectedTokenAmount = rate.mul(value);
  var contractAddress = '0x74ebbd75bc37c1600cdf080a877ac88b82b9c3c4'; //because  we call from ABI so please change new address of token before run this test
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  web3.eth.defaultAccount = owner;
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  //var contractInstance = new web3js.eth.Contract(abi, contractAddress);
  var contractInstance = web3.eth.contract(contractAbi).at(contractAddress);
  var owner       = accounts[0];
  var purchaser   = accounts[1]
  var beneficiary = accounts[2];
  var wallet      = accounts[3]
  var systemWallet = accounts[7]
  var acountB      = accounts[8]
  var CroExToken ;
  var openingTime;
  var closingTime;
  var afterClosingTime;
  var goal =  bn.tokens(100);
  var registry;
  var balanceSheet;
  var _token;
  let tokenName = "PATToken";
  let tokenSymbol = "PAT";
  let varLinkDoc = 'https://drive.google.com/open?id=1ZaFg2XtGdTwnkvaj-Kra4cRW_ia6tvBY';
  let fixedLinkDoc = 'https://drive.google.com/open?id=1JYpdAqubjvHvUuurwX7om0dDcA5ycRhc';
  describe('mint through contractInstance', function(){
    it('should be mint throungh contractInstance', async function(){ // test mint ok
      let beforeBalan = await contractInstance.balanceOf(owner);
      await contractInstance.mint(owner, amount, {from: owner});
      let AfterBalan = await contractInstance.balanceOf(owner);
      AfterBalan.minus(beforeBalan).should.be.bignumber.equal(amount);

    });
  });
  describe('buyTokensExchange', async function(){
    beforeEach(async function(){

      openingTime = (await time.latest()) + time.duration.weeks(1); // set openingTime and closingTime
      closingTime = openingTime + time.duration.weeks(1);
      afterClosingTime = this.closingTime + time.duration.seconds(1);



      await contractInstance.mint(owner, amount, {from: owner}); // RAX
      await contractInstance.mint(purchaser, amount, {from: owner});
      await contractInstance.transfer(purchaser, 100, {from: owner});
      let AfterBalan = await contractInstance.balanceOf(purchaser);
      // console.log(AfterBalan);

      _token = await PATToken.new(tokenName, tokenSymbol, fixedLinkDoc, varLinkDoc, systemWallet);
      balanceSheet = await BalanceSheet.new();
      registry = await Registry.new();
      await balanceSheet.transferOwnership(_token.address).should.be.fulfilled;
      await registry.setAttribute(purchaser, 4, "NO_FEE").should.be.fulfilled;
      (await registry.hasAttribute(purchaser, regAtt.IS_BLACKLISTED)).should.equal(false);
      await registry.setAttribute(purchaser, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;


      CroExToken = await CrowdsaleExchangeToken.new(rate, wallet ,_token.address, contractAddress , goal , openingTime, closingTime);
      (await registry.hasAttribute(CroExToken.address, regAtt.IS_BLACKLISTED)).should.equal(false);
      await registry.setAttribute(CroExToken.address, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.mint(CroExToken.address, tokenSupply);

      this.EscrowEx = await EscrowEx.new();
      await contractInstance.mint(this.EscrowEx.address, amount, {from: owner});

    });
    it('should accep payments with buyTokensExchange', async function() {
      let beforeEx  = await _token.balanceOf(purchaser); // check PAT
      var z = await contractInstance.balanceOf(owner);

      await contractInstance.approve(CroExToken.address, amount, {from: purchaser});
      await contractInstance.approve(this.EscrowEx.address, amount , {from: purchaser}); //_token.transferFrom(address(this), _payee, amount); // transferfrom ... call by rax token
      await contractInstance.allowance(purchaser, this.EscrowEx.address, {from: purchaser});
      await contractInstance.allowance(CroExToken.address, purchaser,  {from: purchaser});
      await contractInstance.balanceOf(this.EscrowEx.address);
      await CroExToken.buyTokensExchange(purchaser,{from: purchaser}).should.be.fulfilled;

    });
    it('should reject if amount equal 0 ', async function() {
      let beforeEx  = await _token.balanceOf(purchaser);
      await contractInstance.approve(CroExToken.address, 0, {from: purchaser}); //RAX.transferFrom( msg.sender, wallet , _amount);
      let allowance = await contractInstance.allowance(purchaser, CroExToken.address, {from: purchaser});
      await CroExToken.buyTokensExchange(beneficiary,{from: purchaser}).should.be.rejected;
    });
  });
})
