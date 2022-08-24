//OperationStatus

class OperationStatus {
    OperationStatus = {
        CommandWasPerformed: 0x00,
        CommandWasNotPerformed: 0x01,
        ItemDoesNotExist: 0x02,
        InvalidMessageId: 0x03,
        InvalidMac: 0x04,
        OutOfMemory: 0x05,
        CouldNotDecryptTheMessage: 0x06,
        InvalidMessageNumber: 0x07,
        InvalidKeyId: 0x08,
        InvalidAlgorithmId: 0x09,
        InvalidMfid: 0x0A,
        ModuleFailure: 0x0B,
        MiAllZeros: 0x0C,
        Keyfail: 0x0D,
        Unknown: 0xFF
    };
    ToStatusString(status) {
        switch (status) {
            case this.OperationStatus.CommandWasPerformed:
                return "Command was performed";
            case this.OperationStatus.CommandWasNotPerformed:
                return "Command not performed";
            case this.OperationStatus.ItemDoesNotExist:
                return "Item does not exist";
            case this.OperationStatus.InvalidMessageId:
                return "Invalid Message ID";
            case this.OperationStatus.InvalidMac:
                return "Invalid MAC";
            case this.OperationStatus.OutOfMemory:
                return "Out of Memory";
            case this.OperationStatus.CouldNotDecryptTheMessage:
                return "Could not decrypt the message";
            case this.OperationStatus.InvalidMessageNumber:
                return "Invalid Message Number";
            case this.OperationStatus.InvalidKeyId:
                return "Invalid Key ID";
            case this.OperationStatus.InvalidAlgorithmId:
                return "Invalid Algorithm ID";
            case this.OperationStatus.InvalidMfid:
                return "Invalid MFID";
            case this.OperationStatus.ModuleFailure:
                return "Module Failure";
            case this.OperationStatus.MiAllZeros:
                return "MI all zeros";
            case this.OperationStatus.Keyfail:
                return "Keyfail";
            case this.OperationStatus.Unknown:
                return "Unknown";
            default:
                return "Reserved";
        }
    }
    ToReasonString(status) {
        switch (status) {
            case this.OperationStatus.CommandWasPerformed:
                return "Command was executed successfully";
            case this.OperationStatus.CommandWasNotPerformed:
                return "Command could not be performed due to an unspecified reason";
            case this.OperationStatus.ItemDoesNotExist:
                return "Key / Keyset needed to perform the operation does not exist";
            case this.OperationStatus.InvalidMessageId:
                return "Message ID is invalid/unsupported";
            case this.OperationStatus.InvalidMac:
                return "MAC is invalid";
            case this.OperationStatus.OutOfMemory:
                return "Memory unavailable to process the command / message";
            case this.OperationStatus.CouldNotDecryptTheMessage:
                return "KEK does not exist";
            case this.OperationStatus.InvalidMessageNumber:
                return "Message Number is invalid";
            case this.OperationStatus.InvalidKeyId:
                return "Key ID is invalid or not present";
            case this.OperationStatus.InvalidAlgorithmId:
                return "ALGID is invalid or not present";
            case this.OperationStatus.InvalidMfid:
                return "MFID is invalid";
            case this.OperationStatus.ModuleFailure:
                return "Encryption Hardware failure";
            case this.OperationStatus.MiAllZeros:
                return "Received MI was all zeros";
            case this.OperationStatus.Keyfail:
                return "Key identified by ALGID/Key ID is erased";
            case this.OperationStatus.Unknown:
                return "Unknown";
            default:
                return "Reserved";
        }
    }
}