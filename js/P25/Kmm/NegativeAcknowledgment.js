//NegativeAcknowledgment

class NegativeAcknowledgment extends KmmBody {
    AcknowledgedMessagetId;
    MessageNumber;
    Status;
    get MessageId() {
        return MessageId.NegativeAcknowledgment;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    NegativeAcknowledgment() {

    }
    get ToBytes() {
        let contents = [];
        
        /* acknowledged message id */
        contents.push(this.AcknowledgedMessagetId);

        /* message number */
        contents.push((this.MessageNumber >> 8) & 0xFF);
        contents.push(this.MessageNumber & 0xFF);

        /* status */
        contents.push(this.Status);

        return contents;
    }
    Parse(contents) {
        if (contents.length != 4) {
            throw "ArgumentOutOfRangeException";
        }

        /* acknowledged message id */
        this.AcknowledgedMessagetId = contents[0];

        /* message number */
        this.MessageNumber |= contents[1] << 8;
        this.MessageNumber |= contents[2];

        /* status */
        this.Status = contents[3];
    }
}