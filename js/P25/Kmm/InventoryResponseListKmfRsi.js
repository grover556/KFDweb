//InventoryResponseListKmfRsi 

class InventoryResponseListKmfRsi extends KmmBody {
    KmfRsi;
    get MessageId() {
        return this.MessageId.InventoryResponse;
    }
    get InventoryType() {
        return this.InventoryType.ListKmfRsi;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    constructor() {
        
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length != 4) {
            throw "ArgumentOutOfRangeException";
        }

        /* inventory type */
        if (contents[0] != this.InventoryType) {
            throw "inventory type mismatch";
        }

        /* message number period */
        this.KmfRsi |= contents[1] << 16;
        this.KmfRsi |= contents[2] << 8;
        this.KmfRsi |= contents[3];
    }
}