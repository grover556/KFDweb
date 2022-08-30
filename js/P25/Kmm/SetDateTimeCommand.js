// SetDateTimeCommand

class SetDateTimeCommand extends KmmBody {
    DateTime;//Javascript Date object
    get MessageId() {
        return MessageId.SetDateTimeCommand;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        let contents = new Array(5);
        //let contents = new Array(5);
        //Month is 1-12, 0d0001 to 0d1100
        //Day is 1-31, 0d00001 to 0d11111
        //Year is 0-99, 0d000000 to 0d110011
        //Hour is 0-23, 0d00000 to 0d10111
        //Min is 0-59, 0d000000 to 0d111011
        //Sec is 0-59, 0d000000 to 0d111011
        //Spare is 0d0000000

        let year, month, day, hour, min, sec;
        year = parseInt(this.DateTime.getFullYear().toString().substring(2, 4));// Last 2 digits of year
        month = this.DateTime.getMonth() + 1;
        day = this.DateTime.getDate();

        let dayStr = day.toString(2).padStart(5, "0");
        let monStr = month.toString(2).padStart(4, "0");
        let yearStr = year.toString(2).padStart(7, "0");

        let dateString = monStr + dayStr + yearStr;

        /*
            m m m m d d d d
            d y y y y y y y
        */
        // 12-30-92 = 11001111 01011100

        hour = this.DateTime.getHours();
        min = this.DateTime.getMinutes();
        sec = this.DateTime.getSeconds();

        let hourStr = hour.toString(2).padStart(5, "0");
        let minStr = min.toString(2).padStart(6, "0");
        let secStr = sec.toString(2).padStart(6, "0");

        let timeString = hourStr + minStr + secStr + "0000000";

        /*
            h h h h h m m m
            m m m s s s s s
            s 0 0 0 0 0 0 0
        */
        // 16:03:58 = 10000000 01111101 00000000

        let dateTimeString = dateString + timeString;
        //let dateTimeArray = dateTimeString.split("");
        let dateTimeArray = Array.from(dateTimeString);

        for (var i=0; i<contents.length; i++) {
            contents[i] = parseInt(dateTimeArray.splice(0, 8).join(""), 2);
        }

        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}