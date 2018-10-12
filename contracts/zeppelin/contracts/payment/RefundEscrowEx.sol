pragma solidity ^0.4.24;

import "./RefundEscrow.sol";
import "./ConditionalEscrowEx.sol";


contract RefundEscrowEx is ConditionalEscrowEx, RefundEscrow {
  constructor(ERC20 _RAXTokenWallet)
    RefundEscrow(address(_RAXTokenWallet))
    public
  {

  }

  function beneficiaryWithdraw() public {
    require(state == State.Closed);
  }
}
