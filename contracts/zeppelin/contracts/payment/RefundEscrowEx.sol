pragma solidity ^0.4.23;

import "./EscrowEx.sol";
import "../ownership/Ownable.sol";
import "../token/ERC20/SafeERC20.sol";

/**
 * @title RefundEscrow
 * @dev Escrow that holds funds for a beneficiary, deposited from multiple parties.
 * The contract owner may close the deposit period, and allow for either withdrawal
 * by the beneficiary, or refunds to the depositors.
 */
contract RefundEscrowEx is Ownable, EscrowEx {
  enum State { Active, Refunding, Closed }

  event Closed();
  event RefundsEnabled();
  using SafeERC20 for ERC20;



  ERC20 token;
  State public state;
  address public beneficiary;


  /**
   * @dev Constructor.
   * @param _beneficiary The beneficiary of the deposits.
   */
  constructor(address _beneficiary) public {
    require(_beneficiary != address(0));
    beneficiary = _beneficiary;
    state = State.Active;
  }

  /**
   * @dev Stores funds that may later be refunded.
   * @param _refundee The address funds will be sent to if a refund occurs.
   */
  function depositEx(address _refundee, uint256 amount) public {
    require(state == State.Active);
    super.depositEx(_refundee, amount);
  }

  /**
   * @dev Allows for the beneficiary to withdraw their funds, rejecting
   * further deposits.
   */
  function close() public onlyOwner {
    require(state == State.Active);
    state = State.Closed;
    emit Closed();
  }

  /**
   * @dev Allows for refunds to take place, rejecting further deposits.
   */
  function enableRefunds() public onlyOwner {
    require(state == State.Active);
    state = State.Refunding;
    emit RefundsEnabled();
  }

  /**
   * @dev Withdraws the beneficiary's funds.
   */
  function beneficiaryWithdraw() public {       /////**** token.transfer
    require(state == State.Closed);
  //  beneficiary.transfer(address(this).balance); // token,transfer()
    token.safeTransfer(beneficiary, token.balanceOf(address(token)));

  }

  /**
   * @dev Returns whether refundees can withdraw their deposits (be refunded).
   */
  function withdrawalAllowed(address _payee) public view returns (bool) {
    return state == State.Refunding;
  }
  function withdraw(address _payee) public {//**
    require(withdrawalAllowed(_payee));
    withdraw(_payee);
  }
}
