const MessageId = {
    Null: 0x00,//OTAR
    CapabilitiesCommand: 0x01,//OTAR
    CapabilitiesResponse: 0x02,//OTAR
    ChangeRsiCommand: 0x03,//KFD and OTAR
    ChangeRsiResponse: 0x04,//KFD and OTAR
    ChangeoverCommand: 0x05,//KFD and OTAR
    ChangeoverResponse: 0x06,//KFD and OTAR
    DelayedAcknowledgement: 0x07,//OTAR
    DeleteKeyCommand: 0x08,//OTAR
    DeleteKeyResponse: 0x09,//OTAR
    DeleteKeysetCommand: 0x0A,//OTAR
    DeleteKeysetResponse: 0x0B,//OTAR
    Hello: 0x0C,//OTAR
    InventoryCommand: 0x0D,//KFD and OTAR
    InventoryResponse: 0x0E,//KFD and OTAR
    KeyAssignmentCommand: 0x0F,//OTAR
    KeyAssignmentResponse: 0x10,//OTAR
    Reserved11: 0x11,//OTAR
    Reserved12: 0x12,//OTAR
    ModifyKeyCommand: 0x13,//KFD and OTAR
    ModifyKeysetAttributesCommand: 0x14,//OTAR
    ModifyKeysetAttributesResponse: 0x15,//OTAR
    NegativeAcknowledgment: 0x16,//KFD and OTAR
    NoService: 0x17,//OTAR
    Reserved18: 0x18,//OTAR
    Reserved19: 0x19,//OTAR
    Reserved1A: 0x1A,//OTAR
    Reserved1B: 0x1B,//OTAR
    Reserved1C: 0x1C,//OTAR
    RekeyAcknowledgment: 0x1D,//KFD and OTAR
    RekeyCommand: 0x1E,//OTAR
    SetDateTimeCommand: 0x1F,//OTAR
    WarmStartCommand: 0x20,//OTAR
    ZeroizeCommand: 0x21,//KFD and OTAR
    ZeroizeResponse: 0x22,//KFD and OTAR
    DeregistrationCommand: 0x23,//OTAR
    DeregistrationResponse: 0x24,//OTAR
    RegistrationCommand: 0x25,//OTAR
    RegistrationResponse: 0x26,//OTAR
    UnableToDecryptResponse: 0x27,//KFD and OTAR
    LoadAuthKeyCommand: 0x28,//KFD only
    LoadAuthKeyResponse: 0x29,//KFD only
    DeleteAuthKeyCommand: 0x2A,//KFD only
    DeleteAuthKeyResponse: 0x2B,//KFD only
    SessionControl: 0x31,//KFD only
    UnknownMotorolaCommand: 0xA0,//KFD
    UnknownMotorolaResponse: 0xA1,//KFD
    LoadConfigResponse: 0xFC,//KFD only
    LoadConfigCommand: 0xFD//KFD only
};