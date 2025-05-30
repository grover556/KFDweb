//InventoryResponseListMnp

class InventoryResponseListMnp extends KmmBody {
    MessageNumberPeriod;
    get MessageId() {
        return MessageId.InventoryResponse;
    }
    get InventoryType() {
        return InventoryType.ListMnp;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length != 3) {
            throw "ArgumentOutOfRangeException";
        }

        /* inventory type */
        if (contents[0] != this.InventoryType) {
            throw "inventory type mismatch";
        }

        /* message number period */
        this.MessageNumberPeriod |= contents[1] << 8;
        this.MessageNumberPeriod |= contents[2];
    }
}