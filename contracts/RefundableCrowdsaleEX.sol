pragma solidity ^0.4.24;

import "./zeppelin/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "./zeppelin/contracts/payment/RefundEscrow.sol";


contract RefundableCrowdsaleEX is RefundableCrowdsale {

  uint256 public goal;

  // refund escrow used to hold funds while crowdsale is running
  RefundEscrow private escrow;
  /**
  * @dev Constructor, creates RefundEscrow.
  * @param _goal Funding goal
  */
  constructor(uint256 _goal) public {
    require(_goal > 0);
    escrow = new RefundEscrow(wallet);
    goal = _goal;
  }
  uint256 _tokenAmount;

  function _forwardFunds() internal {
    escrow.deposit.value(_tokenAmount)(msg.sender);
  }
}
