var fdg1=null;
var nNch=1;
var nNot=8;
var nArc=10;

window.addEventListener('load', function ()
{
	fdg1 = new DrawGraph(0,1200,0,600);
	fdg1.fSetCanvas(document.getElementById('bkg'));
	fdg1.fResize();
	fdg1.fLine(0,0,fdg1.cv.width,fdg1.cv.height);

	fdg1.fSetViewPort(-4,4,-4,4);
	fdg1.fSetWindowXY(0,fdg1.cv.width,0,fdg1.cv.height);
	fdg1.fVLine(-4,0,4,0);
	fdg1.fVStrokeDottedLine(0,-4,0,4);

	fdg1.fSetViewPort(0,48,0,17);
	
	fdg1.fFillColor("#888888");

	for(var j=nNch; j<=nNch+15; j++){
		for(var i=nNot; i<=nNot+32; i++){
			fdg1.fDrawArcXY(i,j,nArc);
		}
	}

}, false);

function setLEDstatus(status,data1,data2){
	var ch = status&0x0F;
	var note = data1;

	if((status&0xF0)==0x80 || data2==0) setLEDOff(ch, note);
	else if((status&0xF0)==0x90) setLEDOn(ch, note);
}

function setLEDOn(ch, note)
{
	note-=48;
	if(note>=32) note=32;
	else if(note<0) note=0;

	fdg1.fFillColor("#FF8800");
	fdg1.fDrawArcXY(note+nNot,ch+nNch,nArc);
}

function setLEDOff(ch, note)
{
	note-=48;
	if(note>=32) note=32;
	else if(note<0) note=0;

	fdg1.fFillColor("#888888");
	fdg1.fDrawArcXY(note+nNot,ch+nNch,nArc);
}
