const TIMEOUT_NONE = 0; // no timeout
const TIMEOUT_STD = 5000; // 5 second timeout

const OPCODE_READY_REQ = 0xC0;
const OPCODE_READY_GENERAL_MODE = 0xD0;
const OPCODE_TRANSFER_DONE = 0xC1;
const OPCODE_KMM = 0xC2;
const OPCODE_DISCONNECT_ACK = 0x90;
const OPCODE_DISCONNECT = 0x92;

class ThreeWireProtocol {
    Protocol = new AdapterProtocol();
    async SendKeySignature() {
        if (FeatureAvailableSendKeySignatureAndReadyReq) await this.Protocol.SendKeySignatureAndReadyReq();
        else await this.Protocol.SendKeySignature();
    }
    async InitSession() {
        breakNow == false;

        if (!FeatureAvailableSendKeySignatureAndReadyReq) {
            // send ready req opcode
            let cmd = [OPCODE_READY_REQ];
            //SendData(cmd);
            await this.Protocol.SendData(cmd);
        }
        
        // receive ready general mode opcode
        if (serialModelId == "KFD100") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        else if (serialModelId == "KFD-AVR") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        else if (serialModelId == "KFDMicro") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        
        var rsp = await this.Protocol.GetByte(TIMEOUT_STD, false);////////true
        
        if (rsp != OPCODE_READY_GENERAL_MODE) {
            //console.error("mr: unexpected opcode");
            throw "mr: unexpected opcode";
        }
    }
    async EndSession() {
        // send transfer done opcode
        let cmd1 = [OPCODE_TRANSFER_DONE];
        console.log("kfd: transfer done");
        await this.Protocol.SendData(cmd1);

        // receive transfer done opcode
        console.log("mr: transfer done");
        
        if (serialModelId == "KFD100") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        else if (serialModelId == "KFD-AVR") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        else if (serialModelId == "KFDMicro") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        let rsp1 = await this.Protocol.GetByte(TIMEOUT_STD, true);
        if (rsp1 != OPCODE_TRANSFER_DONE) {
            console.error("mr: unexpected opcode");
        }

        // send disconnect opcode
        let cmd2 = [OPCODE_DISCONNECT];
        console.log("kfd: disconnect");
        await this.Protocol.SendData(cmd2);
        
        // receive disconnect ack opcode
        console.log("mr: disconnect ack");
        
        if (serialModelId == "KFD100") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        else if (serialModelId == "KFD-AVR") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        else if (serialModelId == "KFDMicro") {
            await new Promise(resolve => setTimeout(resolve, 150));////////50
        }
        let rsp2 = await this.Protocol.GetByte(TIMEOUT_STD, true);
        if (rsp2 != OPCODE_DISCONNECT_ACK) {
            console.error("mr: unexpected opcode");
        }
    }
    async CheckTargetMrConnection() {
        await this.SendKeySignature();
        await this.InitSession();
        await this.EndSession();
    }
    async CreateKmmFrame(kmm) {
        // create body
        let body = [];

        body.push(0x00); // control
        body.push(0xFF); // destination RSI high byte
        body.push(0xFF); // destination RSI mid byte
        body.push(0xFF); // destination RSI lob byte
        body = body.concat(kmm); //kmm

        // calculate crc
        let crc = CalculateCrc(body);

        // create frame
        let frame = [];

        let length = body.length + 2; // control + dest rsi + kmm + crc

        frame.push(OPCODE_KMM); // kmm opcode

        frame.push((length >> 8) & 0xFF); // length high byte
        frame.push(length & 0xFF); // length low byte

        frame = frame.concat(body); // kmm body

        frame.push(crc[0]); // crc high byte
        frame.push(crc[1]); // crc low byte

        return frame;
    }
    async ParseKmmFrame() {
        let temp = [];
        let length = 0;

        // Let the packetbuffer populate
        //await new Promise(resolve => setTimeout(resolve, 100));////////

        // receive length high byte
        temp = await this.Protocol.GetByte(TIMEOUT_STD, true);////////

        length |= (temp & 0xFF) << 8;

        // receive length low byte
        temp = await this.Protocol.GetByte(TIMEOUT_STD, true);////////

        length |= temp & 0xFF;

        let toCrc = [];

        // receive control
        temp = await this.Protocol.GetByte(TIMEOUT_STD, true);////////
        toCrc.push(temp);

        // receive dest rsi high byte
        temp = await this.Protocol.GetByte(TIMEOUT_STD, true);////////
        toCrc.push(temp);

        // receive dest rsi mid byte
        temp = await this.Protocol.GetByte(TIMEOUT_STD, true);////////
        toCrc.push(temp);

        // receive dest rsi low byte
        temp = await this.Protocol.GetByte(TIMEOUT_STD, true);////////
        toCrc.push(temp);

        let bodyLength = length - 6;

        let kmm = [];

        for (var i=0;i<bodyLength;i++) {
            temp = await this.Protocol.GetByte(TIMEOUT_STD, true);////////
            kmm.push(temp);
        }

        toCrc = toCrc.concat(kmm);

        // calculate crc
        let expectedCrc = CalculateCrc(toCrc);

        let crc = [2];
        //console.log("expectedCrc", BCTS(expectedCrc).join("-"));
        // receive crc high byte
        crc[0] = await this.Protocol.GetByte(TIMEOUT_STD, true);////////

        // receive crc low byte
        crc[1] = await this.Protocol.GetByte(TIMEOUT_STD, true);////////

        if (expectedCrc[1] != crc[1]) {
            console.error("mr: crc low byte mismatch");
        }
        
        return kmm;
    }
    async SendKmm(inKmm) {
        console.log("TWP.SendKmm inKmm", BCTS(inKmm).join("-"));
        if (inKmm.length > 512) {
            console.error("kmm exceeds max size");
        }
        
        let txFrame = await this.CreateKmmFrame(inKmm);
        console.log("TWP.SendKmm txFrame", BCTS(txFrame).join("-"));
        //this.Protocol.SendData(txFrame);
        await this.Protocol.SendData(txFrame);
    }
    async PerformKmmTransfer(inKmm) {
        console.log("TWP.PerformKmmTransfer inKmm", BCTS(inKmm).join("-"));
        // send kmm frame
        await this.SendKmm(inKmm);
        console.log("TWP.PerformKmmTransfer KmmSent");
        let rx;
        // Give time for the MR to respond
        //await new Promise(resolve => setTimeout(resolve, 100));////////

        // receive kmm opcode
        try {
            rx = await this.Protocol.GetByte(TIMEOUT_STD, true);////////true
        }
        catch (exception) {
            console.error("in: timed out waiting for kmm opcode", exception);
        }

        if (rx == OPCODE_KMM) {
            console.log("in: got kmm opcode");
        }
        else {
            console.error("in: unexpected kmm opcode, expected " + OPCODE_KMM + " got " + rx);
        }

        // receive kmm frame
        let rxFrame = await this.ParseKmmFrame();

        console.log("MR -> KFD KMM FRAME:", BCTS(rxFrame).join("-"));

        return rxFrame;
    }
    async MrRunProducer() {
        // NOT IMPLEMENTED
    }
}