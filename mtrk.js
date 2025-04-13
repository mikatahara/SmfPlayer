/* ------------------------------------------------------------------------- */
/* Class Definition of Truck    */
/* Decode XFIH Chunk            */
/* Decode XFKM Chunk            */
/* 2025/04/12 */

function MTrk() {
    this.mTrnum = 0;
    this.mLength = 0;
    this.mData = null;
    this.mNexttime = 0;
    this.mDeltatime = 0;
    this.mEnd = 0;

    this.mStatus = 0;	//for MIDI
    this.mMdata1 = 0;	//for MIDI
    this.mMdata2 = 0;	//for MIDI
    this.mSysMessage = new Uint8Array(1024);	//for MIDI SysEx
    this.mSyslength = 0	//System Exclusive message length;
    this.ipoint = 0;	//for Read

    this.mClear = false;    //Lyric
    this.mLyric = false;    //Lyric
}

MTrk.prototype = {
    fPrint: function (ele) {
        for (i = 0; i < this.mLength; i++) {
            if (i % 16 == 0) ele.textContent += "\n";
            ele.textContent += " 0x" + this.mData[i].toString(16) + ":";
        }
    },

    fGetFlag: function () {
        if (this.ipoint >= this.mLength) return 0;	// end of truck
        else return 1;
    },

    fSetdata: function (length, data, n) {
        this.mLength = length;
        this.mData = new Uint8Array(length);
        for (var i = 0; i < length; i++) this.mData[i] = data[i + n];
    },

    fDeleteFF: function () {
        if (this.mEnd == 1) return 0;
        var time = 0;
        var ilocal = this.ipoint;

        if (ilocal >= this.mLength) {
            this.mEnd = 1;
            return 0;
        }

        while (ilocal < this.mLength) {
            time += this.mData[ilocal] & 0x7F;
            if ((this.mData[ilocal] & 0x80) == 0) {
                this.ipoint = ilocal + 1;
                this.mDeltatime = time;
                this.mNexttime += time;
                return time;
            }
            time <<= 7;
            ilocal++;
        }
        return 0;
    },

    fEvent: function () {
        var ilocal = this.ipoint;
        if (this.mEnd == 1) return 0;
        if (ilocal >= this.mLength) {
            this.mEnd = 1;
            return 0;
        }

        if ((this.mData[ilocal] & 0x80) != 0) {
            this.mStatus = this.mData[ilocal];
            ilocal++;
        }
        this.ipoint = ilocal;
        switch (this.mStatus & 0xF0) {
            case 0x80:
            case 0x90:
            case 0xA0:
            case 0xB0:
            case 0xE0:
                this.mMdata1 = this.mData[ilocal]; ilocal++;
                this.mMdata2 = this.mData[ilocal]; ilocal++;
                if (this.mMdata2 > 128) {
                    this.mMdata2 = 0;
                }
                break;
            case 0xC0:
            case 0xD0:
                this.mMdata1 = this.mData[ilocal]; ilocal++;
                break;
            case 0xF0:
                ilocal = this.fGetMetaEvent(ilocal);
                break;
        }
        this.ipoint = ilocal;
    },

    fGetMetaEvent: function (st) {
        if (this.mStatus == 0xFF) {
            var ilocal = st;
            var second = this.mData[ilocal];
            ilocal++;
            var len;
            for (var j = 0; j < 1024; j++) this.mSysMessage[j] = "";
            switch (second) {
                case 0x00:
                    for (var j = 0; j < 3; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += 3;
                    break;
                case 0x01:
                case 0x02:
                case 0x03:
                case 0x04:
                case 0x05:
                case 0x06:
                case 0x07:
                case 0x21:
                case 0x7F:
                    len = this.mData[ilocal];
                    ilocal++;
                    for (var j = 0; j < len; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += len;
                    break;
                case 0x20:
                    for (var j = 0; j < 2; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += 2;
                    break;
                case 0x2F:
                    for (var j = 0; j < 1; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += 1;
                    this.mEnd = 1;
                    break;
                case 0x51:
                    for (var j = 0; j < 4; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += 4;
                    mQnotemsec = ((((this.mSysMessage[1] << 8) + this.mSysMessage[2]) << 8) + this.mSysMessage[3]) / 1000;
                    mRate = mDivision / mQnotemsec;
                    log.innerText += "Quarter note=";
                    log.innerText += mQnotemsec;
                    log.innerText += "ms\n";
                    //console.log("mRate=",this.mTrnum,mRate,this.mNexttime);
                    break;
                case 0x54:
                    for (var j = 0; j < 6; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += 6;
                    break;
                case 0x58:
                    for (var j = 0; j < 5; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += 5;
                    break;
                case 0x59:
                    for (var j = 0; j < 3; j++) this.mSysMessage[j] = this.mData[ilocal + j];
                    ilocal += 3;
                    break;
            }

            switch (second) {
                case 0x01:
                case 0x02:
                case 0x03:
                case 0x04:
                    for (var j = 0; j < len; j++) {
                        log.innerText += String.fromCharCode(this.mSysMessage[j]);
                    }
                    log.innerText += "\n";
                    break;

                case 0x05:
                    if (mLyric) {
                        var lyric = convertShiftJISToUTF8(this.mSysMessage);
                        if (this.mClear) {
                            log.innerText = "";
                            this.mClear = false;
                        }
                        log.innerText += this.fXfstr(lyric);
                    }
                    break;
            }

            return (ilocal);
        } else if (this.mStatus == 0xF0) {
            var j = 0;
            var ilocal = st;
            var isysexnum = 0;
            while (1) {
                var xx = this.mData[ilocal];
                isysexnum = (isysexnum << 7) + xx & 0x7F;
                ilocal++;
                if (!(xx & 0x80)) break;
            }
            while (this.mData[ilocal + j] != 0xF7) {
                this.mSysMessage[j] = this.mData[ilocal + j];
                j++;
            }
            this.mSyslength = j;
            this.mSysMessage[j] = 0xF7; j++;
            ilocal += j;
            return (ilocal);
        } else {
            return (st + 1);
        }
    },

    fSetLyric: function () {
        mLyric = true;
    },

    fXfstr: function (ly) {
        const result = [];

        for (const ch of ly) {
            const code = ch.charCodeAt(0);
            if (code == 0) break;
            else if (code <= 0x7F) { // ASCII範囲（1バイト）
                switch (code) {
                    case 94:
                        result.push("　");
                        break;
                    case 47:
                        result.push("\n");
                        this.mClear = true;
                        break;
                    case 91:
                        result.push("（");
                        break;
                    case 93:
                        result.push("）");
                        break;
                }
            } else {
                result.push(ch);
            }
        }

        return result.join("");
    }
}

// 例: Shift-JISのバイナリデータ（Uint8Array）をUTF-8の文字列に変換
function convertShiftJISToUTF8(sjisArrayBuffer) {
    // ArrayBuffer → Uint8Array に変換
    const sjisBytes = new Uint8Array(sjisArrayBuffer);

    // Shift-JIS → Unicode（内部的にUTF-16）に変換
    const unicodeString = Encoding.convert(sjisBytes, {
        to: 'UNICODE',
        from: 'SJIS',
        type: 'string'
    });

    // これで JavaScript の文字列（UTF-8扱い）として使える
    // console.log(unicodeString);
    // console.log(Array.from(unicodeString).length);
    return unicodeString;
}
