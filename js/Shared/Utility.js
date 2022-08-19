function ByteStringToByteList(hex) {
    let NumberChars = hex.length;
    let bytes = [];
    for (var i = 0; i < NumberChars; i += 2) {
        bytes.push(Convert.ToByte(hex.Substring(i, 2), 16));
    }
    return bytes;
}

function Compress(content) {
    var deflated = pako.deflate(content);
}

function Decompress(compressedData) {
    try {
        let inflated = pako.inflate(compressedData);
    }
    catch(e) {
        console.error(e);
        return;
    }
    return inflated;
}