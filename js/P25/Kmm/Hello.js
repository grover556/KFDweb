// Hello

class Hello extends KmmBody {
    HelloFlag = {
        "IdOnly": 0x00,
        "RekeyRequestWithUkek": 0x01,
        "RekeyRequestWithoutUkek": 0x02
    };
    #_flagValue;
    get FlagValue() {
        return this.#_flagValue;
    }
    set FlagValue(value) {
        this.#_flagValue = value;
    }
    ToBytes() {

    }
}