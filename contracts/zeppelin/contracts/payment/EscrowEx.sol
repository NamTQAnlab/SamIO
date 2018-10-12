pragma solidity ^0.4.24;

import "./Escrow.sol";
import "../token/ERC20/ERC20.sol";
import "../math/SafeMath.sol";
import "../token/ERC20/SafeERC20.sol";


contract EscrowEx is Escrow {
  mapping(address => uint256) private deposits;

  function deposit(address _payee, uint256 _amount) public onlyOwner {
    deposits[_payee] = deposits[_payee].add(_amount);

    emit Deposited(_payee, _amount);
  }

  function withdraw(address _payee, ERC20 _RAXTokenWallet) public onlyOwner {
    uint256 payment = deposits[_payee];
    assert(_RAXTokenWallet.balanceOf(address(_RAXTokenWallet)) >= payment);

    deposits[_payee] = 0;

    _RAXTokenWallet.transfer(_payee, payment);

    emit Withdrawn(_payee, payment);
  }
}
