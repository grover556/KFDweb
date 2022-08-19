//InventoryCommandListActiveKeys

class InventoryCommandListActiveKeys {
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
    get ToBytes() {
        var contents = new Uint8Array(6);
        
        /* inventory type */
        contents[0] = InventoryType;
        
        /* inventory marker */
        contents[1] = ((InventoryMarker >> 16) & 255);
        contents[2] = ((InventoryMarker >> 8) & 255);
        contents[3] = (InventoryMarker & 255);
        
        /* max number of keys requested */
        contents[4] = ((maxKeysRequested >> 8) & 255);
        contents[5] = (maxKeysRequested & 255);
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}