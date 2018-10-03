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
  const value = ether(42);
  const expectedTokenAmount = rate.mul(value);
  var contractAddress = '0xbf325644a880684de8c7e98b5e3a93595d747655';
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
  describe('mint through contractInstance', function(){
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
      await registry.setAttribute(this.CrowdsaleExchangeToken.address, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;
      await _token.mint(this.CrowdsaleExchangeToken.address, tokenSupply);
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
      await registry.setAttribute(this.CrowdsaleExchangeToken.address, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;
      await _token.mint(this.CrowdsaleExchangeToken.address, tokenSupply);
      console.log(this.CrowdsaleExchangeToken.address);
      let test = await _token.balanceOf(this.CrowdsaleExchangeToken.address);
      console.log(test);
    });
    it('should rejected and revert a non-null beneficiary', async function () {
      await assertRevert(
        this.CrowdsaleExchangeToken.buyTokensExchange(ZERO_ADDRESS, 2)
      );
    });
    it('should reject and reverts on zero-valued payments', async function () {
      await assertRevert(
        this.CrowdsaleExchangeToken.buyTokensExchange(beneficiary, 0)
      );
    });
    it('should accept payments', async function () {
      let beforeEx  = await _token.balanceOf(beneficiary);
      console.log(beforeEx);
      this.CrowdsaleExchangeToken.buyTokensExchange(beneficiary, 500).should.be.fulfilled;
      let afterEX   = await _token.balanceOf(beneficiary);
      console.log(afterEX);
    });
  });
  describe('buyToken', async function (){
    beforeEach(async function(){
      _token = await PATToken.new(tokenName, tokenSymbol, fixedLinkDoc, varLinkDoc, systemWallet); //this.token = await SimpleToken.new();

      this.crowdsale = await crowdsale.new(rate, wallet , this._token.address);  //  this.crowdsale = await Crowdsale.new(rate, wallet, this.token.address);

      balanceSheet = await BalanceSheet.new();
      registry = await Registry.new();
      await balanceSheet.transferOwnership(_token.address).should.be.fulfilled;
      await registry.setAttribute(this.crowdsale.address, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;
      await _token.mint(this.crowdsale.address, tokenSupply);
      console.log(this.crowdsale.address);
      let test = await _token.balanceOf(this.crowdsale.address);
      console.log(test);
    });
    it('should accept payments', async function () {
      await this.crowdsale.buyTokens(beneficiary, {value: value, from: purchaser });
    });
  })
})
