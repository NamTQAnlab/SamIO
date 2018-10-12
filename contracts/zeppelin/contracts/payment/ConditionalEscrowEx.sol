pragma solidity ^0.4.24;

import "./EscrowEx.sol";
import "./ConditionalEscrow.sol";


contract ConditionalEscrowEx is ConditionalEscrow, EscrowEx {
  function withdraw(address _payee, ERC20 _RAXTokenWallet) public {
    require(withdrawalAllowed(_payee));
    super.withdraw(_payee, _RAXTokenWallet);
  }
}
