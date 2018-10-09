// timer for tests specific to testrpc
module.exports = s => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [s], // 60 seaconds, may need to be hex, I forget
      id: new Date().getTime() // Id of the request; anything works, really
    }, function(err) {
      if (err) return reject(err);
      resolve();
    });
    //setTimeout(() => resolve(), s * 1000 + 600) // 600ms breathing room for testrpc to sync
  });
};

const { ethGetBlock } = require('./web3');

// Returns the time of the last mined block in seconds
async function latest () {
  const block = await ethGetBlock('latest');
  return block.timestamp;
}

// Increases ganache time by the passed duration in seconds
function increase (duration) {
  const id = Date.now();
}

/**
 * Beware that due to the need of calling two separate ganache methods and rpc calls overhead
 * it's hard to increase time precisely to a target point so design your test to tolerate
 * small fluctuations from time to time.
 *
 * @param target time in seconds
 */
async function increaseTo (target) {
  const now = (await latest());

  if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  const diff = target - now;
  return increase(diff);
}

const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

module.exports = {
  latest,
  increase,
  increaseTo,
  duration,
};
