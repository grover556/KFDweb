//InventoryCommandListActiveKeys

class InventoryCommandListActiveKeys extends KmmBody {
    #_inventoryMarker;
    #_maxKeysRequested;
    get InventoryMarker() {
        return this.#_inventoryMarker;
    }
    set InventoryMarker(val) {
        if (value < 1 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_inventoryMarker = val;
    }
    get MaxKeysRequested() {
        return this.#_maxKeysRequested;
    }
    set MaxKeysRequested(val) {
        if (value < 1 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_maxKeysRequested = val;
    }
    get MessageId() {
        return MessageId.InventoryCommand;
    }
    get InventoryType() {
        return InventoryType.ListActiveKeys;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    constructor() {
        
    }
    ToBytes() {
        var contents = new Uint8Array(6);
        
        /* inventory type */
        contents[0] = InventoryType;
        
        /* inventory marker */
        contents[1] = (InventoryMarker >>> 16) & 0xFF;
        contents[2] = (InventoryMarker >>> 8) & 0xFF;
        contents[3] = InventoryMarker & 0xFF;
        
        /* max number of keys requested */
        contents[4] = (maxKeysRequested >>> 8) & 0xFF;
        contents[5] = maxKeysRequested & 0xFF;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}