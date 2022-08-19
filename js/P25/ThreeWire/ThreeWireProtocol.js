const TIMEOUT_NONE = 0; // no timeout
const TIMEOUT_STD = 5000; // 5 second timeout

const OPCODE_READY_REQ = 0xC0;
const OPCODE_READY_GENERAL_MODE = 0xD0;
const OPCODE_TRANSFER_DONE = 0xC1;
const OPCODE_KMM = 0xC2;
const OPCODE_DISCONNECT_ACK = 0x90;
const OPCODE_DISCONNECT = 0x92;


function SendKeySignature() {
    
}

function InitSession() {
    // send ready req opcode
    var cmd = [];
    cmd.push(OPCODE_READY_REQ);
    //SendData(cmd);
    
    // receive ready general mode opcode
    var rsp = Protocol.GetByte(TIMEOUT_STD);
    if (rsp != OPCODE_READY_GENERAL_MODE) {
        console.error("mr: unexpected opcode");
    }
}

function CheckTargetMrConnection() {
    SendKeySignature();
    InitSession();
    EndSession();
}

function CreateKmmFrame(kmm) {
    // create body
    var body = [];
    
    body.push(0x00); // control
    body.push(0xff); // destination RSI high byte
    body.push(0xff); // destination RSI mid byte
    body.push(0xff); // destination RSI low byte
    body.push(kmm);
    
    // calculate crc
    var crc = CalculateCrc(body);
    
    // create frame
    var frame = [];
    
    var len = body.length + 2; // control + dest rsi + kmm + crc
    
    frame.push(OPCODE_KMM); // kmm opcode
    
    frame.push((byte)((length >> 8) & 0xFF)); // length high byte
    frame.push((byte)(length & 0xFF)); // length low byte
    
    frame.push(body); // kmm body
    
    frame.push(crc[0]); // crc high byte
    frame.push(crc[1]); // crc low byte
    
    return frame;
}

function ParseKmmFrame() {
    
}

function EndSession() {
    
}

function SendKmm(inKmm) {
    
}

function PerformKmmTransfer(inKmm) {
    
}