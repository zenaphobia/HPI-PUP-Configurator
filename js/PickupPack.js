// clientPUP = {
//     Hatch: "Flat Center Hatch",
//     Gullwing: false,
//     HeadacheRack: "Hex",
//     LadderRack: false,
//     LEDdirectionalLighting: "None", //'battery', 'wired'
//     AdditionalGullwingTray: false,
//     AdditionalLowSideTray: "None", //1, 2
//     LidFinishes: "BlackDiamondPlate", DiamondPlate, Leopard, Gladiator
//     Truckslide: "None",
// };

const FlatCenterHatch = {
    name: "Flat Center Hatch",
    price: 0
}
const DomedCenterHatch = {
    name: "Domed Center Hatch",
    price: 0
}
const NoGullwing = {
    name: "Standard",
    price: 0
}
const GullwingSelected = {
    name: "Gullwing Toolbox",
    additionalTray: 0,
    price: 0
}
const HexHeadacheRack = {
    name: "Hex Headache Rack",
    price: 0
}
const PostHeadacheRack = {
    name: "Post Headache Rack",
    price: 0
}
const NoLadderRack = {
    name: "No ladder rack selected",
    price: 0
}
const LadderRackSelected = {
    name: "Ladder rack selected",
    price: 0
}
const LedLightsWired = {
    name: "LED Lights Selected: Wired",
    price: 0
}
const LedLightsBattery= {
    name: "LED Lights Selected: Battery",
    price: 0
}
const NoLedLightsSelected = {
    name: "No LED Lights Selected",
    price: 0
}
const NoAdditionalGullwingTray = {
    name: "No additional Gullwing Tray"
}
const OneAdditionalGullwingTray = {
    name: "One additional Gullwing Tray"
}
const BlackDiamondPlateFinish = {
    name: "Black Diamond Plate",
    price: 0
}
const DiamondPlateFinish = {
    name: "Diamond Plate",
    price: 0
}
const LeopardFinish = {
    name: "Leopard",
    price: 0
}
const GladiatorFinish = {
    name: "Gladiator",
    price: 0
}
const NoTruckslide = {
    name: "No truckslide",
    price: 0
}
const TwelveHundredTruckslide = {
    name: "XT1200",
    price: 0
}
const TwoThousandTruckslide = {
    name: "XT2000",
    price: 0
}
const FourThousandTruckslide = {
    name: "XT4000",
    price: 0
}

class PickupPack{
    constructor(_hatch, _gullwing, _headacheRack, _ladderRack, _LED, _additionalGullwingTray, _additionalLowsideTray, _lidFinish, _truckslide){
        switch(_hatch){
            case "Flat":
                this.Hatch = FlatCenterHatch;
                break;
            case "Domed":
                this.Hatch = DomedCenterHatch;
                break;
        }
        switch(_gullwing){
            case true:
                this.Gullwing = GullwingSelected;
                break;
            case false:
                this.Gullwing = NoGullwing;
                break;
        }
        switch(_headacheRack){
            case "Hex":
                this.HeadacheRack = HexHeadacheRack;
                break;
            case "Post":
                this.HeadacheRack = PostHeadacheRack;
        }
        switch(_ladderRack){
            case true:
                this.LadderRack = LadderRackSelected;
                break;
            case false:
                this.LadderRack = NoLadderRack;
                break;
        }
        switch(_LED){
            case false:
                this.LED = NoLedLightsSelected;
                break;
            case "Battery":
                this.LED = LedLightsBattery;
                break;
            case "Wired":
                this.LED = LedLightsWired;
        }
        switch(_additionalGullwingTray){
            case true:
                this.Gullwing.additionalTray = 1;
                break;
            case false:
                this.Gullwing.additionalTray = 0;
        }
        switch(_additionalLowsideTray){
            case 0:
                this.AdditionalLowsideTray = 0;
                break;
            case 1:
                this.AdditionalLowsideTray = 1;
                break;
            case 2:
                this.AdditionalLowsideTray = 3;
                break;
            default:
                throw new TypeError("Please input an integer between 0 and 3");
        }
        switch(_lidFinish){
            case "DiamondPlate":
                this.Finish = DiamondPlateFinish;
                break;
            case "BlackDiamondPlate":
                this.Finish = BlackDiamondPlateFinish;
                break;
            case "Leopard":
                this.Finish = LeopardFinish;
                break;
            case "Gladiator":
                this.Finish = GladiatorFinish;
                break;
            default:
                throw new TypeError("Invalid input: Try DiamondPlate, BlackDiamondPlate, Leopard, Gladiator");
        }
        switch(_truckslide){
            case false:
                this.Truckslide = NoTruckslide;
                break;
            case "1200":
                this.Truckslide = TwelveHundredTruckslide;
                break;
            case "2000":
                this.Truckslide = TwoThousandTruckslide;
                break;
            case "4000":
                this.FourThousandTruckslide;
                break;
        }
    }

