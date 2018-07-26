var scii = artifacts.require("./scii.sol");

//Test variables
var owner = web3.eth.accounts[0];
var goi = web3.eth.accounts[1];
var bank = web3.eth.accounts[2];
var insurance = web3.eth.accounts[3];

var crop1 = {
    id : 0,
    name : "Rice",
    minConditions : "",
    premiumRate : 2,
    indemnity : 90,
}
var crop2 = {
    id : 1,
    name : "Paddy",
    minConditions : "",
    premiumRate : 5,
    indemnity : 80,
}

var tehsil1 = {
    id : 0, 
    name : "Alwar",
    currentCondition : "",
    insurance : insurance,
    crops1 : {
        id : crop1.id, 
        name : crop1.name,
        scaleOfFinance : 1000,
        premium : 10
    }
}


var tehsil2 = {
    id : 1, 
    name : "Loahru",
    currentCondition : "",
    insurance : insurance,
    crops1 : {
        id : crop2.id,    
        name : crop2.name,
        scaleOfFinance : 5000,
        premium : 30
    }
}

var farmer1 = {
    id : 0,
    name : "Ram Singh",
    address : web3.eth.accounts[4],
    area : 2,
    tehsil : tehsil1.id,
    crop : crop1.id
}

var farmer2 = {
    id: 1,
    name : "Shyam Singh",
    address : web3.eth.accounts[5],
    area : 5,
    tehsil : tehsil2.id,
    crop : crop2.id
}

module.exports = async function (callback) {
    //console.log("Hello Frands! Chai peeloo");
    console.log("Initiating system...");
    console.log(`Adding crop ${crop1.name} with premium amount ${crop1.premiumRate}% and indemnity level ${crop1.indemnity}% `);
    await addCropDetails(crop1.name, crop1.minConditions, crop1.premiumRate, crop1.indemnity);
    console.log("\n");
    console.log(`Adding crop ${crop2.name} with premium amount ${crop2.premiumRate}% and indemnity level ${crop2.indemnity}% `);
    await addCropDetails(crop2.name, crop2.minConditions, crop2.premiumRate, crop2.indemnity);
    console.log("\n");
    console.log(`Adding tehsil ${tehsil1.name} with insurance company: ${tehsil1.insurance}`);
    await addTehsilDetails(tehsil1.name, tehsil1.currentCondition, tehsil1.insurance);
    console.log("\n");
    console.log(`Adding tehsil ${tehsil2.name} with insurance company: ${tehsil2.insurance}`);
    await addTehsilDetails(tehsil2.name, tehsil2.currentCondition, tehsil2.insurance);
    console.log("\n");
    console.log(`Adding scale of finance for crop ${tehsil1.crops1.name} in ${tehsil1.name}: ${tehsil1.crops1.scaleOfFinance}`);
    await addsScaleOfFinance(tehsil1.id,tehsil1.crops1.id,tehsil1.crops1.scaleOfFinance);
    console.log("\n");
    console.log(`Adding scale of finance for crop ${tehsil2.crops1.name} in ${tehsil2.name} : ${tehsil2.crops1.scaleOfFinance}`);
    await addsScaleOfFinance(tehsil2.id,tehsil2.crops1.id,tehsil2.crops1.scaleOfFinance);
    console.log("\n");
    console.log(`Adding premium rate for crop ${tehsil1.crops1.name} in ${tehsil1.name}: ${tehsil1.crops1.premium}`);
    await addsPremiumRate(tehsil1.id,tehsil1.crops1.id,tehsil1.crops1.premium);
    console.log("\n");
    console.log(`Adding premium rate for crop ${tehsil2.crops1.name} in ${tehsil2.name}: ${tehsil2.crops1.premium}`);
    await addsPremiumRate(tehsil2.id,tehsil2.crops1.id,tehsil2.crops1.premium);
    console.log("\n");
    console.log(`Adding farmer: ${farmer1.name} with an area of ${farmer1.area} hectares, growing Rice in Alwar`);
    await addFarmerDetails(farmer1.name, farmer1.address, farmer1.area, farmer1.crop, farmer1.tehsil);    

    console.log("\n");
    console.log(`Adding farmer: ${farmer2.name} with an area of ${farmer2.area} hectares, growing Paddy in Loharu`);
    await addFarmerDetails(farmer2.name, farmer2.address, farmer2.area, farmer2.crop, farmer2.tehsil);    

    console.log("\n");
    console.log(`Getting total collected premium for insurance company from ${tehsil1.name}..`);
    await getAllPremiums(tehsil1.id);

    console.log("\n");
    console.log(`Getting total collected premium for insurance company from ${tehsil2.name}..`);
    await getAllPremiums(tehsil2.id);

    console.log("\n");
    console.log("Making Claim for farmer 1");
    await makefarmerClaim(farmer1.address);
    console.log("\n");
    console.log("Approving claim for farmer 1!");
    await updateClaimStatus(farmer1.id, true);
    console.log("\n");
    console.log(`Making Tehsil Wide Claim for ${tehsil2.name}`);
    await makeTehsilClaim(tehsil2.id);
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