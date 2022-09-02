const AP_TIMEOUT = 1000;

/* COMMAND OPCODES */
const CMD_READ = 0x11;
const CMD_WRITE_INFO = 0x12;
const CMD_ENTER_BSL_MODE = 0x13;
const CMD_RESET = 0x14;
const CMD_SELF_TEST = 0x15;
const CMD_SEND_KEY_SIG = 0x16;
const CMD_SEND_BYTE = 0x17;

/* RESPONSE OPCODES */
const RSP_ERROR = 0x20;
const RSP_READ = 0x21;
const RSP_WRITE_INFO = 0x22;
const RSP_ENTER_BSL_MODE = 0x23;
const RSP_RESET = 0x24;
const RSP_SELF_TEST = 0x25;
const RSP_SEND_KEY_SIG = 0x26;
const RSP_SEND_BYTE = 0x27;

/* BROADCAST OPCODES */
const BCST_RECEIVE_BYTE = 0x31;

/* READ OPCODES */
const READ_AP_VER = 0x01;
const READ_FW_VER = 0x02;
const READ_UNIQUE_ID = 0x03;
const READ_MODEL_ID = 0x04;
const READ_HW_REV = 0x05;
const READ_SER_NUM = 0x06;

/* WRITE OPCODES */
const WRITE_MDL_REV = 0x01;
const WRITE_SER = 0x02;

/* ERROR OPCODES */
const ERR_OTHER = 0x00;
const ERR_INVALID_CMD_LENGTH = 0x01;
const ERR_INVALID_CMD_OPCODE = 0x02;
const ERR_INVALID_READ_OPCODE = 0x03;
const ERR_READ_FAILED = 0x04;
const ERR_INVALID_WRITE_OPCODE = 0x05;
const ERR_WRITE_FAILED = 0x06;


