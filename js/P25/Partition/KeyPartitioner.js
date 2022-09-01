//KeyPartitioner

class KeyPartitioner {
    #CheckForDifferentKeyLengths(inKeys) {
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
    }
    #CalcMaxKeysPerKmm(keyLength) {
        // TODO make this calc more dynamic
        
        let maxBytes = 512;
        let availBytes = maxBytes - 27;

        let keyItemBytes = 5 + keyLength;

        let maxKeys = availBytes / keyItemBytes;

        if (maxKeys < 1) {
            throw "key too large for kmm";
        }

        return maxKeys;
    }
    #PartitionByAlg(inKeys, outKeys) {
        let alg = new Map();

        inKeys.forEach((keyItem) => {
            if (!alg.has(keyItem.AlgorithmId)) {
                alg.set(keyItem.AlgorithmId, []);
            }
            let temp = alg.get(keyItem.AlgorithmId);
            temp.push(keyItem);
            alg.set(keyItem.AlgorithmId, temp);
        });
    }
    #PartitionByType(maxKeys, inKeys, outKeys) {
        let tek = new [];
        let kek = new [];

        inKeys.foreach((keyItem) => {
            if (keyItem.IsKek) {
                kek.push(keyItem);
            }
            else {
                tek.push(keyItem);
            }
        });

        this.#PartitionByLength(maxKeys, tek, outKeys);

        this.#PartitionByKeyset(maxKeys, kek, outKeys);
    }
    #PartitionByActive(maxKeys, inKeys, outKeys) {
        let act = [];
        let def = [];

        inKeys.foreach((keyItem) => {
            if (keyItem.UseActiveKeyset) {
                act.push(keyItem);
            }
            else {
                def.push(keyItem);
            }
        });

        this.#PartitionByLength(maxKeys, act, outKeys);

        this.#PartitionByKeyset(maxKeys, def, outKeys);
    }
    #PartitionByKeyset(maxKeys, inKeys, outKeys) {
        let kset = new Map();

        inKeys.forEach((keyItem) => {
            if (!kset.has(keyItem.KeysetId)) {
                kset.set(keyItem.KeysetId, []);
            }
            let temp = kset.get(keyItem.KeysetId);
            temp.push(keyItem);
            kset.set(keyItem.KeysetId, temp);
        });

        kset.forEach((ele) => {
            this.#PartitionByLength(maxKeys, ele, outKeys);
        });
    }
    #PartitionByLength(maxKeys, inKeys, outKeys) {
        for (var i=0; i<inKeys.length; i += maxKeys) {
            //outKeys.Add(inKeys.GetRange(i, Math.Min(maxKeys, inKeys.Count - i)));
            outKeys = outKeys.concat(inKeys.slice(i, Math.min(maxKeys, inKeys.length)))
        }
    }
    static PartitionKeys(inKeys) {
        this.#CheckForDifferentKeyLengths(inKeys);
        
        let outKeys = [];
        
        this.#PartitionByAlg(inKeys, outKeys);
        console.log(outKeys);

        return outKeys;
    }
}