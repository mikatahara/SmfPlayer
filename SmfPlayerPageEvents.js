window.addEventListener("load", function(){
	document.getElementById("ton").addEventListener("click", function(){playStart()}, false); 
	document.getElementById("toff").addEventListener("click", function(){playStop()}, false); 
	document.getElementById("evi1").addEventListener("change", function(){seteVY1(this)}, false); 
}, true);

window.addEventListener("load", function(){
{
	var mCount=0;
	var meVY1=0;
	var timerId=0;
	var timerId2=0;

	var ele = document.getElementById("log");
	var ele2 = document.getElementById("pos");
}

//	document.getElementById("ton").addEventListener("click", function(){playStart()}, false); 
//	document.getElementById("toff").addEventListener("click", function(){playStop()}, false); 
//	document.getElementById("evi1").addEventListener("change", function(){seteVY1(this)}, false); 

	function seteVY1(e)
	{
		var v=e.checked;
		if(v) meVY1=1;
		else meVY1=0;
	}

	
	function playStop()
	{
		ele.innerText += "sequence end\n";
		clearInterval(timerId);
		clearInterval(timerId2);
		for(var i=0; i<16; i++){
			outMessage3(0xb0+i,  0x78, 0x00);
		}
	}

	function playStart()
	{
		mCount=0;
		ele.innerText = "sequence start\n";

		for(var i=0; i<mNtrks; i++){
			mTrack[i].ipoint=0;
			mTrack[i].mNexttime=0;
			mTrack[i].mEnd=0;
			mTrack[i].fDeleteFF();
		}

		var start = new Date();
		var sstime = start.getTime()
		var endtime=0;

		timerId2=setInterval(function(){

			var fend=1;
			var p0=Math.floor(mCount);
			var p1=Math.floor(p0/480);
			var p2=p0-p1*480;
			var p3=Math.floor(p1/4);
			var p4=p1-p3*4;
			ele2.textContent = p3;
			ele2.textContent += ":";
			ele2.textContent += p4;
			ele2.textContent += ":";
			ele2.textContent += p2;
			ele2.textContent += "\n";

			for(var i=0; i<mNtrks; i++){
				fend*=mTrack[i].mEnd;
			}
			if(fend==1){
				ele.innerText += "sequence end\n";
				clearInterval(timerId);
				clearInterval(timerId2);
			}

		}, 120 );

		timerId=setInterval(function(){
			var ee = new Date();
			endtime=ee.getTime();
			mCount += (endtime-sstime)*mRate;
			sstime=endtime;

		for(var i=mNtrks-1; i>=0; i--){
			while((mCount >= mTrack[i].mNexttime) && (mTrack[i].mEnd==0)){
				mTrack[i].fEvent();
				switch(mTrack[i].mStatus&0xF0){
					case 0x80:
					case 0x90:
					case 0xA0:
					case 0xB0:
					case 0xE0:
						if(!meVY1){
							outMessage3(mTrack[i].mStatus,mTrack[i].mMdata1,mTrack[i].mMdata2);
						} else {
							var ch=mTrack[i].mStatus &0x0F;
							switch(ch){
								case 0x00:
									outMessage3(mTrack[i].mStatus|0x0F,mTrack[i].mMdata1,mTrack[i].mMdata2);
									break;
								case 0x0F:
									break;
								default :
									outMessage3(mTrack[i].mStatus,mTrack[i].mMdata1,mTrack[i].mMdata2);
							}
						}
//						if((mTrack[i].mStatus&0xF0)==0x90) console.log(mCount,mTrack[i].mNexttime,mTrack[i].mStatus);
						break;

					case 0xC0:
					case 0xD0:
						if(!meVY1){
							outMessage2(mTrack[i].mStatus,mTrack[i].mMdata1);
						} else {
							var ch=mTrack[i].mStatus &0x0F;
							switch(ch){
								case 0x00:
									outMessage2(mTrack[i].mStatus|0x0F,mTrack[i].mMdata1);
									break;
								case 0x0F:
									break;
								default :
									outMessage2(mTrack[i].mStatus,mTrack[i].mMdata1);
							}
						}
						break;

					case 0xF0:
						if(mTrack[i].mStatus==0xF0){
							outSysEx(mTrack[i].mSysMessage,mTrack[i].mSyslength);
						}
						break;
				}
				mTrack[i].fDeleteFF();
			}
		}

		}, 1 );

	}
}

//}, true);

//add for Page 18, MIDI message monitor
	function handleMIDIMessage2( event ) {
	var str=null;
	var i,k;

	if( event.data[0] ==0xFE ) return;
	else if( event.data[0] ==0xFA ){
		playStart();
		 return;
	}
	else if( event.data[0] ==0xFC ){
		playStop();
		 return;
	}


	if( event.data.length>1) {
		str ="data.length=" +event.data.length+ ":"+ " 0x" + event.data[0].toString(16) + ":";
		log.innerText += str;

		for(i=1,k=0; i<event.data.length; i++, k++){
				str =" 0x" + event.data[i].toString(16) + ":";
				log.innerText += str;
				if(i%8==0){
					log.innerText +="\n";
				}
			}
		}
		str ="\n"; log.innerText += str;
	}
