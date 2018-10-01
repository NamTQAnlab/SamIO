import "./zeppelin/contracts/crowdsale/Crowdsale.sol";

/*
**_beneficiary is address of purchaser
**ERC20 _tokenExchange using for the furture if any token can exchage with PAT token
**_amont is quantity of token send
**if we want to check how manny token purchase send to crowdsale, we can use _token.balanceOf(this), because quantity of token is public
*/
contract CrowdsaleExchangeToken is Crowdsale{

  constructor(uint256 _rate, address _wallet, ERC20 _tokenExchange) Crowdsale(_rate, _wallet, _tokenExchange) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_tokenExchange != address(0));
    rate = _rate;
    wallet = _wallet;
    token = _tokenExchange;
  }

  event TokenExchange(
    address indexed purchaser,
    address indexed beneficiary,
    /* uint256 value, */
    uint256 amount
    );

    function buyTokensExchange(address _beneficiary, uint256 _amount) public {  // this function use if purchaser want to buy PAT token by RAX tokens

      _preValidatePurchase(_beneficiary, _amount);

      uint256 tokenAmount = _getTokenAmount(_amount); // getToekenAmount is fucntion check rates and return rate*amount
      /* uint256 tokenAmount = 50; */
      _processPurchase(_beneficiary, tokenAmount); // token Amount will send to _beneficiary address

      /* token.transferFrom(_beneficiary, address(token), _amount);
      token.transferFrom(_beneficiary, address(this), _amount); */

      emit TokenExchange (
        msg.sender,
        _beneficiary,
       _amount
        );
      wallet.transfer(_amount);
      }
    }
