pragma solidity ^0.4.23;


//TODO: Rainfall waala threshold to be implemented at end of season
contract Scii {
    enum _policyStatus {OPEN, CLAIMED, APPROVED, CLOSED}
    struct farmer {
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
    mapping (uint=> farmer) Farmer;
    event transferred(address from, address to, uint amount);
    struct Crop{
        string name;
        uint premium;
        string minConditionData;
        uint indemnityLevel;
    }
    mapping(uint => Crop) crop;
    uint crops = 0;
    struct Tehsil {
        uint[] farmers;
        address insuranceCompany;
        uint tehsilId;
        string currentConditions;
        string name;
    }
    mapping(uint => Tehsil) tehsil;
    uint tehsils =0;
    address owner;
    uint[][] scaleOfFinance; // 2-D array with tehsil vs crops.
    uint[][] insurancePremiumRate;
    mapping(uint => uint) tehsilOfFarmer; //farmer id to tehsil id mapping
    mapping(address => uint[]) tehsilsOf; //tehsil ids under a particular insurance company
    mapping (address => uint) balanceOf;
    uint FarmerCount=0;
    uint numberOfClaimsMade = 0; //TODO: implement number
    uint numberOfClaimsPaid = 0;
    address goi;
    address bankAddress;

    constructor (address _goi, address _bankAddress) public {
        goi = _goi;
        bankAddress = _bankAddress;
        owner = msg.sender;
    }

    modifier onlyBankAddress() {
        require(msg.sender == bankAddress);
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    modifier onlyInsuranceCompany() {
        require(tehsilsOf[msg.sender][0] != 0);
        _;
    }
    //Reg functions 
    function addFarmer(string _name, uint _area, uint _crop, uint _tehsil) public onlyBankAddress {
        FarmerIdOf[msg.sender] = FarmerCount;
        Farmer[FarmerCount].name = _name;
        Farmer[FarmerCount].adr = msg.sender;
        Farmer[FarmerCount].area = _area;
        Farmer[FarmerCount].cropId = _crop;
        Farmer[FarmerCount].tehsil = _tehsil;
        Farmer[FarmerCount].policyStatus = _policyStatus.OPEN;
        Farmer[FarmerCount].loanAmount = _area*getScaleOfFinance(_crop, _tehsil);
        tehsil[_tehsil].farmers.push(FarmerCount);
        balanceOf[msg.sender] += Farmer[FarmerCount].loanAmount;
        FarmerCount++;
    }
    function addTehsil(string _name, string _currentConditions, address _insuranceCompany) public {
        tehsil[tehsils].name = _name;
        tehsil[tehsils].currentConditions = _currentConditions;
        tehsil[tehsils].insuranceCompany = _insuranceCompany;
        tehsilsOf[_insuranceCompany].push(tehsils);
        tehsils++;
    }
    function addCrop(string _name, string _minConditions, uint _premium, uint _indemnityLevel) public {
        crop[crops].name = _name;
        crop[crops].premium = _premium;
        crop[crops].indemnityLevel = _indemnityLevel;
        crop[crops].minConditionData = _minConditions;
        crops++;
    }

    function addScaleOfFinance(uint tehsilId, uint cropId, uint scf) onlyOwner public {
        scaleOfFinance[tehsilId][cropId] = scf;
    }

    function addPremiumRate(uint tehsilId, uint cropId, uint _premium)  public {
        require(msg.sender == tehsil[tehsilId].insuranceCompany);
        insurancePremiumRate[tehsilId][cropId] = _premium;
    }

    //Premium functions
    function getAllPremium(uint _timestamp, uint tehsilId) onlyInsuranceCompany public {
        uint govAmount = 0;
            for(uint j=0; j < tehsil[tehsilId].farmers.length; j++) {
                uint n = getNumberOfMonths(_timestamp, j);
                if(Farmer[j].policyStatus == _policyStatus.OPEN) {
                    uint amount = (n - Farmer[j].numberOfMonths) * calculatePremiumAmountFarmer(Farmer[j].cropId, Farmer[j].loanAmount);
                    govAmount += calculateGovPremiumAmount(tehsilId, Farmer[j].cropId, Farmer[j].loanAmount);
                    Farmer[j].numberOfMonths = n;
                    transferFrom(Farmer[j].adr, msg.sender, amount);
                }
            }
        transferFrom(goi, msg.sender, govAmount);
    }
    
    function getNumberOfMonths(uint _timestamp, uint id) internal view returns (uint){
        return ((_timestamp - Farmer[id].policyInitiateTimeStamp)/1231);
    }
    function calculatePremiumAmountFarmer(uint cropId,uint suminsured) public view returns(uint) {
        return suminsured*(crop[cropId].premium); //TODO: Perform this mulitplication
    }
    function calculateGovPremiumAmount(uint tehsilId,uint cropid,uint sumInsured) public view returns(uint) {
        return sumInsured*(insurancePremiumRate[tehsilId][cropid] - crop[cropid].premium);
    }

    //Claim handling functions

    function farmerClaims() public  returns (uint, string, uint) {
        uint farmerId = FarmerIdOf[msg.sender];
        require(Farmer[farmerId].policyStatus == _policyStatus.OPEN);
        numberOfClaimsMade++;
        Farmer[farmerId].policyStatus = _policyStatus.CLAIMED;
        return (farmerId, tehsil[Farmer[farmerId].tehsil].currentConditions, Farmer[farmerId].cropId);
    }    
    function farmerClaimById(uint farmerId) public  returns(string, uint) {
        Farmer[farmerId].policyStatus = _policyStatus.CLAIMED;
        require(Farmer[farmerId].policyStatus == _policyStatus.OPEN);
        numberOfClaimsMade++;
        return (tehsil[Farmer[farmerId].tehsil].currentConditions, Farmer[farmerId].cropId);
    }    

    
    function getAllFarmersInTehsil(uint tehsilid) public view returns (uint[]) {
        return tehsil[tehsilid].farmers;
    }

    function updateFarmerClaimStatus(uint farmerId, bool approved) public onlyOwner {
        require(Farmer[farmerId].policyStatus == _policyStatus.CLAIMED);
        if(approved) {
            Farmer[farmerId].policyStatus = _policyStatus.APPROVED;
            uint amount = getPayoutAmount(farmerId, Farmer[farmerId].cropId);
            transferFrom(tehsil[Farmer[farmerId].tehsil].insuranceCompany, Farmer[farmerId].adr, amount); //TODO implement transfer
        }
        else {
            Farmer[farmerId].policyStatus = _policyStatus.OPEN;
        }
    } 

    function endOfSeason() public onlyOwner {
        for (uint i = 0; i < FarmerCount; i++) {
            Farmer[i].policyStatus = _policyStatus.CLOSED;
        }
        //Check for every farmer
    }

    function getPayoutAmount(uint cropId, uint farmerId) public view returns(uint) {
        return crop[cropId].indemnityLevel * farmerId;
    }
    function transferFrom(address from, address to, uint amount) internal {
        require(balanceOf[from] >= amount);
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit transferred(from, to, amount);
    }
    function getBalanceOf() public view returns(uint) {
        return balanceOf[msg.sender];
    }
    function getScaleOfFinance(uint tehsilId, uint cropId) public view returns(uint) {
        return scaleOfFinance[tehsilId][cropId];
    }
    //Update tehsil current conditions   
    //Show insurance Company, ledger
}