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
  createCanvas(windowWidth, 6000);

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
  
  //CS
  //braucht es den reailtime code in diesem Sketch? 
  //wenn nicht, nehmt ihn raus. 
  //Das reduziert dann die Kpmplexität eueres Codes.
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
  background('black');

  //REALTIME: Anzeige der Werte im Browser
  fill ('white');
  text("Puls: " + rate, 100, 100);
  text("Interval: " + hrv, 100, 120);
  text("GSR: " + gsr, 100, 140);

  //CS
  //ihr braucht den titel nur einmal zu zeichnen
  //hab ihn aus der for loop rausgenommen
  fill ('yellow');
  noStroke();
  text ("HEARTRATE VARIABILITY",50, 250);
  //PLAYBACK: Visualisierung Daten (statisches Balkendiagramm)
  for (var i = 0; i<paranormalHRVcb.length; i++) {
    var x = map(i,0,paranormalHRVcb.length-1,50,windowWidth-50);
    var height = map(paranormalHRVcb[i],500,1500,0,60)
    //fill ('yellow');
    //noStroke();
    //text ("HEARTRATE VARIABILITY",50, 250);
    rect (x,320,1,-height);
  }

  //CS
  //auch hier text nur einmal zeichnen
  fill ('yellow');
  noStroke();
  text ("GALVANIC SKIN RESPONSE", 50, 400);
  for (var i = 0; i<paranormalGSRcb.length; i++) {
		var x = map(i,0,paranormalGSRcb.length-1,50,windowWidth-50);
		var height = map(paranormalGSRcb[i],100,400,0,60)
		//fill ('yellow');
    //noStroke();
    //text ("GALVANIC SKIN RESPONSE", 50, 400);
    rect (x,470,1,-height);
  }

  //CS
  //text nur einmal zeichnen
  fill ('yellow');
  noStroke();
  text ("HEARTRATE",50, 550);
  for (var i = 0; i<paranormalRATEcb.length; i++) {
    var x = map(i,0,paranormalRATEcb.length-1,50,windowWidth-50);
    var height = map(paranormalRATEcb[i],30,120,0,60)
    //fill ('yellow');
    //noStroke();
    //text ("HEARTRATE",50, 550);
    rect (x,620,1,-height);
  }
  
  //PLAYBACK: Visualisierung Daten (dynamische Balken, 4x pro Sekunde)
  indexgsr++;
  if(indexgsr>paranormalGSRcb.length-1){
    indexgsr=0;
  }
  console.log(indexgsr);

  // ohne easing: 
  var hoehegsr = map(paranormalGSRcb[indexgsr],200,400,0,150);
  // mit easing (+ funktion unten, + höhe durch h ersetzen bei rect)
  //var höhe = map(paranormalHRVcb[index],500,1500,0,60);
  //h = ease(h, höhe);
  stroke('white');
  noFill();
  rect(50, 800, 50, -hoehegsr);
  text ("GSR",50, 820);

  indexrate++;
  if(indexrate>paranormalRATEcb.length-1){
    indexrate=0;
  }
  var hoeherate = map(paranormalRATEcb[indexrate],30,120,0,150)
  stroke('white');
  noFill();
  rect(150, 800, 50, -hoeherate);
  text ("RATE",150, 820);

  indexhrv++;
  if(indexhrv>paranormalHRVcb.length-1){
    indexhrv=0;
  }
  var hoehehrv = map(paranormalHRVcb[indexhrv],500,1500,0,150)
  stroke('white');
  noFill();
  rect(250, 800, 50, -hoehehrv);
  text ("HRV",250, 820);


  //PLAYBACK: Visualisierung Daten (Prototyp A: Eye 1)
  noStroke();
  fill('lightblue');
  textSize(16);
  text ("EYE 1",300, 980);
  // GSR --> FARBE (Prototyp A: Eye 1)
  colorgsr();
  noStroke();
  ellipse (windowWidth/2,1200,180);
  // RATE --> RINGE (Prototyp A: Eye 1)
  var r = 10;  
  var ringe = map(paranormalRATEcb[indexrate],30,120,1,90);
  stroke('grey');
  noFill();
  if(ringe != 0) {
    for (var a = 20; a < ringe + 1; a+=0.7){
      ellipse(windowWidth/2, 1200, r * a, r * a);
    }
  }else {
    ellipse(windowWidth/2, 1200, r, r);
  }
  // HRV --> STERN (Prototyp A: Eye 1)
  var anzahlEcken = map(paranormalHRVcb[indexhrv],500,1500,0,200);
  noStroke();
  fill('black');
  push();
  star(windowWidth/2, 1200, 50, 90, anzahlEcken);
  pop();


  //PLAYBACK: Visualisierung Daten (Prototyp A: Eye 2)
  noStroke();
  fill('lightblue');
  textSize(16);
  text ("EYE 2",300, 1500);
  // GSR --> FARBE (Prototyp A: Eye 2)
  colorgsr();
  noStroke();
  ellipse (windowWidth/2,1800,400);
  // RATE --> GRÖSSE PUPILLE (Prototyp A: Eye 2)
  var pupilSize = map(paranormalRATEcb[indexrate],30,120,10,400);
  noStroke();
  fill('black');
  ellipse (windowWidth/2,1800,pupilSize);


  //PLAYBACK: Visualisierung Daten (Prototyp A: Eye 3)
  noStroke();
  fill('lightblue');
  textSize(16);
  text ("EYE 3",300, 2200);
  // GSR --> FARBE (Prototyp A: Eye 3)
  colorgsr();
  noStroke();
  ellipse (windowWidth/2,2400,400);
  // RATE --> PUPILLE + STERN (Prototyp A: Eye 3)
  var pupilSize = map(paranormalRATEcb[indexrate],30,120,10,400);
  noStroke();
  fill('black');
  ellipse (windowWidth/2,2400,pupilSize);
  push();
  star(windowWidth/2, 2400, 200, 30, 60);
  pop();


  //PLAYBACK: Visualisierung Daten (Prototyp A: Eye 4)
  noStroke();
  fill('lightblue');
  textSize(16);
  text ("EYE 4",300, 2800);
  //
  var pupilStar = map(paranormalRATEcb[indexrate],30,120,160,500);
  // GSR --> FARBE (Prototyp A: Eye 4)
  colorgsr();
  noStroke();
  ellipse (windowWidth/2,3000,pupilStar);
  // RATE --> STERN (Prototyp A: Eye 4)  
  noStroke();
  fill('black');
  push();
  var starinner = 50
  var starouter = starinner-pupilStar
  star(windowWidth/2, 3000, starinner, starouter, 60);
  pop();
  //
  fill('black');
  ellipse (windowWidth/2,3000,100);


  //PLAYBACK: Visualisierung Daten (Prototyp B: Roestigraben 1)
  noStroke();
  fill('lightblue');
  textSize(16);
  text ("ROESTIGRABEN 1",300, 3300);
  //
  colorgsr();
  rect (0,3350,windowWidth,500)
  // RATE --> RINGE (Prototyp B: Roestigraben 1)
  var r = 10;  
  var ringe = map(paranormalRATEcb[indexrate],30,120,1,90);
  stroke('white');
  noFill();
  // HRV --> DISTANZ (Prototyp B: Roestigraben 1)
  var distanzX = map(paranormalHRVcb[indexhrv],500,1500,0,windowWidth/2);
  // RING (links)
  if(ringe != 0) {
    for (var a = 20; a < ringe + 1; a+=0.7){
      ellipse((windowWidth/2)-distanzX, 3600, r * a, r * a);
    }
  }else {
    ellipse((windowWidth/2)-distanzX, 3600, r, r);
  }
  // RING (rechts)
  if(ringe != 0) {
    for (var a = 20; a < ringe + 1; a+=0.7){
      ellipse((windowWidth/2)+distanzX, 3600, r * a, r * a);
    }
  }else {
    ellipse((windowWidth/2)+distanzX, 3600, r, r);
  }
  

  //PLAYBACK: Visualisierung Daten (Prototyp B: Roestigraben 2)
  noStroke();
  fill('lightblue');
  textSize(16);
  text ("ROESTIGRABEN 2",300, 4000);
  //Welle

  
 

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

