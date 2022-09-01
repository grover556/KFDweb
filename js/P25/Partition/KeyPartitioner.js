//KeyPartitioner

class KeyPartitioner {
    outKeys;
    static #CheckForDifferentKeyLengths(inKeys) {
        let len = new Map();
        
        inKeys.forEach((key) => {
            if (!len.has(key.AlgorithmId)) {
                len.set(key.AlgorithmId, key.Key.length);
            }
            else {
                if (len.get(key.AlgorithmId) != key.Key.length) {
                    console.error("more than one length of key per algorithm id");
                    throw "more than one length of key per algorithm id";
                }
            }
        });
        //console.log(len);
    }
    static #CalcMaxKeysPerKmm(keyLength) {
        // TODO make this calc more dynamic
        
        let maxBytes = 512;
        let availBytes = maxBytes - 27;

        let keyItemBytes = 5 + keyLength;

        let maxKeys = availBytes / keyItemBytes;

        if (maxKeys < 1) {
            throw "key too large for kmm";
        }

        return Math.floor(maxKeys);
    }
    static #PartitionByAlg(inKeys, outKeys) {
        let alg = new Map();

        inKeys.forEach((keyItem) => {
            if (!alg.has(keyItem.AlgorithmId)) {
                alg.set(keyItem.AlgorithmId, []);
            }
            let temp = alg.get(keyItem.AlgorithmId);
            temp.push(keyItem);
            alg.set(keyItem.AlgorithmId, temp);
        });
        //console.log("alg", alg);
        alg.forEach((value, key, map) => {
            //console.log(key, value);
            let maxKeys = this.#CalcMaxKeysPerKmm(value[0].Key.length);
            //console.log(value[0].AlgorithmId, maxKeys);
            this.#PartitionByType(maxKeys, value);
        });
    }
    static #PartitionByType(maxKeys, inKeys, outKeys) {
        //console.log("PartitionByType(max " + maxKeys + ")", inKeys);
        let tek = [];
        let kek = [];

        inKeys.forEach((keyItem) => {
            if (keyItem.IsKek) {
                kek.push(keyItem);
            }
            else {
                tek.push(keyItem);
            }
        });
        
        this.#PartitionByActive(maxKeys, tek, outKeys);
        this.#PartitionByActive(maxKeys, kek, outKeys);
    }
    static #PartitionByActive(maxKeys, inKeys, outKeys) {
        //console.log("PartitionByActive(max " + maxKeys + ")", inKeys);
        let act = [];
        let def = [];

        inKeys.forEach((keyItem) => {
            if (keyItem.ActiveKeyset) {//keyItem.UseActiveKeyset
                act.push(keyItem);
            }
            else {
                def.push(keyItem);
            }
        });

        this.#PartitionByLength(maxKeys, act, outKeys);
        this.#PartitionByKeyset(maxKeys, def, outKeys);
    }
    static #PartitionByKeyset(maxKeys, inKeys, outKeys) {
        //console.log("PartitionByKeyset(max " + maxKeys + ")", inKeys);
        let kset = new Map();

        inKeys.forEach((keyItem) => {
            if (!kset.has(keyItem.KeysetId)) {
                kset.set(keyItem.KeysetId, []);
            }
            let temp = kset.get(keyItem.KeysetId);
            temp.push(keyItem);
            kset.set(keyItem.KeysetId, temp);
        });
        //console.log(kset);
        kset.forEach((value, key, map) => {
            this.#PartitionByLength(maxKeys, value);
        });
    }
    static #PartitionByLength(maxKeys, inKeys, outKeys) {
        //console.log("PartitionByLength(max " + maxKeys + ")", inKeys.length);
        for (var i=0; i<inKeys.length; i += maxKeys) {
            //outKeys.Add(inKeys.GetRange(i, Math.Min(maxKeys, inKeys.Count - i)));
            //this.outKeys = this.outKeys.concat(inKeys.slice(i, Math.min(maxKeys, inKeys.length)));
            //this.outKeys.push(inKeys.slice(i, Math.min(maxKeys, inKeys.length)));
            this.outKeys.push(inKeys.slice(i, i + Math.min(maxKeys, inKeys.length)));
        }
    }
    static PartitionKeys(inKeys) {
        //console.log("inKeys", inKeys);
        this.#CheckForDifferentKeyLengths(inKeys);
        
        this.outKeys = new Array();
        
        this.#PartitionByAlg(inKeys);
        //console.log("outKeys", this.outKeys);

        return this.outKeys;
    }
}