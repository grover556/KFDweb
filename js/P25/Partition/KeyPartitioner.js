//KeyPartitioner

class KeyPartitioner {
    CheckForDifferentKeyLengths(inKeys) {

    }
    CalcMaxKeysPerKmm(keyLength) {
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
    PartitionByAlg(inKeys, outKeys) {

    }
    PartitionByType(maxKeys, inKeys, outKeys) {
        let tek = new [];
        let kek = new [];

        inKeys.foreach(keyItem => {
            if (keyItem.IsKek) {
                kek.push(keyItem);
            }
            else {
                tek.push(keyItem);
            }
        });

        this.PartitionByLength(maxKeys, tek, outKeys);

        this.PartitionByKeyset(maxKeys, kek, outKeys);
    }
    PartitionByActive(maxKeys, inKeys, outKeys) {
        let act = new [];
        let def = new [];

        inKeys.foreach(keyItem => {
            if (keyItem.UseActiveKeyset) {
                act.push(keyItem);
            }
            else {
                def.push(keyItem);
            }
        });

        this.PartitionByLength(maxKeys, act, outKeys);

        this.PartitionByKeyset(maxKeys, def, outKeys);
    }
    PartitionByKeyset(maxKeys, inKeys, outKeys) {

    }
    PartitionByLength(maxKeys, inKeys, outKeys) {
        for (var i=0; i<inKeys.length; i += maxKeys) {
            outKeys.push(inKeys.GetRange(i, Math.Min(maxKeys, inKeys.length - i)));
        }
    }
    PartitionKeys(inKeys) {
        CheckForDifferentKeyLengths(inKeys);

        
    }
}