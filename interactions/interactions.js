var scii = artifacts.require("./scii.sol");

var owner = web3.eth.accounts[0];
var goi = web3.eth.accounts[1];
var bank = web3.eth.accounts[2];
var insurance = web3.eth.accounts[3];
var farmer1 = web3.eth.accounts[4];
var farmer2 = web3.eth.accounts[5];

module.exports = async function (callback) {
    //console.log("Hello Frands! Chai peeloo");
    console.log("Initiating system...");
    console.log("adding crop Rice with premium amount 2%, Indemnity level: 90%");
    await addCropDetails("Rice", "RandomShit", 2, 90);
    console.log("\n");
    console.log("adding crop Paddy with premium amount 5%, Indemnity level: 80%");
    await addCropDetails("paddy", "RandomShit", 5, 80);
    console.log("\n");
    console.log("Adding tehsil Alwar with insurance company:",insurance);
    await addTehsilDetails("Alwar", "gasjdyhgajshdg", insurance);
    console.log("\n");
    console.log("Adding tehsil Loharu with insurance company:",insurance);
    await addTehsilDetails("Loharu", "gasjdyhsadgajshdg", insurance);
    console.log("\n");
    console.log("Adding scale of finance for Alwar for crop Rice: 1000");
    await addsScaleOfFinance(0,0,1000);
    console.log("\n");
    console.log("Adding scale of finance for Lohary for crop paddy: 2000");
    await addsScaleOfFinance(1,1,2000);
    console.log("\n");
    console.log("Adding premium rate for Rice in Alwar: 10%");
    await addsPremiumRate(0,0,10);
    console.log("\n");
    console.log("Adding premium rate for paddy in Lohary: 20%");
    await addsPremiumRate(1,1,20);
    console.log("\n");
    console.log("Adding farmer : Ram Singh with an area of 2 hectares, growing Rice in Alwar");
    await addFarmerDetails("Ram Singh", farmer1, 2, 0, 0);    

    console.log("\n");
    console.log("Adding farmer : Siddharth with an area of 5 hectares, growing paddy in loharu");
    await addFarmerDetails("Siddharth", farmer2, 5, 1, 1);    
    console.log("\n");
    console.log("Getting total collected premium for insurance company from Alwar..");
    await getAllPremiums(0);

    console.log("\n");
    console.log("Getting total collected premium for insurance company from Loharu..");
    await getAllPremiums(1);

    console.log("\n");
    console.log("Making Claim for farmer 1");
    await makefarmerClaim(farmer1);
    console.log("\n");
    console.log("Approving claim for farmer 1!");
    await updateClaimStatus(0, true);
    console.log("\n");
    console.log("Making Tehsil Wide Claim for Loharu");
    await makeTehsilClaim(1);
    console.log("\n");
    console.log("End of Season. All deserving farmers get payouts");
    await EndOfSeason();
    console.log("\n");
    console.log("Number of claims paid:")
    await getsNumberOfClaims();
    console.log("\n");
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
    console.log(result.tx);
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
    await instance.addBalance(insurance, 200000);
    await instance.updateFarmerClaimStatus(farmerId, status);
}
async function EndOfSeason() {
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
    await instance.endOfSeason();
}
async function getsNumberOfClaims() {
    var instance = await scii.deployed();
    var n1 = await instance.getNumberOfClaims();
    console.log("Number Of claims made:", n1.toNumber());
    var n = await instance.getNumberOfClaimsPaid();
    console.log("Number of claims paid:", n.toNumber());
}