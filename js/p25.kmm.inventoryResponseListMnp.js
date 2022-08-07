//InventoryResponseListMnp

class InventoryResponseListMnp {
    MessageNumberPeriod;
    get MessageId() {
        return this.MessageId.InventoryResponse;
    }
    get InventoryType() {
        return this.InventoryType.ListMnp;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    get ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length != 3) {
            throw "ArgumentOutOfRangeException";
        }

        /* inventory type */
        if (contents[0] != InventoryType) {
            throw "inventory type mismatch";
        }

        /* message number period */
        this.MessageNumberPeriod |= contents[1] << 8;
        this.MessageNumberPeriod |= contents[2];
    }
}