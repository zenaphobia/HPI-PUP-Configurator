//Sizes
const Size1 = "Size 1";
const Size2 = "Size 2";
const Size4 = "Size 4";
const Size5 = "Size 5";
const Size6 = "Size 6";
const Size7 = "Size 7";

//finishes
const PolishedAluminum = {
    name: "Polished Aluminum",
    price: 155
};
const SmoothBlack = {
    name: "Smooth Black",
    price: 255
};
const Leopard = {
    name: "Leopard",
    price: 355
};

//Mesh Type
const OpenPost = {
    name: "Open Post",
    price: 125,
};
const OpenMesh = {
    name: "Open Mesh",
    price: 300,
};
const FullMesh = {
    name: "Full Mesh",
    price: 335,
};
const OpenWave = {
    name: "Open Wave",
    price: 300,
};
const FullWave = {
    name: "full Wave",
    price: 335,
};


//Uprights
const HoneycombUprights = {
    name: "Honeycomb Uprights",
    price: 25
}
const GuardianUprights = {
    name: "Guardian Uprights",
    price: 25
}
const SavageUprights = {
    name: "Savage Uprights",
    price: 25
}
const BeastUprights = {
    name: "Beast Uprights",
    price: 25
}

//Feet
const StandardBedRails = {
    name: "Standard Bed Rails",
    price: 0
}
const SavageBedRails = {
    name: "Savage Bed Rails",
    price: 150
}
const BeastBedRails = {
    name: "Beast Bed Rails",
    price: 150
}
const HoneycombFeet = {
    name: "Honeycomb Feet",
    price: 0
}
const GuardianFeet = {
    name: "Guardian Feet",
    price: 0
}
const SavageFeet = {
    name: "Guardian Feet",
    price: 0
}
const BeastFeet = {
    name: "Guardian Feet",
    price: 0
}

//Lights
const HDLightsOff = {
    name: "No HD Lights",
    price: 0
}
const HDLightsOn = {
    name: "HD Lights enabled",
    price: 255
}

class HeadacheRack{
    constructor(_size, _mesh, _uprights, _finish, _feet, _lights){
        switch(_size){
            case "Size1":
                this.size = Size1;
                break;
            case "Size2":
                this.size = Size2
                break;
            case "Size4":
                this.size = Size4;
                break;
            case "Size5":
                this.size = Size5;
                break;
            case "Size6":
                this.size = Size6;
                break;
            case "Size 7":
                this.size = Size7;
                break;
            default:
                throw new TypeError("TypeError: Invalid initial size selection");
        }
        switch(_mesh){
            case "OpenPost":
                this.mesh = OpenPost;
                break;
            case "OpenMesh":
                this.mesh = OpenMesh;
                break;
            case "FullMesh":
                this.mesh = FullMesh;
                break;
            case "OpenWave":
                this.mesh = OpenWave;
                break;
            case "FullWave":
                this.mesh = FullWave;
                break;
            default:
                throw new TypeError("TypeError: Invalid initial mesh selection");
        }
        switch(_uprights){
            case "HoneycombUprights":
                this.uprights = HoneycombUprights;
                break;
            case "GuardianUprights":
                this.uprights = GuardianUprights;
                break;
            case "BeastUprights":
                this.uprights = BeastUprights;
                break;
            case "SavageUprights":
                this.uprights = SavageUprights;
                break;
            default:
                throw new TypeError("TypeError: Invalid initial upright selection");
        }
        switch(_finish){
            case "PolishedAluminum":
                this.finish = PolishedAluminum;
                break;
            case "SmoothBlack":
                this.finish = SmoothBlack;
                break;
            case "Leopard":
                this.finish = Leopard;
                break;
            default:
                throw new TypeError("TypeError: Invalid initial finish selection");
        }
        switch(_feet){
            case "StandardBedRails":
                this.feet = StandardBedRails;
                break;
            case "SavageBedRails":
                this.feet = SavageBedRails;
                break;
            case "BeastBedRails":
                this.feet = BeastBedRails;
                break;
            case "HoneycombFeet":
                this.feet = HoneycombFeet;
                break;
            case "GuardianFeet":
                this.feet = GuardianFeet;
                break;
            case "SavageFeet":
                this.feet = SavageFeet;
                break;
            case "BeastFeet":
                this.feet = BeastFeet;
                break;
            default:
                throw new TypeError("TypeError: Invalid initial feet selection");
        }
        switch(_lights){
            case true:
                this.lights = HDLightsOn;
                break;
            case false:
                this.lights = HDLightsOff;
        }
    }

    getPrice(){
        return this.mesh.price + this.uprights.price + this.finish.price;
    }

