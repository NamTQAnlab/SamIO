pragma solidity ^0.4.24;

import "./zeppelin/contracts/crowdsale/distribution/RefundableCrowdsaleEx.sol";
import "./zeppelin/contracts/crowdsale/CrowdsaleEx.sol";
import "./zeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";

contract ICO is CrowdsaleEx, RefundableCrowdsaleEx , TimedCrowdsale  {
  constructor(
    uint256 _goal,
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    ERC20 _token,
    ERC20 _RAXTokenWallet
  )
    RefundableCrowdsaleEx(_goal)
    TimedCrowdsale(_openingTime, _closingTime)
    CrowdsaleEx(_rate, _wallet, _token, _RAXTokenWallet)
    public
  {
    // Do nothing now
  }
}



/*contract CrowdsaleExchangeToken is Crowdsale, RefundableCrowdsaleEx{
  uint256 public PATRaised;
  ERC20 public PAT;
  ERC20 public RAX;
  uint256 _amount ;
  constructor(uint256 _rate, address _wallet, ERC20 _tokenExchange, ERC20 _RAXtoken ,uint256 _goal, uint256 _openingTime, uint256 _closingTime )
  RefundableCrowdsaleEx(_goal)
  TimedCrowdsale( _openingTime, _closingTime)
  Crowdsale(_rate, _wallet, _tokenExchange) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_tokenExchange != address(0));
    rate = _rate;
    wallet = _wallet;
    PAT = _tokenExchange;
    RAX = _RAXtoken;
  }

  */
