//InventoryCommandListKmfRsi

class InventoryCommandListKmfRsi extends KmmBody {
    get MessageId() {
        return MessageId.InventoryCommand;
    }
    get InventoryType() {
        return InventoryType.ListKmfRsi;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        var contents = [1];
        
        /* inventory type */
        contents[0] = this.InventoryType;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}