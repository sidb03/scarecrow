'use strict';

//const assertJump = require('./helpers/assertJump');
//const timer = require('./helpers/timer');
var Token = artifacts.require("./scii.sol");
contract('surefly', function (accounts) {


    function etherInWei(x) {
        return web3.toBigNumber(web3.toWei(x, 'ether')).toNumber();
    }


    function tokenPriceInWeiFromTokensPerEther(x) {
        if (x == 0) return 0;
        return Math.floor(web3.toWei(1, 'ether') / x);
    }

    function tokenInSmallestUnit(tokens, _tokenDecimals) {
        return Math.floor(tokens * Math.pow(10, _tokenDecimals));
    }

    function getUnixTimestamp(timestamp) {
        var startTimestamp = new Date(timestamp);
        return Math.floor(startTimestamp.getTime() / 1000);
    }

    function getCurrentUnixTimestamp() {
        return Math.floor((new Date()).getTime() / 1000);
    }

    function releaseAndPostAllocate() {
        tokenInstance.setReleaseAgent(accounts[0]);
        tokenInstance.releaseToken(getCurrentUnixTimestamp());

        // for (i = _maxAddresses - _totalPostIcoContributorIds + 1; i <= _maxAddresses; i++) {
        // console.log("post id: " + i);
        //     var customerId = 0;
        //     tokenInstance.postAllocateAuctionTimeMints(accounts[i], customerId, i, 
        //         { from: accounts[0] });
        // }

    }

    before(async() => {

        tokenInstance = await Token.new( { from: accounts[0]
            });
            await tokenInstance.addUser.call(etherInWei(5000),etherInWei(2000),etherInWei(500), 50*1.1);
        await releaseAndPostAllocate();
    });

    it('Should Accept Payments', async function() {
       
        await tokenInstance.invest(accounts[0], etherInWei(2000));
        let balance =(await tokenInstance.queryPoolSize.call(accounts[0])).valueOf();
        console.log(balance);
    });

});