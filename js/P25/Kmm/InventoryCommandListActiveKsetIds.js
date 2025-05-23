//InventoryCommandListActiveKsetIds

class InventoryCommandListActiveKsetIds extends KmmBody {
    get MessageId() {
        return MessageId.InventoryCommand;
    }
    get InventoryType() {
        return InventoryType.ListActiveKsetIds;
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
        // nothing to do
    }
}