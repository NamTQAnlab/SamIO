pragma solidity ^0.4.24;


import "../../math/SafeMath.sol";
import "./FinalizableCrowdsale.sol";
import "../../payment/RefundEscrowEx.sol";
import "../CrowdsaleEx.sol";


/**
 * @title RefundableCrowdsale
 * @dev Extension of Crowdsale contract that adds a funding goal, and
 * the possibility of users getting a refund if goal is not met.
 */
contract RefundableCrowdsaleEx is FinalizableCrowdsale, CrowdsaleEx {
  using SafeMath for uint256;

  // minimum amount of funds to be raised in weis
  uint256 public goal;

  // refund escrow used to hold funds while crowdsale is running
  RefundEscrowEx private escrow;

  /**
   * @dev Constructor, creates RefundEscrowEx.
   * @param _goal Funding goal
   */
  constructor(uint256 _goal) public {
    require(_goal > 0);
    escrow = new RefundEscrowEx(RAXTokenWallet);
    goal = _goal;
  }

  /**
   * @dev Investors can claim refunds here if crowdsale is unsuccessful
   */
  function claimRefund() public {
    require(isFinalized);
    require(!goalReached());

    escrow.withdraw(msg.sender, RAXTokenWallet);
  }

  /**
   * @dev Checks whether funding goal was reached.
   * @return Whether funding goal was reached
   */
  function goalReached() public view returns (bool) {
    return RAXRaised >= goal;
  }

  /**
   * @dev escrow finalization task, called when owner calls finalize()
   */
  function finalization() internal {
    if (goalReached()) {
      escrow.close();
      escrow.beneficiaryWithdraw();
    } else {
      escrow.enableRefunds();
    }

    super.finalization();
  }

  /**
   * @dev Overrides Crowdsale fund forwarding, sending funds to escrow.
   */
  function _forwardFunds(uint256 _amount) internal {
    escrow.deposit(msg.sender, _amount);
  }
}
