class Version {
    major;
    minor;
    build;
    revision;
    ToString() {
        return this.temp.join(".");
    }
    constructor(value) {
        if (value === undefined) {
            this.major = 0;
            this.minor = 0;
            return;
        }
        this.Parse(value);
    }
    Parse(value) {
        if (!value.includes(".")) {
            throw "Does not include version divisions";
        }
        let temp = value.split(".");
        this.temp = temp;
        if (!isNaN(parseInt(temp[0]))) this.major = temp[0];
        if (!isNaN(parseInt(temp[1]))) this.major = temp[1];
        if (!isNaN(parseInt(temp[2]))) this.major = temp[2];
        if (!isNaN(parseInt(temp[3]))) this.major = temp[3];
        //this.major = temp[0];
        //this.minor = temp[1];
        //this.build = temp[2];
        //this.revision = temp[3];
    }
    IsGreaterThan(comp) {
        if (this.major > comp.major) {
            return true;
        }
        else if (this.major == comp.major) {
            if (this.minor > comp.minor) {
                return true;
            }
            else if (this.minor == comp.minor) {
                if ((this.build !== undefined) && (this.build !== undefined)) {

                }
                return false;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
}