// Stern
function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Color GSR
function colorgsr() {
  if (paranormalGSRcb[indexgsr]<=100){
    var farbe1 = map(paranormalGSRcb[indexgsr],0,100,70,71);
    fill(223, 52, farbe1);
  }
  else if (paranormalGSRcb[indexgsr]>=101 && paranormalGSRcb[indexgsr] <=130){
    var farbe2 = map(paranormalGSRcb[indexgsr],101,130,100,101);
    fill(226, 56, farbe2);
  }
  else if (paranormalGSRcb[indexgsr]>=131 && paranormalGSRcb[indexgsr] <=160){
    var farbe3 = map(paranormalGSRcb[indexgsr],131,160,129,130);
    fill(222, 68, farbe3);
  }
  else if (paranormalGSRcb[indexgsr]>=161 && paranormalGSRcb[indexgsr]<=190){
    var farbe4 = map(paranormalGSRcb[indexgsr],161,190,155,156);
    fill(213, 83, farbe4);
  }
  else if (paranormalGSRcb[indexgsr]>=191 && paranormalGSRcb[indexgsr] <=220){
    var farbe5 = map(paranormalGSRcb[indexgsr],191,220,178,179);
    fill(200, 98, farbe5);
  }
  else if (paranormalGSRcb[indexgsr]>=221 && paranormalGSRcb[indexgsr] <=250){
    var farbe6 = map(paranormalGSRcb[indexgsr],221,250,195,196);
    fill(182, 113, farbe6);
  }
  else if (paranormalGSRcb[indexgsr]>=251 && paranormalGSRcb[indexgsr] <=280){
    var farbe7 = map(paranormalGSRcb[indexgsr],251,280,208,209);
    fill(163, 127, farbe7);
  }
  else if (paranormalGSRcb[indexgsr]>=281 && paranormalGSRcb[indexgsr] <=310){
    var farbe8 = map(paranormalGSRcb[indexgsr],281,310,216,217);
    fill(142, 139, farbe8);
  }
  else if (paranormalGSRcb[indexgsr]>=311 && paranormalGSRcb[indexgsr] <=340){
    var farbe9 = map(paranormalGSRcb[indexgsr],311,340,218,219);
    fill(124, 149, farbe9);
  }
  else if (paranormalGSRcb[indexgsr]>=341 && paranormalGSRcb[indexgsr] <=370){
    var farbe10 = map(paranormalGSRcb[indexgsr],341,370,217,218);
    fill(111, 158, farbe10);
  }
  else if (paranormalGSRcb[indexgsr]>=371 && paranormalGSRcb[indexgsr] <=400){
    var farbe11 = map(paranormalGSRcb[indexgsr],371,400,213,214);
    fill(104, 165, farbe11);
  }
  else if (paranormalGSRcb[indexgsr]>=401){
    var farbe12 = map(paranormalGSRcb[indexgsr],401,800,206,207);
    fill(106, 171, farbe12);
  }
}
