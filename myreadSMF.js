/* ------------------------------------------------------------------------- */
/* SMF Decoder */
/* 20250412 */

var mTrack = null;		//Class of each Track
var mNtrks = 0;			//Number of Trucks
var mQnotemsec = 500;	//msec of Quater note
var mDivision;			//Ticks of Quater note
var mRate = 1;			//msec of Ticks
var mFormat;
var mXfih = null;		//class for XHIH
var mXfkm = null;		//class for Lyric

/* ------------------------------------------------------------------------- */

MThd = "MThd";	//ASCII Charactors of SMF File

//-- 	------------------------------------------------------------------	-->

window.addEventListener("load", function () {
	// use File API or not
	if (!window.File) {
		ele.innerHTML = "No File API";
		return;
	}

	/* for log */
	var ele = document.getElementById("log");

/*	// Variable of File Reader object
	var reader;

	// Process of read click button
	document.getElementById("read").addEventListener("click", function () {
		LoadSMFFile();
	}, true);
*/

}, true);

function LoadSMFFile() {
	var textFile = document.getElementById("filedata").files[0];

	// 選択されたファイル情報
	ele.innerText = "file name:";
	ele.innerText += textFile.name;
	ele.innerText += "\n";
	ele.innerText += "file size:";
	ele.innerText += textFile.size;
	ele.innerText += "byte\n";
	ele.innerText += "MIME Type：";
	ele.innerText += textFile.type;
	ele.innerText += "\n";
	ele.innerText += "---------------\n";

	// File reader process
	reader = new FileReader();

	reader.onload = function (evt) {
		// Uint8Array Object
		var ary_u8 = new Uint8Array(evt.target.result);
		var n = 0;

		if (!compchar(ary_u8, n, 4, "MThd")) return;
		n += 4;

		ele.textContent += "binary size=";
		ele.textContent += changeint(ary_u8, n, 4);
		ele.textContent += "\n";
		n += 4;

		mFormat = changeint(ary_u8, n, 2); n += 2;
		mNtrks = changeint(ary_u8, n, 2); n += 2;
		mDivision = changeint(ary_u8, n, 2); n += 2;
		ele.textContent += "format=";
		ele.textContent += mFormat;
		ele.textContent += " division=";
		ele.textContent += mDivision;
		ele.textContent += " track=";
		ele.textContent += mNtrks;
		ele.textContent += "\n";

		mTrack = new Array(mNtrks);
		for (var i = 0; i < mNtrks; i++) {
			mTrack[i] = new MTrk();
			mTrack[i].mTrnum = i;
		}
		var mlength = 0;
		for (var i = 0; i < mNtrks; i++) {
			if (!compchar(ary_u8, n, 4, "MTrk")) return;
			n += 4;
			mlength = changeint(ary_u8, n, 4);
			n += 4;
			mTrack[i].fSetdata(mlength, ary_u8, n);
			n += mlength;
			ele.textContent += " track[";
			ele.textContent += i;
			ele.textContent += "]=";
			ele.textContent += mlength;
			ele.textContent += "\n";
		}

		for (var i = 0; i < mNtrks; i++) {
			while (mTrack[i].mEnd == 0) {
				mTrack[i].fDeleteFF();
				mTrack[i].fEvent();
//				console.log(i, mTrack[i].mNexttime, mTrack[i].mStatus);
			}
		}

	// XFIH
		if (!compchar(ary_u8, n, 4, "XFIH")) return;
		n += 4;
		var mXfih_length = changeint(ary_u8, n, 4);
		n += 4;
		mXfih = new MTrk;
		mXfih.fSetdata(mXfih_length, ary_u8, n);
		n += mXfih_length;
		while (mXfih.mEnd == 0) {
			mXfih.fDeleteFF();
			mXfih.fEvent();
		}
	
	// XFKM
		if (!compchar(ary_u8, n, 4, "XFKM")) return;
		n += 4;
		var mXfkm_length = changeint(ary_u8, n, 4);
		n += 4;
		mXfkm = new MTrk;
		mXfkm.fSetdata(mXfkm_length, ary_u8, n);
		n += mXfkm_length;
	/*
		log.innerText = "";
		mXfkm.fSetLyric(true);
		while (mXfkm.mEnd == 0) {
			mXfkm.fDeleteFF();
			mXfkm.fEvent();
		}
	*/
	}

	reader.onerror = function (evt) {
		var errorNo = evt.target.error.code
		ele.innerHTML += "Error:" + errorNo;
	}

	reader.readAsArrayBuffer(textFile);
}


//-- 	------------------------------------------------------------------	-->
/* Subroutine for reading SMF */
/* Compare Charactors */
function compchar(buf, st, n, str) {
	var aaa = new String;
	for (var i = 0; i < n; i++) {
		aaa += String.fromCharCode(buf[i + st]);
	}
	if (aaa == str) return 1;
	else return 0;
}

/* Compare Charactors */
function changeint(buf, st, m) {
	var n = 0;
	for (var i = 0; i < m; i++) {
		n <<= 8;
		n += buf[st + i];
	}
	return n;
}

//-- 	------------------------------------------------------------------	-->
// End of FILE
