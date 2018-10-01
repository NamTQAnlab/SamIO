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
  const value = ether(42);
  const expectedTokenAmount = rate.mul(value);
  var contractAddress = '0xae84a61efbaa0757df94a7156a48c2b873c0a44f';
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
  var registry;
  var balanceSheet;
  var _token;
  let tokenName = "PATToken";
  let tokenSymbol = "PAT";
  let varLinkDoc = 'https://drive.google.com/open?id=1ZaFg2XtGdTwnkvaj-Kra4cRW_ia6tvBY';
  let fixedLinkDoc = 'https://drive.google.com/open?id=1JYpdAqubjvHvUuurwX7om0dDcA5ycRhc';
  describe('when not paused', function(){
    it('should be mint throungh contractInstance', async function(){ // test mint ok
      let beforeBalan = await contractInstance.balanceOf(owner);
      await contractInstance.mint(owner, amount,{from: owner});
      let AfeterBalan = await contractInstance.balanceOf(owner);
      AfeterBalan.minus(beforeBalan).should.be.bignumber.equal(amount);
    });
  });
  describe('mint for crowdsale', async function(){
    it('should be mint', async function(){
      this.CrowdsaleExchangeToken = await CrowdsaleExchangeToken.new(rate, wallet , contractAddress);
      _token = await PATToken.new(tokenName, tokenSymbol, fixedLinkDoc, varLinkDoc, systemWallet);
      balanceSheet = await BalanceSheet.new();
      registry = await Registry.new();
      await balanceSheet.transferOwnership(_token.address).should.be.fulfilled;
      await registry.setAttribute(wallet, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;
      await _token.mint(wallet, 1000).should.be.fulfilled;
    });
  });
  describe('buyTokensExchange', async function(){
    beforeEach(async function(){
      await contractInstance.mint(owner, amount,{from: owner});
      this.CrowdsaleExchangeToken = await CrowdsaleExchangeToken.new(rate, wallet , contractAddress);
      _token = await PATToken.new(tokenName, tokenSymbol, fixedLinkDoc, varLinkDoc, systemWallet);
      balanceSheet = await BalanceSheet.new();
      registry = await Registry.new();
      await balanceSheet.transferOwnership(_token.address).should.be.fulfilled;
      await registry.setAttribute(wallet, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;
      await _token.mint(wallet, 1000);
      let wall = await _token.balanceOf(wallet);
      console.log(wall);
    });
    it('should accept payments', async function () {
      let beforeEx  = await contractInstance.balanceOf(beneficiary);
      console.log(beforeEx);
      this.CrowdsaleExchangeToken.buyTokensExchange(beneficiary, 50).should.be.fulfilled;
      let afterEX   = await contractInstance.balanceOf(beneficiary);
      console.log(afterEX);
    });
    // it('requires a non-null token', async function () {
    //   console.log(1111);
    //     CrowdsaleExchangeToken.new(rate, wallet, ZERO_ADDRESS).should.be.fulfilled;
    // });
    // it('requires a non-zero rate', async function () {
    //   await assertRevert(
    //     CrowdsaleExchangeToken.new(0, wallet, contractAddress)
    //   );
    // });
    // it('requires a non-null beneficiary', async function () {
    //   await assertRevert(
    //     this.CrowdsaleExchangeToken.buyTokensExchange(ZERO_ADDRESS, contractAddress , 2 )
    //   );
    // });
    // it('reverts on zero-valued payments', async function () {
    //   await assertRevert(
    //     this.CrowdsaleExchangeToken.buyTokensExchange(ZERO_ADDRESS, contractAddress , 0 )
    //   );
    // });

  })
})
