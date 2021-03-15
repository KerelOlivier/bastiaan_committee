let xSize = window.innerWidth
let ySize = window.innerHeight
let pause = 15  //In milliseconds
let arraySize = 500
let hotzoneAmount = 3
let radiusAmount = 1
let hotzoneColor = "red"
let vesselUpper = 4 * ySize / 10
let vesselLower = 1 * ySize / 10
let reviveChance = 1
let revive = []
let vesselHeight = vesselUpper - vesselLower
let lipoRadius = 5

//Spawn random holes
let hole1Left = randomInt(0, 51) - 25 + xSize / 4
let hole1Length = 3 * lipoRadius * 2 + randomInt(0, lipoRadius) - lipoRadius / 2;
let hole2Left = randomInt(0, 51) - 25 + 2 * xSize / 4
let hole2Length = 4 * lipoRadius * 2 + randomInt(0, lipoRadius) - lipoRadius / 2;
let hole3Left = randomInt(0, 51) - 25 + 3 * xSize / 4
let hole3Length = 3 * lipoRadius * 2 + randomInt(0, lipoRadius) - lipoRadius / 2;

let hotzoneX = []
let hotzoneY = []
let hotzoneRadius = []

let radiusMax = xSize / 8

for (i = 0; i < hotzoneAmount; i++) {
  hotzoneX.push((i + 1) * xSize / hotzoneAmount - xSize / hotzoneAmount / 2)
  hotzoneY.push(ySize - radiusMax + randomInt(0, radiusMax / 2) - radiusMax / 2)
}

let lipoExists = []
let lipoEscaped = []
let lipoHeated = []
let lipoHeatCount = []

let lipoX = []      //Lipo locations
let lipoY = []

let lipoDx = []     //Lipo displacement
let dx = 7          //Must be uneven
let dxEscaped = 7

let lipoDy = []     //Lipo displacement
let dy = 7          //Must be uneven
let dyEscaped = 2

let medPerLipo = 45
let medArraySize = arraySize * medPerLipo
let medX = []
let medY = []
let medDx = []
let medCount = []

let dissolveChance = 1 //initial value, in 100 thousands --> dissolve_chance/100.000
let meddx = 2 //Must be even
let meddy = 2 //Must be even

let medDy = []
let medExists = []
let medSpawnDev = 17  //Keep uneven for nice code, nice code = good
let medRadius = 1
let medLifeCount = []

//Fill med stuff
for (i = 0; i < medArraySize; i++) {
  medExists.push(false)
  medX.push(0)
  medY.push(0)
  medDx.push(0)
  medDy.push(0)
}

let lipoColor = "rgb(150, 155, 255)"
let vesselColor = "rgb(255, 130, 130)"
let medColor = "rgb(0, 200, 200)"

//Initialize lipos
for (i = 0; i < arraySize; i++) {
  lipoExists.push(false)
  lipoEscaped.push(false)
  lipoHeated.push(false)
  lipoHeatCount.push(0)

  if (i < arraySize / 3) {
    lipoExists[i] = true;
  } 
  if(lipoExists[i]){
    lipoX.push(randomInt(0, xSize - 2 * lipoRadius) + lipoRadius + 1)
    lipoY.push(randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1);
  }
  else {
    lipoX.push(-lipoRadius)
    lipoY.push(randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1)
  }
}


/////////////////
//Drawing stuff//
/////////////////

var canvas = document.getElementById('cvs')
//Set initial canvas state
resizeCanvas()
draw()
//Handle window resize
window.onresize = resizeCanvas

//Resizes canvas to current window size
function resizeCanvas() {
  //Set canvas parameters
  canvas.width = xSize
  canvas.height = ySize
  draw()
}

//Draws things to the screen
function draw() {
  /** @type {CanvasRenderingContext2D} */
  var ctx = canvas.getContext('2d')
  //Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  //Fill canvas
  drawVessel(ctx)
  drawHotzones(ctx)
  drawLipos(ctx)
}

