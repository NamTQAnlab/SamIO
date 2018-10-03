import assertRevert from '../helpers/assertRevert'
import ether from '../helpers/ether'
import ethGetBalance from '../helpers/web3'
import expectEvent from '../helpers/expectEvent.js'
const bn = require('../helpers/bignumber.js');
var Web3 = require('web3');
// var web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var fs = require('fs');
var path = require('path');
const BigNumber = web3.BigNumber;
const should = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();
const amount      = bn.tokens(1000);
const PATToken               = artifacts.require("./PATToken.sol");
const CrowdsaleExchangeToken = artifacts.require("./CrowdsaleExchangeToken.sol");
const BalanceSheet = artifacts.require("./BalanceSheet.sol");
const Registry = artifacts.require('./Registry.sol')
const regAtt = require('../helpers/registryAttributeConst.js');
const Crowdsale = artifacts.require('Crowdsale');


contract('Crowdsale', function (accounts) {
  const rate = new BigNumber(1);
  var systemWallet = accounts[0];
  var wallet       = accounts[2]
  var acountB      = accounts[3];
  var investor     = accounts[4];
  var purchaser    = accounts[5];
  var balanceSheet;
  var crowdsale;
  var registry ;
  var token;
  var _token;
  var tokenName = "PATToken";
  var tokenSymbol = "PAT";
  var varLinkDoc = 'https://drive.google.com/open?id=1ZaFg2XtGdTwnkvaj-Kra4cRW_ia6tvBY';
  var fixedLinkDoc = 'https://drive.google.com/open?id=1JYpdAqubjvHvUuurwX7om0dDcA5ycRhc';
  const value = ether(2);
  const tokenSupply = new BigNumber('1e22');
  const expectedTokenAmount = rate.mul(value);
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';


  context('with token', async function () {
    context('once deployed', async function () {
      beforeEach(async function () {
        // await this.token.transfer(this.crowdsale.address, tokenSupply)
        // this.crowdsale = await crowdsale.new(rate, wallet , contractAddress);
        _token = await PATToken.new(tokenName, tokenSymbol, fixedLinkDoc, varLinkDoc, systemWallet);
        balanceSheet = await BalanceSheet.new();
        registry = await Registry.new();
        await balanceSheet.transferOwnership(_token.address).should.be.fulfilled;

        await registry.setAttribute(acountB, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;

        await registry.setAttribute(acountB, 4, "NO_FEE").should.be.fulfilled;
        await registry.setAttribute(purchaser, 4, "NO_FEE").should.be.fulfilled;

        (await registry.hasAttribute(acountB, regAtt.IS_BLACKLISTED)).should.equal(false);
        (await registry.hasAttribute(purchaser, regAtt.IS_BLACKLISTED)).should.equal(false);
        await registry.setAttribute(purchaser, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;

        await _token.setBalanceSheet(balanceSheet.address).should.be.fulfilled;
        await _token.setRegistry(registry.address).should.be.fulfilled;
        this.crowdsale = await Crowdsale.new(rate, wallet, _token.address);
        (await registry.hasAttribute(this.crowdsale.address, regAtt.IS_BLACKLISTED)).should.equal(false);
        (await registry.hasAttribute(this.crowdsale.address, regAtt.IS_BLACKLISTED)).should.equal(false);
        await registry.setAttribute(this.crowdsale.address, 4, "NO_FEE").should.be.fulfilled;
        await registry.setAttribute(this.crowdsale.address, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
        // console.log(1)
        await _token.mint(this.crowdsale.address, tokenSupply);
        let test = await _token.balanceOf(this.crowdsale.address);
        // console.log(test);
        await registry.setAttribute(acountB, regAtt.HAS_PASSED_KYC_AML, "Set HAS_PASSED_KYC_AML ON").should.be.fulfilled;
      });



        describe('buyTokens', function () {
          it('should accept payments', async function () {
            var pre = await _token.balanceOf(purchaser);
            await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser });
            var post = await _token.balanceOf(purchaser);
            post.minus(pre).should.be.bignumber.equal(value);
          });
          it('requires a non-null token', async function () {
            await assertRevert(
              Crowdsale.new(rate, wallet, ZERO_ADDRESS)
            );
          });
          it('requires a non-zero rate', async function () {
            await assertRevert(
              Crowdsale.new(0, wallet, _token.address)
            );
          });
          it('requires a non-null wallet', async function () {
            await assertRevert(
              Crowdsale.new(rate, ZERO_ADDRESS, _token.address)
            );
          });
        });
      });
    });
})
