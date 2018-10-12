
const bn                      = require('./helpers/bignumber.js');
const  assert                 = require('./helpers/assertRevert.js');
const  ethGetBalance          = require('./helpers/web3.js');
const ether                   = require('./helpers/ether.js')

var Web3 = require('web3');
var fs = require('fs');
var path = require('path');
const expectEvent = require('./helpers/expectEvent');
const BigNumber = web3.BigNumber;

const time = require('./helpers/timer.js');
const should = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();

const amount                 = bn.tokens(1000);
const PATToken               = artifacts.require("./PATToken.sol");
const CrowdsaleEx            = artifacts.require("./CrowdsaleEx.sol");

const BalanceSheet           = artifacts.require("./BalanceSheet.sol");
const Registry                = artifacts.require("./Registry.sol");
const regAtt                 = require('./helpers/registryAttributeConst.js');

contract('CrowdsaleEx', function(accounts){
  var CroExToken ;
  var PATTokenContract;
  var data = fs.readFileSync(path.resolve(__dirname, 'RAXabi.json'), 'utf8');
  var contractAbi = data.toString();
  contractAbi = JSON.parse(contractAbi);
  const tokenSupply = new BigNumber('1e22');
  const rate = new BigNumber(1);
  const value = bn.tokens(2);
  const expectedTokenAmount = rate.mul(value);
  var contractAddress = '0xba7cdaeb2496fb85fd02bcd09170394621948ff7'; //because  we call from ABI so please change new address of token before run this test
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  web3.eth.defaultAccount = owner;
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  var contractInstance  =  web3.eth.contract(contractAbi).at(contractAddress);
  var owner             = accounts[0];
  var purchaser         = accounts[1];
  var beneficiary       = accounts[2];
  var RAXTokenWallet    = accounts[3];
  var systemWallet      = accounts[4];
  var openingTime;
  var closingTime;
  var afterClosingTime;
  var goal =  bn.tokens(10);
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
      console.log(AfterBalan);
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


      _token = await PATToken.new(tokenName, tokenSymbol, fixedLinkDoc, varLinkDoc, systemWallet);
      balanceSheet = await BalanceSheet.new();
      registry = await Registry.new();
      await balanceSheet.transferOwnership(_token.address).should.be.fulfilled;
      await registry.setAttribute(purchaser, 4, "NO_FEE").should.be.fulfilled;
      (await registry.hasAttribute(purchaser, regAtt.IS_BLACKLISTED)).should.equal(false);
      await registry.setAttribute(purchaser, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
      await _token.setRegistry(registry.address).should.be.fulfilled;


      // CroExToken = await CrowdsaleEx.new(RAXTokenWallet , rate , systemWallet, _token.address );
      // (await registry.hasAttribute(CroExToken.address, regAtt.IS_BLACKLISTED)).should.equal(false);
      // await registry.setAttribute(CroExToken.address, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      // await _token.mint(CroExToken.address, tokenSupply);


    });
    it('should accep payments with exchange token', async function() {
      // let beforeEx  = await _token.balanceOf(purchaser); // check PAT
      //
      // await contractInstance.approve(this.CrowdsaleEx.address, amount, {from: purchaser});
      // await contractInstance.allowance(this.CrowdsaleEx.address, purchaser,  {from: purchaser});
      // await CroExToken.buyTokensExchange(purchaser,{from: purchaser}).should.be.fulfilled;
    });
});
})