class AdapterProtocol {
    //Lower = new SerialProtocol();
    Open() {
        //this.Lower.Open();
    }
    Close() {
        //this.Lower.Close();
    }
    Clear() {
        //this.Lower.Clear();
    }
    async ReadAdapterProtocolVersion() {
        let cmd = [];
        
        /*
            CMD: READ AP VERSION
            [0] CMD_READ
            [1] READ_AP_VER
        */
        
        cmd.push(CMD_READ);
        cmd.push(READ_AP_VER);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        //READ
        
        /*
            RSP: READ AP VERSION
            [0] RSP_READ
            [1] READ_AP_VER
            [2] api major version
            [3] api minor version
            [4] api patch version
        */
        
        if (rsp.length == 5) {
            if (rsp[0] == RSP_READ) {
                if (rsp[1] == READ_AP_VER) {
                    let ver = [3];
                    ver[0] = rsp[2];
                    ver[1] = rsp[3];
                    ver[2] = rsp[4];
                    return ver;
                }
                else console.error("invalid read opcode: 0x" + rsp[1].toString(16).padStart(2,"0"));
            }
            else console.error("invalid response opcode: 0x" + rsp[0].toString(16).padStart(2,"0"));
        }
        else console.error("invalid response length: expected 5 bytes, got " + rsp.length);
    }
    async SendTest(cmd) {
        let rsp = await Send(cmd);
        //rsp = UnpackResponse(rsp);
        return rsp;
        //console.log("rsp", rsp);
    }
    async ReadFirmwareVersion() {
        let cmd = [];
        
        /*
            CMD: READ FW VERSION
            [0] CMD_READ
            [1] READ_FW_VER
        */
        
        cmd.push(CMD_READ);
        cmd.push(READ_FW_VER);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //return;
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: READ FW VERSION
            [0] RSP_READ
            [1] READ_FW_VER
            [2] fw major version
            [3] fw minor version
            [4] fw patch version
        */
        
        if (rsp.length == 5) {
            if (rsp[0] == RSP_READ) {
                if (rsp[1] == READ_FW_VER) {
                    let ver = [3];
                    ver[0] = rsp[2];
                    ver[1] = rsp[3];
                    ver[2] = rsp[4];
                    return ver;
                }
                else console.error("invalid read opcode: 0x" + rsp[1].toString(16).padStart(2,"0"));
            }
            else console.error("invalid response opcode: 0x" + rsp[0].toString(16).padStart(2,"0"));
        }
        else console.error("invalid response length: expected 5 bytes, got " + rsp.length);
    }
    async ReadUniqueId() {
        let cmd = [];
        
        /*
            CMD: READ UNIQUE ID
            [0] CMD_READ
            [1] READ_UNIQUE_ID
        */
        
        cmd.push(CMD_READ);
        cmd.push(READ_UNIQUE_ID);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: READ UNIQUE ID
            [0] RSP_READ
            [1] READ_UNIQUE_ID
            [2] unique id length
            [3 to 3 + unique id length] raw unique id if unique id length > 0
        */
        
        if (rsp.length >= 3) {
            if (rsp[0] == RSP_READ) {
                if (rsp[1] == READ_UNIQUE_ID) {
                    if (rsp[2] == 0) { // no unique id
                        return [0];
                    }
                    else if (rsp[2] == (rsp.length - 3)) {
                        //let len = rsp[2];
                        let num = rsp.splice(3);
                        return num;
                    }
                    else console.error("message length field and message length mismatch");
                }
                else console.error("invalid read opcode: expected READ_UNIQUE_ID got 0x" + rsp[1].toString(16).padStart(2,"0"));
            }
            else console.error("invalid response opcode: expected RSP_READ got 0x" + rsp[0].toString(16).padStart(2,"0"));
        }
        else console.error("invalid response length: expected >=3 bytes, got " + rsp.length);
    }
    async ReadModelId() {
        let cmd = [];
        
        /*
            CMD: READ MODEL ID
            [0] CMD_READ
            [1] READ_MODEL_ID
        */
        
        cmd.push(CMD_READ);
        cmd.push(READ_MODEL_ID);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: READ MODEL ID
            [0] RSP_READ
            [1] READ_MODEL_ID
            [2] model id
        */
        
        if (rsp.length == 3) {
            if (rsp[0] == RSP_READ) {
                if (rsp[1] == READ_MODEL_ID) {
                    return rsp[2];
                }
                else console.error("invalid read opcode: expected READ_MODEL_ID got 0x" + rsp[1].toString(16).padStart(2,"0"));
            }
            else console.error("invalid response opcode: expected RSP_READ got 0x" + rsp[0].toString(16).padStart(2,"0"));
        }
        else console.error("invalid response length: expected 3 bytes, got " + rsp.length);
    }
    async ReadHardwareRevision() {
        let cmd = [];
        
        /*
            CMD: READ HARDWARE REVISION
            [0] CMD_READ
            [1] READ_HW_REV
        */
        
        cmd.push(CMD_READ);
        cmd.push(READ_HW_REV);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: READ HARDWARE REVISION
            [0] RSP_READ
            [1] READ_HW_REV
            [2] hw rev major version
            [3] hw rev minor version
        */
        
        if (rsp.length == 4) {
            if (rsp[0] == RSP_READ) {
                if (rsp[1] == READ_HW_REV) {
                    let num = rsp.splice(2);
                    return num;
                }
                else console.error("invalid read opcode: expected READ_HW_REV got 0x" + rsp[1].toString(16).padStart(2,"0"));
            }
            else console.error("invalid response opcode: expected RSP_READ got 0x" + rsp[0].toString(16).padStart(2,"0"));
        }
        else console.error("invalid response length: expected 4 bytes, got " + rsp.length);
    }
    async ReadSerialNumber() {
        let cmd = [];
        
        /*
            CMD: READ SERIAL NUMBER
            [0] CMD_READ
            [1] READ_SER_NUM
        */
        
        cmd.push(CMD_READ);
        cmd.push(READ_SER_NUM);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: READ SERIAL NUMBER
            [0] RSP_READ
            [1] READ_SER_NUM
            [2] serial number length
            [3 to 3 + serial number length] serial number if serial number length > 0
        */
        
        if (rsp.length >= 3) {
            if (rsp[0] == RSP_READ) {
                if (rsp[1] == READ_SER_NUM) {
                    if (rsp[2] == 0) { // no serial number
                        return [0];
                    }
                    else if (rsp[2] == (rsp.length - 3)) {
                        //let len = rsp[2];
                        let num = rsp.splice(3);
                        
                        // TODO validate ascii characters to only accept 0-9, A-Z
                        
                        return num;
                    }
                    else console.error("message length field and message length mismatch");
                }
                else console.error("invalid read opcode: expected READ_SER_NUM got 0x" + rsp[1].toString(16).padStart(2,"0"));
            }
            else console.error("invalid response opcode: expected RSP_READ got 0x" + rsp[0].toString(16).padStart(2,"0"));
        }
        else console.error("invalid response length: expected >=3 bytes, got " + rsp.length);
    }
    async WriteInfo(mdlId, hwRevMaj, hwRevMin) {
        let cmd = [];
        
        /*
            CMD: WRITE INFO
            [0] CMD_WRITE_INFO
            [1] WRITE_MDL_REV
            [2] model id
            [3] hardware revision major version
            [4] hardware revision minor version
        */
        
        cmd.push(CMD_WRITE_INFO);
        cmd.push(WRITE_MDL_REV);
        cmd.push(mdlId);
        cmd.push(hwRevMaj);
        cmd.push(hwRevMin);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: WRITE INFO
            [0] RSP_WRITE_INFO
        */
        
        if (rsp.length == 1) {
            if (rsp[0] != RSP_WRITE_INFO) {
                console.error("invalid response opcode: expected RSP_WRITE_INFO got 0x" + rsp[0].toString(16).padStart(2,"0"));
            }
        }
        else console.error("invalid response length: expected 1 bytes, got " + rsp.length);
    }
    async EnterBslMode() {
        let cmd = [];
        
        /*
            CMD: ENTER BSL MODE
            [0] CMD_ENTER_BSL_MODE
        */
        
        cmd.push(CMD_ENTER_BSL_MODE);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: ENTER BSL MODE
            [0] RSP_ENTER_BSL_MODE
        */
        
        if (rsp.length == 1) {
            if (rsp[0] != RSP_ENTER_BSL_MODE) {
                console.error("invalid response opcode: expected RSP_ENTER_BSL_MODE got 0x" + rsp[0].toString(16).padStart(2,"0"));
            }
        }
        else console.error("invalid response length: expected 1 bytes, got " + rsp.length);
    }
    async Reset() {
        let cmd = [];
        
        /*
            CMD: RESET
            [0] CMD_RESET
        */
        
        cmd.push(CMD_RESET);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: READ SERIAL NUMBER
            [0] RSP_RESET
        */
        
        if (rsp.length == 1) {
            if (rsp[0] != RSP_RESET) {
                console.error("invalid response opcode: expected RSP_RESET got 0x" + rsp[0].toString(16).padStart(2,"0"));
            }
        }
        else console.error("invalid response length: expected 1 bytes, got " + rsp.length);
    }
    async SelfTest() {
        let cmd = [];
        
        /*
            CMD: SELF TEST
            [0] CMD_SELF_TEST
        */
        
        cmd.push(CMD_SELF_TEST);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 50));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);

        //READ
        
        /*
            RSP: SELF TEST
            [0] RSP_SELF_TEST
            [1] self test result
        */
        
        if (rsp.length == 2) {
            if (rsp[0] == RSP_SELF_TEST) {
                return rsp[1];
            }
            else console.error("invalid response opcode: expected RSP_SELF_TEST got 0x" + rsp[0].toString(16).padStart(2,"0"));
        }
        else console.error("invalid response length: expected 2 bytes, got " + rsp.length);
    }
    async SendKeySignature() {
        let cmd = [];
        
        /*
            CMD: SEND KEY SIGNATURE
            [0] CMD_SEND_KEY_SIG
            [1] reserved (set to 0x00)
        */
        
        cmd.push(CMD_SEND_KEY_SIG);
        cmd.push(0x00);
        
        //SEND
        //let rsp = await Send2(cmd);
        await SendSerial(cmd);
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 150));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, -1);
        let rsp = ReadPacketFromPacketBuffer();
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: SEND KEY SIGNATURE
            [0] RSP_SEND_KEY_SIG
        */
        
        if (rsp.length == 1) {
            if (rsp[0] != RSP_SEND_KEY_SIG) {
                console.error("invalid response opcode: expected RSP_SEND_KEY_SIG got 0x" + rsp[0].toString(16).padStart(2,"0"));
            }
        }
        else console.error("invalid response length: expected 1 bytes, got " + rsp.length);
    }
    async SendByte(dataByte) {
        let cmd = [];
        //console.log("SendByte", dataByte.toString(16).toUpperCase().padStart(2,"0"));
        /*
            CMD: SEND BYTE
            [0] CMD_SEND_BYTE
            [1] reserved (set to 0x00)
            [2] byte to send
        */
        
        cmd.push(CMD_SEND_BYTE);
        cmd.push(0x00);
        cmd.push(dataByte);
        
        //SEND
        //let rsp = await Send(cmd);
        await SendSerial(cmd);// added await
        //let rsp = await readWithTimeout(AP_TIMEOUT);
        await new Promise(resolve => setTimeout(resolve, 30));
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, 5);
        let rsp = ReadPacketFromPacketBuffer();
        //console.log("sb rsp:", BCTS(rsp).join("-"));
        //let rsp = await this.GetByte(AP_TIMEOUT);
        //console.log("SendByte rsp", rsp[0].toString(16).toUpperCase().padStart(2,"0"));
        //rsp = UnpackResponse(rsp);
        //console.log("rsp", rsp);
        
        //READ
        
        /*
            RSP: SEND BYTE
            [0] RSP_SEND_BYTE
        */
        
        if (rsp.length == 1) {
            if (rsp[0] != RSP_SEND_BYTE) {
                console.error("invalid response opcode: expected RSP_SEND_BYTE got 0x" + rsp[0].toString(16).padStart(2,"0"));
            }
        }
        else console.error("invalid response length: expected 1 bytes, got " + rsp.length);
    }
    async SendData(data) {
        //console.log("SendData:", BCTS(data).join("-"));
        for (var i=0; i<data.length; i++) {
            await this.SendByte(data[i]);
        }
    }

    async GetByte(timeout, wait) {
        //return;
        console.log("GetByte");
        //let rsp = await readWithTimeout(timeout);
        if (wait) {
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        //let rsp = await ReadBytesFromBuffer(AP_TIMEOUT, 5);
        let rsp = ReadPacketFromPacketBuffer();
        //console.log("byte rsp:", BCTS(rsp).join("-"));
        //rsp = UnpackResponse(rsp);
        
        /*
            BCST: RECEIVE BYTE
            
            [0] BCST_RECEIVE_BYTE
            [1] reserved (set to 0x00)
            [2] byte received
        */

        if (rsp.length == 3) {
            if (rsp[0] == BCST_RECEIVE_BYTE) {
                console.log("byte:", rsp[2].toString(16).toUpperCase().padStart(2, "0"));
                return rsp[2];
            }
            else {
                console.error("invalid broadcast opcode");
            }
        }
        else {
            console.warn("invalid broadcast length");
        }
    }
}