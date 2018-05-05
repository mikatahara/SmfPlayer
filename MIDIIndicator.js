	var fdg1;
	var mClk=0;
	p1=[0.1,2.0];
	p2=[-0.5,4];

window.addEventListener('load', function (){

	fdg1 = new DrawGraph(0,1200,0,600);
	fdg1.fSetCanvas(document.getElementById('bkg'));
	fdg1.fResize();
//	fdg1.fLine(0,0,1200,600);
	fdg1.fLine(0,0,fdg1.cv.width,fdg1.cv.height);

	fdg1.fSetViewPort(-4,4,-4,4);
	fdg1.fSetWindowXY(0,fdg1.cv.width,0,fdg1.cv.height);
	fdg1.fVLine(-4,0,4,0);
	fdg1.fVStrokeDottedLine(0,-4,0,4);

//	fdg1.fLine(0,0,1000,fdg1.cv.height);
//	fdg1.fLine(1000,0,0,fdg1.cv.height);

	fdg1.fSetViewPort(0,48,0,18);
	
		fdg1.fFillColor("#555555");
	for(var j=1; j<=1+16; j++){
		for(var i=8; i<=8+32; i++){
			fdg1.fDrawArcXY(i,j,10);
		}
	}

	log = document.getElementById("log");

	log.innerText =fdg1.cv.width +" ";
	log.innerText +=fdg1.cv.height;
	log.innerText +="\n";

}, false);
