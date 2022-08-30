//InventoryCommandListActiveKeys

class InventoryCommandListActiveKeys extends KmmBody {
    #_inventoryMarker;
    #_maxKeysRequested;
    get InventoryMarker() {
        return this.#_inventoryMarker;
    }
    set InventoryMarker(val) {
        if ((val < 0) || (val > 0xFFFFFF)) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_inventoryMarker = val;
    }
    get MaxKeysRequested() {
        return this.#_maxKeysRequested;
    }
    set MaxKeysRequested(val) {
        if ((val < 0) || (val > 0xFFFF)) {
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
    ToBytes() {
        var contents = new Uint8Array(6);
        
        /* inventory type */
        contents[0] = this.InventoryType;

        /* inventory marker */
        contents[1] = (this.InventoryMarker >>> 16) & 0xFF;
        contents[2] = (this.InventoryMarker >>> 8) & 0xFF;
        contents[3] = this.InventoryMarker & 0xFF;
        
        /* max number of keys requested */
        contents[4] = (this.MaxKeysRequested >>> 8) & 0xFF;
        contents[5] = this.MaxKeysRequested & 0xFF;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}