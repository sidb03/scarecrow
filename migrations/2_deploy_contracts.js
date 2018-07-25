var scii = artifacts.require("./scii.sol");


module.exports = function(deployer) {
  deployer.deploy(scii, web3.eth.accounts[1], web3.eth.accounts[2]);
};
