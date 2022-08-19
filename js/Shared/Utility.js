function ByteStringToByteList(hex) {
    let NumberChars = hex.length;
    let bytes = [];
    for (var i = 0; i < NumberChars; i += 2) {
        bytes.push(Convert.ToByte(hex.Substring(i, 2), 16));
    }
    return bytes;
}

//GZip decompression
//https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
//https://nodeca.github.io/pako/
async function Compress(content) {
    let inflatedLength = content.length;
    let deflated;
    if (window.CompressionStream) {
        //console.log("using window.CompressionStream");
        let decompressedBlob = new Blob([content], { type: "text/plain" });
        const compressor = new CompressionStream("deflate");//gzip
        const compression_stream = decompressedBlob.stream().pipeThrough(compressor);
        const compressed_ab = await new Response(compression_stream).arrayBuffer();
        deflated = new Uint8Array(compressed_ab);
        return deflated;
    }
    else {
        //console.log("CompressionStream not supported, using pako");
        try {
            deflated = pako.deflate(content);//returns Uint8Array
            return deflated;
        }
        catch(e) {
            console.error(e);
            alert(e);
            return;
        }
    }
}

async function Decompress(compressedData) {
    let inflated;
    if (window.DecompressionStream) {
        //console.log("using window.DecompressionStream");
        // Check the characteristics of the header to determine gzip vs deflate
        // pako can read gzip or deflate, but only writes gzip
        let headerInfo = new DataView(compressedData, 0, 8).getInt32(0, true);
        let compressionFormat = "deflate";
        if (headerInfo == 559903) compressionFormat = "gzip";//gzip
        //console.log("using " + compressionFormat);
        compressedData = new Uint8Array(compressedData);
        let compressedBlob = new Blob([compressedData]);//, { type: "application/gzip" }
        const decompressor = new DecompressionStream(compressionFormat);//gzip
        const decompression_stream = compressedBlob.stream().pipeThrough(decompressor);
        const decompressed_ab = await new Response(decompression_stream).arrayBuffer();//this line does not like pako compressed files
        inflated = new Uint8Array(decompressed_ab);
        return inflated;
    }
    else {
        //console.log("DecompressionStream not supported, using pako");
        console.log(new Uint8Array(compressedData));
        try {
            inflated = pako.inflate(compressedData);//returns Uint8Array
            return inflated;
        }
        catch(e) {
            console.error(e);
            alert(e);
            return;
        }
    }
}