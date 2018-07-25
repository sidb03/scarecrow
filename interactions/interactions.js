var scii = artifacts.require("./scii.sol");

var owner = web3.eth.accounts[0];
var goi = web3.eth.accounts[1];
var bank = web3.eth.accounts[2];
var insurance = web3.eth.accounts[3];
var farmer1 = web3.eth.accounts[4];
var farmer2 = web3.eth.accounts[5];

module.exports = async function (callback) {
    console.log("Hello Frands! Chai peeloo");

    console.log("adding crop 1...");
    await addCropDetails("Rice", "RandomShit", 2, 90);
    
    console.log("Adding tehsil 1...");
    await addTehsilDetails("Alwar", "gasjdyhgajshdg", insurance);

    console.log("Adding scale of finance.");
    await addsScaleOfFinance(0,0,1000);

    console.log("Adding premiuum");
    await addsPremiumRate(0,0,10);

    console.log("Adding First Farmer...");
    await addFarmerDetails("Sid", farmer1, 2, 0, 0);    

    console.log("getting Premium");
    await getAllPremiums(0);

    console.log("Making Claim.");
//    await makefarmerClaim(farmer1);

    console.log("Approving claim!");
  //  await updateClaimStatus(0, true);

    console.log("Making Tehsil Claim!");
   // await makeTehsilClaim(0);

    console.log("End of Season:");
<<<<<<< HEAD
    await EndOfSeason();
=======
    await endOfSeason();
>>>>>>> b76d4899d0c42e06aeea8ee99073b17c583b8584


    await getsNumberOfClaims();
    console.log("Ledger:\n");
    await getLedger();

}

async function addCropDetails(name, cond, prem, indem) {
    var instance = await scii.deployed();
    var result = await instance.addCrop(name, cond, prem, indem);
    console.log(result.tx);
}

async function addTehsilDetails(name, cond, ins) {
    var instance = await scii.deployed();
    var result = await instance.addTehsil(name, cond,ins);
    console.log(result.tx);
}
async function addsScaleOfFinance(teshil, crop, value) {
    var instance = await scii.deployed();
    var result = await instance.addScaleOfFinance(teshil, crop, value);
    console.log(result.tx);
}
async function addsPremiumRate(tehsil, crop, value) {
    var instance = await scii.deployed();
    var result = await instance.addPremiumRate(tehsil, crop, value, {from: insurance});
    console.log(result.tx);
}
async function addFarmerDetails(name, address, area, crop, tehsil) {
    var instance = await scii.deployed();
    var result = await instance.addFarmer(name, address, area, crop, tehsil, {from:bank});
    console.log(result.tx);
}
async function getAllPremiums(tehsil) {
    var instance = await scii.deployed();
    var result = await instance.getAllPremium(tehsil, {from: insurance});
    console.log(result);
}
async function getLedger() {
    var instance = await scii.deployed();
    var n = await instance.getLedgerLength();
    for (let i = 0; i < n; i++) {
        var entry = await instance.getLedgerEntry(i);
        console.log(entry[0]);
        console.log(entry[1]);
        console.log(entry[2].toNumber());
        console.log("\n");
    }
}
async function makefarmerClaim(userAddress) {
    var instance = await scii.deployed();
    var result = await instance.farmerClaims({from: userAddress});
    console.log(result.tx);
}
async function makeTehsilClaim(tehsilId) {
    var instance = await scii.deployed();
    var farmers = await instance.getAllFarmersInTehsil(tehsilId);
    for (let i = 0; i < farmers.length; i++) {
        await instance.farmerClaimById(farmers[i]);    
        await updateClaimStatus(farmers[i], true);
    }
}
async function updateClaimStatus(farmerId, status) {
    var instance =  await scii.deployed();
    await instance.addBalance(insurance, 2000);
    await instance.updateFarmerClaimStatus(farmerId, status);
}
<<<<<<< HEAD
async function EndOfSeason() {
=======
async function endOfSeason() {
>>>>>>> b76d4899d0c42e06aeea8ee99073b17c583b8584
    var instance = await scii.deployed();
    var n = await instance.getTotalFarmers();
    for (let i = 0; i < n; i++) {
        try {
            await instance.farmerClaimById(i);
        }
        catch(error) {
            continue;
        }
        try {
            await updateClaimStatus(i, true);
        }
        catch(error) {
            continue;
        }
    }
<<<<<<< HEAD
    await instance.endOfSeason();
=======
>>>>>>> b76d4899d0c42e06aeea8ee99073b17c583b8584
}
async function getsNumberOfClaims() {
    var instance = await scii.deployed();
    var n1 = await instance.getNumberOfClaims();
    console.log("Number Of claims made:", n1.toNumber());
    var n = await instance.getNumberOfClaimsPaid();
    console.log("Number of claims paid:", n.toNumber());
}