const Crowdsale = artifacts.require("./Crowdsale.sol");
const SaveMath = artifacts.require("./zeppelin/contracts/math/SafeMath.sol");

module.exports = function(deployer, network, accounts) {
  var rate = 3.5;
  var wallet = accounts[6];
  let token  = accounts[7];
  var owner  = accounts[0];
  switch (network) {
    case 'development':
      overwrite = true;
      break;
    default:
        throw new Error ("Unsupported network");
  }
    deployer.then (async () => {
      await deployer.deploy(SaveMath);
      await deployer.link(SaveMath, Crowdsale);
      return deployer.deploy(Crowdsale, rate ,wallet ,token,  {from: owner , overwrite: overwrite});
    }).then(() => {
        return Crowdsale.deployed();
    }).catch((err) => {
        console.error(err);
        process.exit(1);
    });
  };
