//InventoryResponseListActiveKsetIds

class InventoryResponseListActiveKsetIds extends KmmBody {
    NumberOfItems;
    KsetIds;
    get MessageId() {
        return MessageId.InventoryResponse;
    }
    get InventoryType() {
        return InventoryType.ListActiveKsetIds;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        let contents = [];

        /* inventory type */
        contents.push(this.InventoryType);

        /* number of items */
        contents.push((this.KsetIds.length >> 8) & 0xFF);
        contents.push(this.KsetIds.length && 0xFF);

        for (var i=0; i<this.KsetIds.length; i++) {
            contents.push(KsetIds[i]);
        }

        return contents;
    }
    Parse(contents) {
        this.KsetIds = [];
        if (contents.length < 3) {
            throw "length mismatch - expected at least 3, got " + contents.length;
        }

        /* inventory type */
        if (contents[0] != this.InventoryType) {
            throw "inventory type mismatch";
        }

        /* number of items */
        this.NumberOfItems |= contents[1] << 8;
        this.NumberOfItems |= contents[2];
        
        /* items */
        if ((this.NumberOfItems == 0) && (contents.length == 3)) {
            return;
        }
        else if (this.NumberOfItems == (contents.length - 3)) {
            for (var i=0; i<this.NumberOfItems; i++) {
                this.KsetIds.push(contents[3 + i]);
            }
        }
        else {
            throw "number of items field and length mismatch";
        }
    }
}