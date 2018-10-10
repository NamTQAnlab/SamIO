
const EscrowEx = artifacts.require('EscrowEx');

contract('EscrowEX', function ([_, primary, ...otherAccounts]) {
  beforeEach(async function () {
    this.escrow = await EscrowEx.new({ from: primary });
  });

  shouldBehaveLikeEscrow(primary, otherAccounts);
});
