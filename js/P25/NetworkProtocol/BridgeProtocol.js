const dliFrameBuffer = [];
// var bridgeConnected = false;
// var bridgeConnection;

class BridgeProtocol {
    //Connection
    //Timeout;
    //constructor(connection, timeout) {
    //    this.Connection = connection;
    //    this.Timeout = timeout;
    //}
    constructor(targetIp) {
        this.TargetIP = targetIp;
    }

    async TxRx(toRadio) {
        console.log("async TxRx");
        // Send toRadio to radio via WebSocket and return the response
        if (bridgeConnection.readyState == 1) {
            let data = {
                targetIp: this.TargetIP,
                payload: toRadio
            }
            //bridgeConnection.send(JSON.stringify(toRadio));
            bridgeConnection.send(JSON.stringify(data));
            console.log(data);
        }
        else {
            console.error("Websocket not connected");
        }
        //await new Promise(resolve => setTimeout(resolve, 1000));
        await this.CheckDliBufferUntilPopulated();
        //await new Promise(resolve => setTimeout(resolve, 300));
        //this.CheckDliBufferUntilPopulated();
        return dliFrameBuffer.pop();
    }

    async CheckDliBufferUntilPopulated() {
        console.warn("CheckDliBufferUntilPopulated", dliFrameBuffer.length);
        let counter = 0;
        while((dliFrameBuffer.length == 0) && (breakNow == false)) {
            if (counter > 100) {
                alert("Communication error: check that radio is connected via Bluetooth");
                break;
            }
            console.warn("wait");
            await new Promise(resolve => setTimeout(resolve, 10));//100 was working good, trying 10
            //await new Promise(resolve => setTimeout(resolve, 500));
            counter++;
        }
        return;
    }
}