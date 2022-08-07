//InventoryCommandListKmfRsi

class InventoryCommandListKmfRsi {
    get MessageId() {
        return MessageId.InventoryCommand;
    }
    get InventoryType() {
        return InventoryType.ListKmfRsi;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    get ToBytes() {
        var contents = new Uint8Array(1);
        
        /* inventory type */
        contents[0] = InventoryType;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}