    set setHatch(_hatch){
        switch(_hatch){
            case "Flat":
                this.Hatch = FlatCenterHatch;
                break;
            case "Domed":
                this.Hatch = DomedCenterHatch;
                break;
        }
    }

    set setGullwing(_gullwing){
        switch(_gullwing){
            case true:
                this.Gullwing = GullwingSelected;
                break;
            case false:
                this.Gullwing = NoGullwing;
                break;
        }
    }

    set setHeadacheRack(_headacheRack){
        switch(_headacheRack){
            case "Hex":
                this.HeadacheRack = HexHeadacheRack;
                break;
            case "Post":
                this.HeadacheRack = PostHeadacheRack;
        }
    }

    set setLadderRack(_ladderRack){
        switch(_ladderRack){
            case true:
                this.LadderRack = LadderRackSelected;
                break;
            case false:
                this.LadderRack = NoLadderRack;
                break;
        }
    }

    set setLED(_LED){
        switch(_LED){
            case false:
                this.LED = NoLedLightsSelected;
                break;
            case "Battery":
                this.LED = LedLightsBattery;
                break;
            case "Wired":
                this.LED = LedLightsWired;
        }
    }

    set setAdditionalGullwingTray(_additionalGullwingTray){
        this.Gullwing.additionalTray = _additionalGullwingTray;
        if(this.Gullwing.additionalTray > 1){
            this.Gullwing.additionalTray = 1;
        }
        if(this.Gullwing.additionalTray < 0){
            this.Gullwing.additionalTray = 0;
        }
    }

    set setAdditionalLowsideTray(_additionalLowsideTray){
        this.AdditionalLowsideTray = _additionalLowsideTray;
        if(this.AdditionalLowsideTray > 3){
            this.AdditionalLowsideTray = 3;
        }
        if(this.AdditionalLowsideTray < 0){
            this.AdditionalLowsideTray = 0;
        }
    }
    set setLidFinish(_lidFinish){
        switch(_lidFinish){
            case "DiamondPlate":
                this.Finish = DiamondPlateFinish;
                break;
            case "BlackDiamondPlate":
                this.Finish = BlackDiamondPlateFinish;
                break;
            case "Leopard":
                this.Finish = LeopardFinish;
                break;
            case "Gladiator":
                this.Finish = GladiatorFinish;
                break;
            default:
                throw new TypeError("Invalid input: Try DiamondPlate, BlackDiamondPlate, Leopard, Gladiator");
        }
    }
    set setTruckslide(_truckslide){
        switch(_truckslide){
            case false:
                this.Truckslide = NoTruckslide;
                break;
            case "1200":
                this.Truckslide = TwelveHundredTruckslide;
                break;
            case "2000":
                this.Truckslide = TwoThousandTruckslide;
                break;
            case "4000":
                this.FourThousandTruckslide;
                break;
        }
    }
}

export default PickupPack;