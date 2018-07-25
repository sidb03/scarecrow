pragma solidity ^0.4.23;


//TODO: Rainfall waala threshold to be implemented at end of season
contract Scii {
    enum calamity {DROUGHT, FLOOD, CYCLONE, FIRE, FROST, EARTHQUAKE}
    enum _policyStatus {OPEN, CLAIMED, CLOSED}
    struct Farmer {
        string name;
        uint numberOfMonths;
        uint policyInitiateTimeStamp;
        address adr;
        uint area;
        uint cropId;
        uint tehsil;
        uint loanAmount;
        _policyStatus policyStatus;
    }
    mapping (address=> uint) FarmerIdOf;
    mapping (uint=> Farmer) Farmer;

    struct Crop{
        //Weather based thresholds
        string name;
        uint premium;
        string minConditionData;
        //uint minRainfall;
    }
    mapping(uint => Crop) crop;
    uint crops = 0;
    struct Tehsil {
        uint[] farmers;
        address insuranceCompany;
        uint tehsilId;
        string currentConditions;
        string name;
        //Other weather thresholds and parameters
    }
    mapping(uint => Tehsil) tehsil;
    uint tehsils =0;
    address owner;
    uint[][] scaleOfFinance; // 2-D array with tehsil vs crops.
    uint[][] insurancePremiumRate;
    mapping(uint => uint) tehsilOfFarmer; //farmer id to tehsil id mapping
    mapping(address => uint[]) tehsilsOf; //tehsil ids under a particular insurance company

    
    uint FarmerCount=0;

    address goi;
    address bankAddress;

    constructor (address goi, address bankAddress) {
        owner = msg.sender;
    }

    //Reg functions 
    function addFarmer(string _name, uint _area, uint _crop, uint _tehsil, uint _loanAmount) public constant onlyBankAddress returns(bool success) {
        FarmerIdOf[msg.sender] = FarmerCount;
        Farmer[FarmerCount].name = _name;
        Farmer[FarmerCount].adr = msg.sender;
        Farmer[FarmerCount].area = _area;
        Farmer[FarmerCount].crop = _crop;
        Farmer[FarmerCount].tehsil = _tehsil;
        Farmer[FarmerCount].loanAmount = area*getScaleOfFinance(_crop, _tehsil);
        tehsil[_tehsil].farmers.push(FarmerCount);
        FarmerCount++;
    }
    function addTehsil(string _name, string _currentConditions, address _insuranceCompany) public returns(bool success) {
        tehsil[tehsils].name = _name;
        tehsil[tehsils].currentConditions = _currentConditions;
        tehsil[tehsils].insuranceCompany = _insuranceCompany;
        tehsilsOf[_insuranceCompany].push(tehsils);
        tehsils++;
    }
    function addCrop(string _name, string _minConditions, uint _premium) public {
        crop[crops].name = _name;
        crop[crops].premium = _premium;
        crop[crops].minConditionData = _minConditions;
    }

    function addScaleOfFinance(uint tehsilId, uint cropId, uint scf) onlyOwner {
        scaleOfFinance[tehsilId][cropId] = scf;
    }

    function addPremiumRate(uint tehsilId, uint cropId, uint _premium)  {
        require(msg.sender == tehsil[tehsilId].insuranceCompany);
        insurancePremiumRate[tehsilId][cropId] = _premium;
    }

    //Premium functions
    function getAllPremium(uint _timestamp) {
        uint govAmount = 0;
        for(uint i=0; i < tehsilsOf[msg.sender].legth; i++) {
            for(uint j=0; j < tehsils[i].farmers.length; j++) {
                uint n = getNumberOfMonths(_timestamp, j);
                if(Farmer[j].policyStatus == _policyStatus.OPEN) {
                    uint amount = (n - Farmer[j].numberOfMonths) * calculatePremiumAmountFarmer(Farmer[j].cropid, Farmer[j].loanAmount);
                    govAmount += calculateGovPremiumAmount(i, Farmer[j].cropid, Farmer[j].loanAmount);
                    Farmer[j].numberOfMonths = n;
                    transferFrom(Farmer[j].adr, msg.sender, amount);
                }
            }
        }
        transferFrom(goi, msg.sender, govAmount);
    }
    
    function getNumberOfMonths(uint _timestamp, uint id) {
        return ((_timestamp - Farmer[id].policyInitiateTimeStamp)/1231);
    }
    function calculatePremiumAmountFarmer(cropId,suminsured) {
        return suminsured*(crop[cropId].premium); //TODO: Perform this mulitplication
    }
    function calculateGovPremiumAmount(tehsilId, cropid, sumInsured) {
        return suminsured*(insurancePremiumRate[tehsilId][cropId] - crop[cropId].premium);
    }

    //Claim handling functions

    function farmerClaims() {
        uint farmerId = FarmerIdOf[msg.sender]
        require(Farmer[farmerId].policyStatus == _policyStatus.OPEN);
        return (tehsil[Farmer[farmerId].tehsilId].currentConditions, Farmer[farmerId].cropid);
    }    
    
    function tehsilClaim(uint tehsilId) onlyOwner {

        for (var j = 0; j < Tehsil[tehsilId].farmers.length; j++) {
            -
        }
    }

    function getPayoutAmount()
    function 1



    function tehsilCalamity(calamity code, districtno, tehsilno);

    //TODO: add Tehsil
    //TODO: createTehsilCalamity
    //TODO: 
}