function drawVessel(context) {
  /** @type {CanvasRenderingContext2D} */
  var ctx = context
  ctx.fillStyle = vesselColor
  //draw upper vessel boundaries
  drawLine(0, vesselUpper, hole1Left, vesselUpper, vesselColor, 10, context)
  drawLine(hole1Left + hole1Length, vesselUpper, hole2Left, vesselUpper, vesselColor, 10, context)
  drawLine(hole2Left + hole2Length, vesselUpper, hole3Left, vesselUpper, vesselColor, 10, context)
  drawLine(hole3Left + hole3Length, vesselUpper, xSize, vesselUpper, vesselColor, 10, context)

  //Draw lower vessel boundary
  drawLine(0, vesselLower, xSize, vesselLower, vesselColor, 10, context)

}
function drawHotzones(context) {
  /** @type {CanvasRenderingContext2D} */
  var ctx = context
  ctx.strokeStyle = "transparent"
  ctx.fillStyle = hotzoneColor
  for (i = 0; i < hotzoneAmount; i++) {
    for (j = 1; j < 1 + radiusAmount; j++) {
      var r = j * radiusMax / radiusAmount
      ctx.beginPath();
      ctx.arc(hotzoneX[i], hotzoneY[i], r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function drawLipos(context) {
  /** @type {CanvasRenderingContext2D} */
  var ctx = context
  ctx.strokeStyle = "transparent"
  ctx.fillStyle = lipoColor

  //if lipo not exists, draw outside scrreen   
  for (i = 0; i < arraySize; i++) {
    if (!lipoExists[i]) {
      lipoEscaped[i] = false
      lipoHeated[i] = false
      lipoHeatCount[i] = 0
      lipoX[i] = -lipoRadius
      lipoY[i] = randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1
    }
  }

  //if escaped, check if heated. think if this statement is realy nessecairy
  for (i = 0; i < arraySize; i++) {
    if (lipoEscaped[i]) {
      for (h = 0; h < hotzoneAmount; h++) {
        if (Math.sqrt(Math.pow((hotzoneX[h] - lipoX[i]), 2)+ Math.pow((hotzoneY[h]-lipoY[i]), 2)) <= radiusMax) {
          lipoHeated[i] = true
        }
      }
    }
  }

  //If heated start counter
  for (i = 0; i < arraySize; i++) {
    if (lipoHeated[i]) {
      lipoHeatCount[i]++;
    } else {
      lipoHeatCount[i] = 0;
    }
  }

  //variable chance for lipo to dissolve when heated
  for (i = 0; i < arraySize; i++) {
    if (lipoHeatCount[i] > 2000 / pause) {  //if for more than 5/pause seconds heated...
      if (randomInt(0, 100) == 0 || lipoY[i] > 9 * ySize / 10) {  //variable Lipo collapse time --> not all at same hight
        lipoExists[i] = false
        lipoHeatCount[i] = 0
        for (m = i * medPerLipo; m < (i + 1) * medPerLipo; m++) {
          medExists[m] = true
          medX[m] = lipoX[i] + randomInt(0, medSpawnDev) - (medSpawnDev - 1) / 2
          medY[m] = lipoY[i] + randomInt(0, medSpawnDev) - (medSpawnDev - 1) / 2
        }
      }
    }
  }

  //assign displacement to existing medicine
  for (m = 0; m < medArraySize; m++) {
    if (medExists[m]) {
      medX[m] += medDx[m]
      medY[m] += medDy[m]
      medDx[m] = randomInt(0, meddx * 2 + 1) - meddx
      medDy[m] = randomInt(0, meddy * 2 + 1) - meddy
    }
  }

  ctx.fillStyle = medColor
  for (m = 0; m < medArraySize; m++) {
    if (medExists[m]) {
      medCount[m]++

      ctx.beginPath();
      ctx.arc(medX[m], medY[m], medRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      if (randomInt(0, 100000) - medCount[m] < dissolveChance) {
        medExists[m] = false;
        medCount[m] = 0;
      }
    }
  }
  //lipo actions if escaped/not escaped/not existend    
  for (i = 0; i < arraySize; i++) {
    if (lipoExists[i]) {            // if lipo exists, make displacement
      if (!lipoEscaped[i]) {
        lipoDx[i] = randomInt(0, dx) - 1;
        lipoDy[i] = randomInt(0, dy) - (dy - 1) / 2;
      }
      else if (lipoEscaped[i]) {      //alternative rndm walk if escaped
        lipoDx[i] = randomInt(0, dxEscaped) - (dx - 1) / 2;
        lipoDy[i] = randomInt(0, dyEscaped);
      }
    }
    else if (!lipoExists[i]) {      // if lipo not exists, try to revive
      revive[i] = randomInt(0, 1000 / reviveChance);
      lipoDx[i] = 0;                     //now all have a displacement, also non existent
      lipoDy[i] = 0;
      if (revive[i] == 0) {
        lipoExists[i] = true;         //now lipo exists, gets displacement in next loup round
      }
    }
  }


  //prevent lipos from leaking through ...    
  for (i = 0; i < arraySize; i++) {
    if (lipoY[i] + lipoDy[i] > vesselUpper - lipoRadius) {
      if (!lipoEscaped[i]) {
        if (lipoX[i] + lipoDx[i] + lipoRadius > hole1Left && lipoX[i] + lipoDx[i] + lipoRadius < hole1Left + hole1Length
         || lipoX[i] + lipoDx[i] + lipoRadius > hole2Left && lipoX[i] + lipoDx[i] + lipoRadius < hole2Left + hole2Length
         || lipoX[i] + lipoDx[i] + lipoRadius > hole3Left && lipoX[i] + lipoDx[i] + lipoRadius < hole3Left + hole3Length) {
          //if lipo + dx is in a hole
          lipoEscaped[i] = true;
        }
        else {
          lipoDy[i] = - lipoDy[i];    //stay inside, you Liposome!
        }
      }
    }
    if (lipoY[i] + lipoDy[i] <= vesselLower + lipoRadius) { //prevent from leaking down
      lipoDy[i] = -lipoDy[i];
    }
    if (lipoEscaped[i]) {   //prevent leaking back in
      if (lipoY[i] + lipoDy[i] + lipoRadius < vesselUpper) {
        lipoDy[i] = - lipoDy[i];
      }
    }
    if (lipoEscaped[i]) {   //keep inside if escaped
      if (lipoX[i] + lipoDx[i] < 0 + lipoRadius || lipoX[i] + lipoDx[i] + lipoRadius > xSize) {
        lipoDx[i] = - lipoDx[i];
      }
    }
    if (lipoY[i] + lipoDy[i] > ySize + lipoRadius) { //if escape on top: respawn
      lipoEscaped[i] = false;
      lipoExists[i] = false;
    }
  }
  //add displacement for lipo exist    
  for (i = 0; i < arraySize; i++) {
    if (lipoExists[i]) {
      lipoX[i] += lipoDx[i];
      lipoY[i] += lipoDy[i];
    }
  }
  //if flown out on right, respawn to wait on left    
  for (i = 0; i < arraySize; i++) {
    if (lipoX[i] >= xSize + lipoRadius) {
      lipoExists[i] = false;
      lipoX[i] = -lipoRadius;          //on left side outside screen
      lipoY[i] = randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1;
    }
  }
  ctx.fillStyle=lipoColor
  //if lipo exists, draw lipo    
  for (i = 0; i < arraySize; i++) {
    if (lipoExists[i]) {
      ctx.beginPath();
      ctx.arc(lipoX[i], lipoY[i], lipoRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }


}

//////////////
//Simulation//
//////////////
//Create the simulation loop
let simLoopID = window.setInterval(simulation, pause)


function simulation() {
  draw()
}


//////////////////
//Util functions//
//////////////////
//Return a random integer with exclusive upperbound
function randomInt(lower, upper) {
  let rnd = Math.random()
  return lower + Math.floor((upper - lower) * rnd)
}

function drawLine(x0, y0, x1, y1, color, width, context) {
  /** @type {CanvasRenderingContext2D} */
  var ctx = context
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
}