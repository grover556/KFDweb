//InventoryCommandListMnp

class InventoryCommandListMnp extends KmmBody {
    get MessageId() {
        return MessageId.InventoryCommand;
    }
    get InventoryType() {
        return InventoryType.ListMnp;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        var contents = new Uint8Array(1);
        
        /* inventory type */
        contents[0] = this.InventoryType;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}