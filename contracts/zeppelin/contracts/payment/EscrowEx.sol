pragma solidity ^0.4.23;

import "../math/SafeMath.sol";
import "../ownership/Ownable.sol";
import "../token/ERC20/SafeERC20.sol";
import "../token/ERC20/ERC20.sol";
import "./Escrow.sol";



/**
 * @title Escrow
 * @dev Base escrow contract, holds funds destinated to a payee until they
 * withdraw them. The contract that uses the escrow as its payment method
 * should be its owner, and provide public methods redirecting to the escrow's
 * deposit and withdraw.
 */
contract EscrowEx is Ownable , Escrow {
  using SafeMath for uint256;
  using SafeERC20 for ERC20;

  event Deposited(address indexed payee, uint256 tokenAmount);
  event Withdrawn(address indexed payee, uint256 tokenAmount);

  mapping(address => uint256) private depositsEx;

  function depositsOf(address _payee) public view returns (uint256) {
    return depositsEx[_payee];
  }



  /**
  * @dev Stores the sent amount as credit to be withdrawn.
  * @param _payee The destination address of the funds.
  */
  function deposit(address _payee , uint256 amount, ERC20 _token) public onlyOwner {
      // transfer token
    /* _token.transferFrom(_payee, address(this), amount); // transferfrom ... call by rax token */
    depositsEx[_payee] = depositsEx[_payee].add(amount);

    emit Deposited(_payee, amount);
  }

  /**
  * @dev Withdraw accumulated balance for a payee.
  * @param _payee The address whose funds will be withdrawn and transferred to.
  */
  function withdraw(ERC20 token, address _payee) public onlyOwner {
    uint256 payment = depositsEx[_payee];
    assert(token.balanceOf(address(token)) >= payment);

    token.transfer(_payee, depositsEx[_payee]); // rax token
    depositsEx[_payee] = 0;

    emit Withdrawn(_payee, payment);
  }
}
