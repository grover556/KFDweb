const InventoryType = {
    Null: 0x00,//OTAR
    SendCurrentDateTime: 0x01,//OTAR
    ListActiveKsetIds: 0x02,//KFD and OTAR
    ListInactiveKsetIds: 0x03,//OTAR
    ListActiveKeyIds: 0x04,//OTAR
    ListInactiveKeyIds: 0x05,//OTAR
    ListAllKeysetTaggingInfo: 0x06,//OTAR
    ListAllUniqueKeyInfo: 0x07,//OTAR
    ListKeyAssignmentItemsForCSSs: 0x08,//OTAR
    ListKeyAssignmentItemsForTGs: 0x09,//OTAR
    ListLongKeyAssignmentItemsForLLIDs: 0x0A,//OTAR
    ListRsiItems: 0x0B,//KFD and OTAR
    ListActiveSuid: 0xF7,//KFD only
    ListSuidItems: 0xF8,//KFD only
    ListKeysetTaggingInfo: 0xF9,//KFD only // Renamed for consistency
    ListActiveKeys: 0xFD,//KFD only
    ListMnp: 0xFE,//KFD only
    ListKmfRsi: 0xFF//KFD only
}