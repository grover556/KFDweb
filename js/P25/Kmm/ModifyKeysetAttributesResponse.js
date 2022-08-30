// ModifyKeysetAttributesResponse

class ModifyKeysetAttributesResponse extends KmmBody {
    KeysetStatus = [];
    get MessageId() {
        return MessageId.ModifyKeysetAttributesResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        
    }
    Parse(contents) {
        let keysetCount = contents[0];

        for (var i=0; i< keysetCount; i++) {
            let status = new KeysetStatus();
            status.KeysetId = contents[(i * 2) + 1];
            status.Status = contents[(i * 2) + 2];
            this.KeysetStatus.push(status);
        }
    }
}