    set SetMesh(x){
        switch(x){
            case "OpenPost":
                this.mesh = OpenPost;
                break;
            case "OpenMesh":
                this.mesh = OpenMesh;
                break;
            case "FullMesh":
                this.mesh = FullMesh;
                break;
            case "OpenWave":
                this.mesh = OpenWave;
                //validator checks to see if HR is a Honeycomb
                if(this.uprights !== HoneycombUprights){
                    this.mesh = OpenMesh;
                };
                break;
            case "FullWave":
                this.mesh = FullWave;
                //validator checks to see if HR is a Honeycomb
                if(this.uprights !== HoneycombUprights){
                    this.mesh = FullMesh;
                }
                break;
            default:
                throw new TypeError("TypeError: Invalid mesh selection");
        }
    }
    set SetUprights(x){
        switch(x){
            case "HoneycombUprights":
                this.uprights = HoneycombUprights;
                break;
            case "GuardianUprights":
                this.uprights = GuardianUprights;
                break;
            case "BeastUprights":
                this.uprights = BeastUprights;
                break;
            case "SavageUprights":
                this.uprights = SavageUprights;
                break;
            default:
                throw new TypeError("TypeError: Invalid upright selection");
        }
    }
    set SetSize(x){
        switch(x){
            case "Size1":
                this.size = Size1;
                break;
            case "Size2":
                this.size = Size2
                break;
            case "Size4":
                this.size = Size4;
                break;
            case "Size5":
                this.size = Size5;
                break;
            case "Size6":
                this.size = Size6;
                break;
            case "Size 7":
                this.size = Size7;
                break;
            default:
                throw new TypeError("TypeError: Invalid size selection");
        }
    }
    set SetFinish(x){
        switch(x){
            case "PolishedAluminum":
                this.finish = PolishedAluminum;
                if(this.uprights !== HoneycombUprights){
                    this.finish = SmoothBlack;
                }
                break;
            case "SmoothBlack":
                this.finish = SmoothBlack;
                break;
            case "Leopard":
                this.finish = Leopard;
                if(this.uprights !== HoneycombUprights){
                    this.finish = SmoothBlack;
                }
                break;
            default:
                throw new TypeError("TypeError: Invalid finish selection");
        }
    }
    set SetFeet(x){
        switch(x){
            case "StandardBedRails":
                this.feet = StandardBedRails;
                if(this.uprights === BeastUprights){
                    this.feet = BeastBedRails;
                }
                if(this.uprights === SavageUprights){
                    this.feet = SavageBedRails;
                }
                break;
            case "SavageBedRails":
                this.feet = SavageBedRails;
                if(this.uprights !== SavageUprights){
                    switch(this.uprights){
                        case GuardianUprights || HoneycombUprights:
                            this.feet = StandardBedRails;
                            console.log("Savage Bed Rails are only compatible with Savage uprights, applying standard bed rails");
                            break;
                        case BeastUprights:
                            this.feet = BeastBedRails;
                            console.log("Savage Bed Rails are only compatible with Savage uprights, applying Beast bed rails");
                            break;
                    }
                }
                break;
            case "BeastBedRails":
                this.feet = BeastBedRails;
                if(this.uprights !== BeastUprights){
                    switch(this.uprights){
                        case GuardianUprights || HoneycombUprights:
                            this.feet = StandardBedRails;
                            console.log("Savage Bed Rails are only compatible with Savage uprights, applying standard bed rails");
                            break;
                        case SavageUprights:
                            this.feet = SavageBedRails;
                            console.log("Savage Bed Rails are only compatible with Savage uprights, applying Beast bed rails");
                            break;
                    }
                }
                break;
            case "HoneycombFeet":
                this.feet = HoneycombFeet;
                if(this.uprights !== HoneycombUprights){
                    switch(this.uprights){
                        case SavageUprights:
                            this.feet = SavageFeet;
                            break;
                        case BeastFeet:
                            this.feet = BeastFeet;
                            break;
                        case GuardianFeet:
                            this.feet = GuardianFeet;
                    }
                }
                break;
            case "GuardianFeet":
                this.feet = GuardianFeet;
                if(this.uprights !== GuardianUprights){
                    switch(this.uprights){
                        case SavageUprights:
                            this.feet = SavageFeet;
                            break;
                        case BeastFeet:
                            this.feet = BeastFeet;
                            break;
                        case HoneycombFeet:
                            this.feet = HoneycombFeet;
                            break;
                    }
                }
                break;
            case "SavageFeet":
                this.feet = SavageFeet;
                if(this.uprights !== SavageUprights){
                    switch(this.uprights){
                        case HoneycombUprights:
                            this.feet = HoneycombFeet;
                            break;
                        case GuardianUprights:
                            this.feet = GuardianFeet;
                            break;
                        case BeastUprights:
                            this.feet = BeastFeet;
                            break;
                    }
                }
                break;
            case "BeastFeet":
                this.feet = BeastFeet;
                if(this.uprights !== BeastUprights){
                    switch(this.uprights){
                        case HoneycombUprights:
                            this.feet = HoneycombFeet;
                            break;
                        case GuardianUprights:
                            this.feet = GuardianFeet;
                            break;
                        case SavageUprights:
                            this.feet = SavageFeet;
                            break;
                    }
                }
                break;
            default:
                throw new TypeError("TypeError: Invalid feet selection");
        }
    }
    set SetLights(x){
        switch(x){
            case true:
                this.lights = HDLightsOn;
                if(this.uprights === HoneycombUprights){
                    this.lights = HDLightsOff;
                };
                break;
            case false:
                this.lights = HDLightsOff;
            default:
                this.lights = HDLightsOff;
        }
    }

    getPartNumber(){
        switch(this.uprights){
            case GuardianUprights:
                if(this.size === Size1 && this.mesh === OpenPost && this.lights === HDLightsOn)
                    return "4012-028-BK62";
            break;
        }
    }
}

export default HeadacheRack;
