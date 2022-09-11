//https://bradyjoslin.com/blog/hmac-sig-webcrypto/
//https://medium.com/gft-engineering/mac-and-hmac-simply-explained-with-javascript-snippets-555e2bf82de8
//http://www.batlabs.com/encrypt.html

function generateRandomKey(len, fixParity) {
    let keychars = "";
    var key = new Uint8Array(len);
    self.crypto.getRandomValues(key);
    //console.log(key);
    
    if (fixParity) {
        key = FixupKeyParity(key);
    }
    
    key.forEach(item => {
        keychars += item.toString(16).padStart(2, "0");
    });
    //console.log(keychars);
    return keychars.toUpperCase();
}

function FixupKeyParity(key) {
    //FixupKeyParity([82,77,79,196,196,150,151,81]) should return [82,76,79,196,196,151,151,81]
    //FixupKeyParity([123,186,173,46,0,214,128,143]) should return [122,186,173,47,1,214,128,143]
    let oddParityKey = [key.length];
    for (var index=0;index<key.length; index++) {
        // Get the bits we are interested in
        oddParityKey[index] = (key[index] & 0xfe);
        // Get the parity of the sum of the previous bits
        var tmp1 = ((oddParityKey[index] & 0xF) ^ (oddParityKey[index] >> 4));
        var tmp2 = ((tmp1 & 0x3) ^ (tmp1 >> 2));
        var sumBitsMod2 = ((tmp2 & 0x1) ^ (tmp2 >> 1));
        // We need to set the last bit in oddParityKey[index] to the negation of the last bit in sumBitsMod2
        if (sumBitsMod2 == 0) {
            oddParityKey[index] |= 1;
        }
    }
    //console.log("should return [82,76,79,196,196,151,151,81]");
    //console.log("should return [122,186,173,47,1,214,128,143]");
    return oddParityKey;
}