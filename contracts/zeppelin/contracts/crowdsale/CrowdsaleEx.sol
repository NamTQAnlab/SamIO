pragma solidity ^0.4.24;

import "./Crowdsale.sol";


contract CrowdsaleEx is Crowdsale {
  // Amount of RAX raised
  uint256 public RAXRaised;
  ERC20   public RAXTokenWallet;

  constructor(ERC20 _RAXTokenWallet) public {
    require(_RAXTokenWallet != address(0));

    RAXTokenWallet  = _RAXTokenWallet;
  }

  function exchangeTokens(
    address _beneficiary
  )
    public
  {
    uint256 _amount = RAXTokenWallet.allowance(msg.sender, address(RAXTokenWallet));
    _preValidatePurchase(_beneficiary, _amount);

    // calculate token amount to be created
    uint256 tokens = _getTokenAmount(_amount);

    // update state
    RAXRaised = RAXRaised.add(_amount);

    RAXTokenWallet.transferFrom(msg.sender, RAXTokenWallet, _amount);

    _processPurchase(_beneficiary, tokens);

    emit TokenPurchase(
      msg.sender,
      _beneficiary,
      _amount,
      tokens
    );

    _updatePurchasingState(_beneficiary, _amount);

    _forwardFunds(_amount);

    _postValidatePurchase(_beneficiary, _amount);
  }

  function _forwardFunds(uint256 _amount) internal {
  }
}
