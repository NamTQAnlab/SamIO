import "./zeppelin/contracts/crowdsale/Crowdsale.sol";
import "./zeppelin/contracts/crowdsale/price/IncreasingPriceCrowdsale.sol";
import "./zeppelin/contracts/crowdsale/distribution/RefundableCrowdsaleEx.sol";
/*
**_beneficiary is address of purchaser
**ERC20 _tokenExchange using for the furture if any token can exchage with PAT token
**_amont is quantity of token send
**if we want to check how manny token purchase send to crowdsale, we can use _token.balanceOf(this), because quantity of token is public
*/
contract CrowdsaleExchangeToken is Crowdsale, RefundableCrowdsaleEx{
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
  event TokenExchange(
    address indexed purchaser,
    address indexed beneficiary,
    /* uint256 value, */
    uint256 amount
    );

    function buyTokensExchange(address _beneficiary) public {  // this function use if purchaser want to buy PAT token by RAX tokens
     _amount = RAX.allowance(msg.sender, address(this));

     _preValidatePurchase(_beneficiary, 1000);


      RAX.transferFrom( msg.sender, wallet , _amount);
     PATRaised = PATRaised.add(_amount);

      uint256 tokenAmount = _getTokenAmount(_amount); // getToekenAmount is fucntion check rates and return rate*amount
       _processPurchase(_beneficiary, tokenAmount); // token Amount will send to _beneficiary address

      emit TokenExchange (
        msg.sender,
        _beneficiary,
        _amount
      );
      _forwardFundsToken(tokenAmount, RAX); 
    }
}
