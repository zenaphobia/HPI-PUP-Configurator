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
    name: "Guardian Legs",
    price: 25
}
const SavageUprights = {
    name: "Savage Legs",
    price: 25
}
const BeastUprights = {
    name: "Beast Legs",
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
const GuardianbFeet = {
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
const HDLightsOn = {
    name: "No HD Lights",
    price: 0
}
const HDLightsOff = {
    name: "HD Lights enabled",
    price: 255
}

class HeadacheRack{
    constructor(size, mesh, uprights, finish, lights){
        switch(size){
            case "Size1":
                this._size = Size1;
                break;
            case "Size2":
                this._size = Size2
                break;
            case "Size4":
                this._size = Size4;
                break;
            case "Size5":
                this._size = Size5;
                break;
            case "Size6":
                this._size = Size6;
                break;
            case "Size 7":
                this._size = Size7;
                break;
            default:
                throw new TypeError("TypeError: Invalid size selection");
        }
        switch(mesh){
            case "OpenPost":
                this._mesh = OpenPost;
                break;
            case "OpenMesh":
                this._mesh = OpenMesh;
                break;
            case "FullMesh":
                this._mesh = FullMesh;
                break;
            case "OpenWave":
                this._mesh = OpenWave;
                break;
            case "FullWave":
                this._mesh = FullWave;
                break;
            default:
                throw new TypeError("TypeError: Invalid mesh selection");
        }
        switch(uprights){
            case "HoneycombUprights":
                this._uprights = HoneycombUprights;
                break;
            case "GuardianUprights":
                this._uprights = GuardianUprights;
                break;
            case "BeastUprights":
                this._uprights = BeastUprights;
                break;
            case "SavageUprights":
                this._uprights = SavageUprights;
                break;
            default:
                throw new TypeError("TypeError: Invalid upright selection");
        }
        switch(finish){
            case "PolishedAluminum":
                this._finish = PolishedAluminum;
                break;
            case "SmoothBlack":
                this._finish = SmoothBlack;
                break;
            case "Leopard":
                this._finish = Leopard;
                break;
            default:
                throw new TypeError("TypeError: Invalid finish selection");
        }
        switch(lights){
            case true:
                this._lights = HDLightsOn;
                break;
            case false:
                this._lights = HDLightsOff
        }
    }

    getPrice(){
        return this._mesh.price + this._uprights.price + this._finish.price;
    }

    set mesh(x){
        switch(x){
            case "OpenPost":
                this._mesh = OpenPost;
                break;
            case "OpenMesh":
                this._mesh = OpenMesh;
                break;
            case "FullMesh":
                this._mesh = FullMesh;
                break;
            case "OpenWave":
                this._mesh = OpenWave;
                //validator checks to see if HR is a Honeycomb
                if(this._uprights !== HoneycombUprights){
                    this._mesh = OpenMesh;
                };
                break;
            case "FullWave":
                this._mesh = FullWave;
                //validator checks to see if HR is a Honeycomb
                if(this.uprights !== HoneycombUprights){
                    this._mesh = FullMesh;
                }
                break;
            default:
                //this._mesh = FullMesh;
                throw new TypeError("TypeError: Invalid mesh selection");
        }
    }
    set uprights(x){
        switch(uprights){
            case "HoneycombUprights":
                this._uprights = HoneycombUprights;
                break;
            case "GuardianUprights":
                this._uprights = GuardianUprights;
                break;
            case "BeastUprights":
                this._uprights = BeastUprights;
                break;
            case "SavageUprights":
                this._uprights = SavageUprights;
                break;
            default:
                throw new TypeError("TypeError: Invalid upright selection");
        }
    }
    set size(x){
        switch(x){
            case "Size1":
                this._size = Size1;
                break;
            case "Size2":
                this._size = Size2
                break;
            case "Size4":
                this._size = Size4;
                break;
            case "Size5":
                this._size = Size5;
                break;
            case "Size6":
                this._size = Size6;
                break;
            case "Size 7":
                this._size = Size7;
                break;
            default:
                throw new TypeError("TypeError: Invalid size selection");
        }
    }
    set finish(x){
        switch(x){
            case "PolishedAluminum":
                this._finish = PolishedAluminum;
                if(this._uprights !== HoneycombUprights){
                    this._finish = SmoothBlack;
                }
                break;
            case "SmoothBlack":
                this._finish = SmoothBlack;
                break;
            case "Leopard":
                this._finish = Leopard;
                if(this._uprights !== HoneycombUprights){
                    this._finish = SmoothBlack;
                }
                break;
            default:
                throw new TypeError("TypeError: Invalid finish selection");
        }
    }
    set lights(x){
        switch(x){
            case true:
                this._lights = HDLightsOn;
                if(this._uprights === HoneycombUprights){
                    this._lights = HDLightsOff;
                };
                break;
            case false:
                this._lights = HDLightsOff;
            default:
                this._lights = HDLightsOff;
        }
    }
}

export default HeadacheRack;
