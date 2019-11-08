//PLAYBACK:
var paranormalGSRcb
var paranormalRATEcb
var paranormalHRVcb

var indexgsr = 0;
var h = 0;
var indexrate = 0;
var indexhrv = 0;


//REALTIME:
var gsr = 0;
var rate = 0;
var hrv = 0;

var dataGSR = [];
var dataRATE = [];
var dataHRV = [];

//PRELOAD
  //Funktion gibt mir ein Array, das ich in die Variable data hineinspeichere.
  //Die Zahlen aus data.txt werden geladen. 
function preload () {
  paranormalGSRcb = loadStrings('data/paranormal_gsr_cb.csv');
  paranormalRATEcb = loadStrings('data/paranormal_rate_cb.csv');
  paranormalHRVcb = loadStrings('data/paranormal_hrv_cb.csv');
}

//------- SETUP ------- 
function setup () {
  createCanvas(windowWidth, 3000);

  //PLAYBACK: convert strings to numbers und in Console kontrollieren
  for(var i=0; i<paranormalGSRcb.length; i++){
		paranormalGSRcb[i] = +paranormalGSRcb[i];
	}
  console.log('GSR', paranormalGSRcb);
  
  for(var i=0; i<paranormalRATEcb.length; i++){
		paranormalRATEcb[i] = +paranormalRATEcb[i];
	}
  console.log('RATE',paranormalRATEcb);

  for(var i=0; i<paranormalHRVcb.length; i++){
		paranormalHRVcb[i] = +paranormalHRVcb[i];
	}
	console.log('HRV', paranormalHRVcb);
  
   //Verbindung zum Broker herstellen
  var client = mqtt.connect('mqtt://aeba5ae7:98e21bb6bccdb957@broker.shiftr.io', {
    clientId: 'framalytics'
  });
  console.log('client', client);

 
  //REALTIME: sobald client und broker zusammen verbunden sind, soll Funktion ausgeführt werden
  client.on('connect', function () {
    console.log('client has connected!');
    //topics von Arduino abonnieren (damit wir Daten bekommen von den Sensoren)
    client.subscribe('/pulse/interval');
    client.subscribe('/gsr');
  });

  //REALTIME: Jedes Mal, wenn Browser Daten erhält von Broker, wird das in der Console ausgegeben + speichere die Daten in einem String
  client.on('message', function (topic, message) {
    console.log('new message:', topic, message.toString());
    
    var msg = message.toString();
    
    if (topic == '/pulse/interval') {
      var tokens = split(msg, ',');
      rate = +tokens[0];
      hrv = +tokens[1];
    }
    else if (topic == '/gsr') {
      gsr = +msg;
    }

    // Ich füge ein neues Element in den Array ein
    dataGSR.push(gsr);
    dataRATE.push(rate);
    dataHRV.push(hrv);

  });
  
  //Buttons für die Datenaufnahme
  buttonStart = createButton ('START');
  buttonStart.mousePressed(startsaving);
  buttonStart.position(10,10);
  buttonStop = createButton ('STOP');
  buttonStop.mousePressed(stopsaving);
  buttonStop.position(70,10);

 //PLAYBACK: sending data 4 times per second
 frameRate(4);
}


//------- DRAW ------- 
function draw () {
  background('grey');

  //REALTIME: Anzeige der Werte im Browser
  fill ('white');
  text("Puls: " + rate, 100, 100);
  text("Interval: " + hrv, 100, 120);
  text("GSR: " + gsr, 100, 140);

  //PLAYBACK: Visualisierung Daten (statische Balken)
  for (var i = 0; i<paranormalHRVcb.length; i++) {
    var x = map(i,0,paranormalHRVcb.length-1,50,windowWidth-50);
    var height = map(paranormalHRVcb[i],500,1500,0,60)
    fill ('yellow');
    noStroke();
    text ("HEARTRATE VARIABILITY",50, 250);
    rect (x,320,1,-height);
  }
  for (var i = 0; i<paranormalGSRcb.length; i++) {
		var x = map(i,0,paranormalGSRcb.length-1,50,windowWidth-50);
		var height = map(paranormalGSRcb[i],100,400,0,60)
		fill ('yellow');
    noStroke();
    text ("GALVANIC SKIN RESPONSE", 50, 400);
    rect (x,470,1,-height);
  }
  for (var i = 0; i<paranormalRATEcb.length; i++) {
    var x = map(i,0,paranormalRATEcb.length-1,50,windowWidth-50);
    var height = map(paranormalRATEcb[i],30,120,0,60)
    fill ('yellow');
    noStroke();
    text ("HEARTRATE",50, 550);
    rect (x,620,1,-height);
  }
  
  //PLAYBACK: Visualisierung Daten (dynamisch, 4x pro Sekunde)
  indexgsr++;
  if(indexgsr>paranormalGSRcb.length-1){
    indexgsr=0;
  }
  // ohne easing: 
  var höhegsr = map(paranormalGSRcb[indexgsr],200,400,0,150);
  // mit easing (+ funktion unten, + höhe durch h ersetzen bei rect)
  //var höhe = map(paranormalHRVcb[index],500,1500,0,60);
  //h = ease(h, höhe);
  stroke('white');
  noFill();
  rect(50, 800, 50, -höhegsr);
  text ("GSR",50, 820);

  indexrate++;
  if(indexrate>paranormalRATEcb.length-1){
    indexrate=0;
  }
  var höherate = map(paranormalRATEcb[indexrate],30,120,0,150)
  stroke('white');
  noFill();
  rect(150, 800, 50, -höherate);
  text ("RATE",150, 820);

  indexhrv++;
  if(indexhrv>paranormalHRVcb.length-1){
    indexhrv=0;
  }
  var höhehrv = map(paranormalHRVcb[indexhrv],500,1500,0,150)
  stroke('white');
  noFill();
  rect(250, 800, 50, -höhehrv);
  text ("HRV",250, 820);

}

//FUNKTIONEN
//Datenaufnahme
function startsaving(){
    console.log('start saving data to json file');
    alert("Die Daten werden jetzt aufgenommen.");
    ataGSR = loadStrings('dataGSR.txt');
    dataRATE = loadStrings('dataRATE.txt');
    dataHRV = loadStrings('dataHRV.txt');
  }

  function stopsaving(){
    console.log('stop saving data to json file');
    alert("Die Daten wurden heruntergeladen.");
    saveStrings(dataGSR,'dataGSR.txt');
    saveStrings(dataRATE,'dataRATE.txt');
    saveStrings(dataHRV,'dataHRV.txt');
	}

// Ease
//function ease (n, target) {
 // var easing = 0.05;
 // var d = target - n;
 // return n + d * easing;
//}