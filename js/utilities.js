function bin2dec(bin) {
    // bin2dec(101) returns 5
    return parseInt(bin, 2).toString(10);
}

function bin2hex(bin) {
    // bin2hex(11111111) returns 0xFF
    return parseInt(bin, 2).toString(2);
}

function dec2bin(dec, len) {
    // dec2bin(5) returns 101
    //return (dec >>> 0).toString(2);//without len
    //return (dec >>> 0).toString(2).padStart(len, "0");
    return parseInt(dec, 10).toString(2).padStart(len, "0");
}

function dec2hex(dec) {
    // dec2hex(255) returns 0xFF
    return parseInt(dec, 10).toString(16);
}

function hex2bin(hex) {
    // hex2bin("FF") returns 11111111
    return parseInt(hex, 16).toString(2);
}

function hex2dec(hex) {
    // hex2dec("FF") returns 255
    return parseInt(hex, 16).toString(10);
}

function BCTS(decArr) {
    let hexArr = [];
    if (decArr === undefined) return [];
    for (let i=0; i<decArr.length; i++) {
        hexArr.push(decArr[i].toString(16).toUpperCase().padStart(2, "0"));
    }
    return hexArr;
}

function LookupAlgorithmId(algId) {
    if (!Object.values(AlgorithmId).includes(algId)) {
        return "Unknown " + algId.toString(16).toUpperCase().padStart(2, "0");
    }
    return Object.keys(AlgorithmId).find(key => AlgorithmId[key] === algId);
}
function LookupMessageId(mId) {
    if (!Object.values(MessageId).includes(mId)) {
        return "Unknown " + mId.toString(16).toUpperCase().padStart(2, "0");
    }
    return Object.keys(MessageId).find(key => MessageId[key] === mId);
}
function LookupOptionalServiceId(osId) {
    if (!Object.values(OptionalServiceId).includes(osId)) {
        return "Unknown " + osId.toString(16).toUpperCase().padStart(2, "0");
    }
    return Object.keys(OptionalServiceId).find(key => OptionalServiceId[key] === osId);
}
function LookupKeyTypeFromSLN(sln) {
    let keyType = "TEK";
    let cg = sln >>> 12;

    if (cg < 0xF) {
        keyType = "TEK";
    }
    else if (cg == 0xF) {
        // UKEK are even, CKEK are odd
        if (sln % 2 == 0) {
            keyType = "UKEK";
        }
        else {
            keyType = "CKEK";
        }
    }
    return keyType;
}