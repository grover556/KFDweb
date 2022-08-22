//InventoryResponseListKeysetTaggingInfo

class InventoryResponseListKeysetTaggingInfo extends KmmBody {
    KeysetItems;
    get MessageId() {
        return this.MessageId.InventoryResponse;
    }
    get InventoryType() {
        return this.InventoryType.ListKeysetTaggingInfo;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    get ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length < 2) {
            throw "ArgumentOutOfRangeException";
        }

        /* inventory type */
        if (contents[0] != InventoryType) {
            throw "inventory type mismatch";
        }

        /* number of items */
        var NumberOfItems = 0;
        NumberOfItems |= contents[1] << 8;
        NumberOfItems |= contents[2];

        /* items */
        if ((NumberOfItems == 0) && (contents.length == 3)) {
            return;
        }
        else {
            var pos = 3;
            // Loop through each item
            for (var i=0; i<NumberOfItems; i++) {
                var item = new KeysetItem();

                /* keyset format */
                var ksetType;
                if ((contents[pos] & (1 << 7)) != 0) { ksetType = "KEK"; }
                else { ksetType = "TEK"; }
                item.KeySetType = ksetType;

                // detect presenece of 3 octet optional reserved field
                let reserved = (contents[pos] & (1 << 6)) != 0;

                // detect presence of 5 octet optional datetime field
                let datetime = (contents[pos] & (1 << 5)) != 0;

                let ksetNameSize = contents[pos] & 0x0F;

                // iterate past the keyset format field
                pos++;

                // get the keyset id
                item.KeysetId = contents[pos];
                pos++;

                // iterate past the deprecated reserved field
                pos++;

                if (reserved) {
                    item.ReservedField |= contents[i + pos + 1] << 16;
                    item.ReservedField |= contents[i + pos + 2] << 8;
                    item.ReservedField |= contents[i + pos + 3];
                    pos += 3;
                }

                if (datetime) {
                    let mon, day, year, hour, min, sec;
                    //mmmm ddddd yyyyyyy
                    //0b 0000111 100001111 == 0x0F0F
                    mon = contents[i + pos + 1] >> 4;
                    day = (contents[i + pos + 1] & 0x0F) << 1;
                    day |= contents[i + pos + 2] >> 7;
                    year = contents[i + pos + 2] & 0x7F;
                    year += 2000;
                    //hhhhh mmmmmm ssssss 0000000
                    hour = contents[i + pos + 3] >> 3;
                    min = (contents[i + pos + 3] & 0x07) << 3;
                    min |= contents[i + pos + 4] >> 5;
                    sec = (contents[i + pos + 4] & 0x1F) << 1;
                    sec |= contents[i + pos + 5] >> 7;

                    item.ActivationDateTime = new Date(year, mon, day, hour, min, sec);
                    //mon is zero-based in JS
                    pos += 5;
                }

                let keysetNameBytes = new Uint8Array(ksetNameSize);
                //Array.Copy(contents, pos, keysetNameBytes, 0, ksetNameSize);
                for (var j=0; j<ksetNameSize; j++) {
                    keysetNameBytes[j] = contents[pos + j];
                }
                item.KeysetName = String.fromCharCode(keysetNameBytes);
                pos += ksetNameSize;

                this.KeysetItems.push(item);
            }
        }
    }
}