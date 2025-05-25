class DataLinkIndependentProtocol {
    Protocol;
    MotVariant;
    Key = {
        AlgorithmId: 0x80,
        Id: 0x0000,
        MI: 0x000000000000000000
    };
    constructor(transportProtocol, motVariant, key) {
        this.Protocol = transportProtocol;
        this.MotVariant = motVariant;
        this.Key = key;
    }
    
    async SendKeySignature() {
        // Not needed
    }

    async InitSession() {
        console.log("InitSession", this.MotVariant);
        if (this.MotVariant) {
            this.Mfid90SendConnect();
            await new Promise(resolve => setTimeout(resolve, 300));
            this.Mfid90SendBeginSession();
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        else {
            this.SendReadyRequest();
        }
    }

    async EndSession() {
        console.log("EndSession", this.MotVariant);
        if (this.MotVariant) {
            this.Mfid90SendTransferDone();
            await new Promise(resolve => setTimeout(resolve, 300));
            this.Mfid90SendEndSession();
            await new Promise(resolve => setTimeout(resolve, 300));
            this.Mfid90SendDisconnect();
        }
        else {
            this.SendTransferDone();
            this.SendEndSession();
            this.SendDisconnect();
        }
    }

    async CheckTargetMrConnection() {
        console.log("CheckTargetMrConnection", this.MotVariant);
        /*
        if (this.MotVariant) {
            this.Mfid90SendConnect()
            .then(this.Mfid90SendBeginSession())
            .then(this.Mfid90SendTransferDone())
            .then(this.Mfid90SendEndSession())
            .then(this.Mfid90SendDisconnect());
        }
        else {
            this.SendReadyRequest();
            this.SendTransferDone();
            this.SendEndSession();
            this.SendDisconnect();
        }
        return;
        */
        if (this.MotVariant) {
            this.Mfid90SendConnect();
            await new Promise(resolve => setTimeout(resolve, 300));
            this.Mfid90SendBeginSession();
            await new Promise(resolve => setTimeout(resolve, 300));
            this.Mfid90SendTransferDone();
            await new Promise(resolve => setTimeout(resolve, 300));
            this.Mfid90SendEndSession();
            await new Promise(resolve => setTimeout(resolve, 300));
            this.Mfid90SendDisconnect();
        }
        else {
            this.SendReadyRequest();
            this.SendTransferDone();
            this.SendEndSession();
            this.SendDisconnect();
        }
    }

    async PerformKmmTransfer(toRadio) {
        let fromRadio = [];
        console.log("DLI.PerformKmmTransfer toRadio", BCTS(toRadio).join("-"));
        fromRadio = this.Protocol.TxRx(toRadio);//???await this.Protocol.TxRx(toRadio);???
        //console.log("DLI.PerformKmmTransfer KmmSent");
        console.log("DLI.PerformKmmTransfer fromRadio", BCTS(fromRadio).join("-"));
        return fromRadio;
    }

    async SendReadyRequest() {
        console.log("SendReadyRequest", this.MotVariant);
        let commandKmmBody = new SessionControl();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.ReadyRequest;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x00);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof SessionControl) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.ReadyGeneralMode) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async Mfid90SendConnect() {
        console.log("Mfid90SendConnect", this.MotVariant);
        let commandKmmBody = new Mfid90SessionControlVer1();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.Connect;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;
        commandKmmBody.IsSessionTypeIncluded = false;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x90);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof Mfid90SessionControlVer1) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.ConnectAck) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async Mfid90SendBeginSession() {
        console.log("Mfid90SendBeginSession", this.MotVariant);
        let commandKmmBody = new Mfid90SessionControlVer1();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.BeginSession;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;
        commandKmmBody.IsSessionTypeIncluded = true;
        commandKmmBody.SessionType = commandKmmBody.ScSessionType.KeyFill;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x90);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;
        
        if (responseKmmBody instanceof Mfid90SessionControlVer1) {
            let kmm = responseKmmBody;
            console.log(kmm);
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.BeginSessionAck) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async SendTransferDone() {
        console.log("SendTransferDone", this.MotVariant);
        let commandKmmBody = new SessionControl();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.TransferDone;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x00);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof SessionControl) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.TransferDone) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async Mfid90SendTransferDone() {
        console.log("Mfid90SendTransferDone", this.MotVariant);
        let commandKmmBody = new Mfid90SessionControlVer1();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.TransferDone;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;
        commandKmmBody.IsSessionTypeIncluded = false;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x90);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof Mfid90SessionControlVer1) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.TransferDone) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async SendEndSession() {
        console.log("SendEndSession", this.MotVariant);
        let commandKmmBody = new SessionControl();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.EndSession;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x00);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof SessionControl) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.EndSessionAck) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async Mfid90SendEndSession() {
        console.log("Mfid90SendEndSession", this.MotVariant);
        let commandKmmBody = new Mfid90SessionControlVer1();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.EndSession;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;
        commandKmmBody.IsSessionTypeIncluded = true;
        commandKmmBody.SessionType = commandKmmBody.ScSessionType.KeyFill;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x90);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof Mfid90SessionControlVer1) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.EndSessionAck) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async SendDisconnect() {
        console.log("SendDisconnect", this.MotVariant);
        let commandKmmBody = new SessionControl();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.Disconnect;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x00);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof SessionControl) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.DisconnectAck) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

    async Mfid90SendDisconnect() {
        console.log("Mfid90SendDisconnect", this.MotVariant);
        let commandKmmBody = new Mfid90SessionControlVer1();
        commandKmmBody.SessionControlOpcode = commandKmmBody.ScOpcode.Disconnect;
        commandKmmBody.SourceDeviceType = commandKmmBody.ScSourceDeviceType.Kfd;
        commandKmmBody.IsSessionTypeIncluded = false;

        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("PerformKmmTransfer", commandKmmFrame);
        let toRadio = commandKmmFrame.ToBytesWithPreamble(0x90);
        let fromRadio = await this.PerformKmmTransfer(toRadio);
        let responseKmmFrame = new KmmFrame(true, fromRadio);
        console.log("resolved PerformKmmTransfer", responseKmmFrame);
        let responseKmmBody = responseKmmFrame.KmmBody;

        if (responseKmmBody instanceof Mfid90SessionControlVer1) {
            let kmm = responseKmmBody;
            if (kmm.SessionControlOpcode != commandKmmBody.ScOpcode.DisconnectAck) {
                console.log(`received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`);
                throw `received unexpected session control opcode 0x${kmm.SessionControlOpcode}, ${kmm.SessionControlOpcode.ToString()}`;
            }
        }
        else {
            console.error("unexpected kmm");
            throw "unexpected kmm";
        }
    }

}