// DeleteKeyResponse

class DeleteKeyResponse extends KmmBody {
    KeyStatus = [];
    get MessageId() {
        return MessageId.DeleteKeyResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {

    }
    Parse(contents) {
        let statusCount = contents[0];

        for (var i=0; i< statusCount; i++) {
            let status = new KeyStatus();
            status.AlgorithmId = contents[(i * 4) + 1];
            status.KeyId |= contents[(i * 4) + 2] << 8;
            status.KeyId |= contents[(i * 4) + 3];
            status.Status = contents[(i * 4) + 4];
            this.KeyStatus.push(status);
        }
    }
}