import assertRevert from './helpers/assertRevert'
import ether from './helpers/ether'
import ethGetBalance from './helpers/web3'
// const web3ABI = require('web3-eth-abi');
var Web3 = require('web3');
// var web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require('fs');
var path = require('path');
const BigNumber = web3.BigNumber;
const bn = require('./helpers/bignumber.js');
const should = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();
const amount      = bn.tokens(1000);
const PATToken               = artifacts.require("./PATToken.sol");
const CrowdsaleExchangeToken = artifacts.require("./CrowdsaleExchangeToken.sol");
const Crowdsale              = artifacts.require('./Crowdsale.sol');


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
  var contractAddress = '0x8b3b3c2eaa0527736522e4dedaf7f800345a86c0'; //because  we call from ABI so please change new address of token before run this test
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
  describe('mint for crowdsale exchange token', async function(){
    it('should be mint', async function(){
      _token = await PATToken.new(tokenName, tokenSymbol, fixedLinkDoc, varLinkDoc, systemWallet);
      balanceSheet = await BalanceSheet.new();
      registry = await Registry.new();
      await balanceSheet.transferOwnership(_token.address).should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;
      CroExToken = await CrowdsaleExchangeToken.new(rate, wallet ,_token.address, contractAddress);
      // await registry.setAttribute(CroExToken, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.mint(CroExToken.address, tokenSupply);
      console.log("1111");
    });
  });
  describe('buyTokensExchange', async function(){
    beforeEach(async function(){
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
      
      CroExToken = await CrowdsaleExchangeToken.new(rate, wallet ,_token.address, contractAddress);
      (await registry.hasAttribute(CroExToken.address, regAtt.IS_BLACKLISTED)).should.equal(false);
      await registry.setAttribute(CroExToken.address, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.mint(CroExToken.address, tokenSupply);
    });

    it('should accept payments with buyTokens', async function () {
      let beforeEx  = await _token.balanceOf(purchaser);
      console.log(beforeEx);
      await CroExToken.buyTokens(purchaser, { value: value, from: purchaser }).should.be.fulfilled;
      let afterEX   = await _token.balanceOf(purchaser);
      console.log(afterEX);
    });
    it('should accep payments with buyTokensExchange', async function() {

      let beforeEx  = await _token.balanceOf(purchaser); // check PAT
      var z = await contractInstance.balanceOf(owner);
      await contractInstance.approve(CroExToken.address, amount, {from: purchaser});
      let allowance = await contractInstance.allowance(purchaser, CroExToken.address, {from: purchaser});
      await CroExToken.buyTokensExchange(purchaser,{from: purchaser}).should.be.fulfilled;
    });
  });
})
