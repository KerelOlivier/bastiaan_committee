///////////
//Classes//
///////////

//Fatty medicine carriers
class Lipo {

  constructor(exists, escaped, isHeated, heatCounter, px, py, dx, dy, dex, dey) {   
    this.exists = exists
    this.escaped = escaped
    this.isHeated = isHeated
    this.heatCounter = heatCounter
    this.position = { x: px, y: py }
    this.delta = { x: dx, y: dy }
    this.deltaEscaped = { x: dex, y: dey }
  }
}
//Medication object
class Med {
  constructor(exists, px, py, dx, dy, age){
    this.exists = exists
    this.position = {x:0, y:0}
    this.delta = {x:0, y:0}
    this.age = age
  }
}
//Not a hottub
class Hotzone {
  constructor(x, y, radius) {
    this.position = { x: x, y: y }
    this.radius = radius
  }
}
//A hole in the vessel
class Hole {
  constructor(left, length) {
    this.left = left      //Starting point on the left
    this.length = length  //Size of the hole
  }
}

/////////////
//Variables//
/////////////
//Parameters
let holeCount = 3;
let hotzoneCount = 3 //Amount of hotzones
let radiusAmount = 1
let pause = 15        //Time to wait between timesteps (ms)
let reviveChance = 1

const delta = {x: 7, y:7}       //x and y must me uneven
const deltaEscaped = {x:7, y:2}

//Parameters: Meds
const medPerLipo = 45
const dissolveChance = 1 //initial value, in 100 thousands --> dissolve_chance/100.000
const meddx = 2 //Must be even
const meddy = 2 //Must be even

//Canvas
let xSize = window.innerWidth
let ySize = window.innerHeight

//Radii
const medRadius = 1
const radiusMax = xSize / 8
const lipoRadius = 5

//Colors
const vesselColor = "rgb(255, 130, 130)"
const lipoColor = "rgb(150, 155, 255)"
const medColor = "rgb(0, 200, 200)"
const hotzoneColor = "red"

//Vessel
const vesselUpper = 4 * ySize / 10
const vesselLower = 1 * ySize / 10
const vesselHeight = vesselUpper - vesselLower

//lists
let lipos = []
let meds = []
let hotzones = []
let holes = []
let revive = []


//Array sizes
const arraySize = 500
const medArraySize = arraySize * medPerLipo
                                        



/* ASK::
 * WHY IS THE MIDDLE HOLE ALWAYS THE BIGGEST
 */
let hole1Left = randomInt(0, 51) - 25 + xSize / 4
let hole1Length = 3 * lipoRadius * 2 + randomInt(0, lipoRadius) - lipoRadius / 2
let hole2Left = randomInt(0, 51) - 25 + 2 * xSize / 4
let hole2Length = 4 * lipoRadius * 2 + randomInt(0, lipoRadius) - lipoRadius / 2
let hole3Left = randomInt(0, 51) - 25 + 3 * xSize / 4
let hole3Length = 3 * lipoRadius * 2 + randomInt(0, lipoRadius) - lipoRadius / 2
console.log(`${hole1Length}, ${hole2Length}, ${hole3Length}`)



let medSpawnDev = 17  //Keep uneven for nice code, nice code = good



//Clean Generation

//Create holes
for(i = 0; i < holeCount; i++){
  let left = randomInt(0, 51) - 25 + (i+1)* xSize / 4
  let length = 3 * lipoRadius * 2 + randomInt(0, lipoRadius) - lipoRadius / 2
  holes.push(new Hole(left, length))
}

//Create hotzones
for (i = 0; i < hotzoneCount; i++) {
  let x = (i + 1) * xSize / hotzoneCount - xSize / hotzoneCount / 2
  let y = ySize - radiusMax + randomInt(0, radiusMax / 2) - radiusMax / 2
  hotzones.push(new Hotzone(x, y, 0))
}

//Initialize meds
for (i = 0; i < medArraySize; i++) {
  meds.push(new Med(false, 0, 0, 0, 0, 0))
}


//Initialize lipos
for (i = 0; i < arraySize; i++) {
  let exists = false    //Whether or not the liposome exists
  let escaped = false   //Whether or not the liposome has escaped out of the bloodstream
  let isHeated = false  //Wheter the liposome is being heated by a hotzone
  let heatCounter = 0   //How long a liposome has been heated
  var px, py
  if (i < arraySize / 3) {
    exists = true;
  }
  if (exists) {
    px = randomInt(0, xSize - 2 * lipoRadius) + lipoRadius + 1
    py = randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1
  }
  else {
    px = -lipoRadius
    py = randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1
  }

  lipos.push(new Lipo(exists, escaped, isHeated, heatCounter, px, py, delta.x, delta.y, deltaEscaped.x, deltaEscaped.y))
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
  for (i = 0; i < hotzoneCount; i++) {
    for (j = 1; j < 1 + radiusAmount; j++) {
      var r = j * radiusMax / radiusAmount
      ctx.beginPath();
      ctx.arc(hotzones[i].position.x, hotzones[i].position.y, r, 0, 2 * Math.PI);
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
    if (!lipos[i].exists) {
      lipos[i].escaped = false
      lipos[i].isHeated = false
      lipos[i].heatCounter = 0
      lipos[i].position.x = -lipoRadius
      lipos[i].position.y = randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1
    }
  }

  //if escaped, check if heated. think if this statement is realy nessecairy
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].escaped) {
      for (h = 0; h < hotzoneCount; h++) {
        if (Math.sqrt(Math.pow((hotzones[h].position.x - lipos[i].position.x), 2) + Math.pow((hotzones[h].position.y - lipos[i].position.y), 2)) <= radiusMax) {
          lipos[i].isHeated = true
        }
      }
    }
  }

  //If heated start counter
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].isHeated) {
      lipos[i].heatCounter++;
    } else {
      lipos[i].heatCounter = 0;
    }
  }

  //variable chance for lipo to dissolve when heated
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].heatCounter > 2000 / pause) {  //if for more than 5/pause seconds heated...
      if (randomInt(0, 100) == 0 || lipos[i].position.y > 9 * ySize / 10) {  //variable Lipo collapse time --> not all at same hight
        lipos[i].exists = false
        lipos[i].heatCounter = 0
        for (m = i * medPerLipo; m < (i + 1) * medPerLipo; m++) {
          meds[m].exists = true
          meds[m].position.x = lipos[i].position.x + randomInt(0, medSpawnDev) - (medSpawnDev - 1) / 2
          meds[m].position.y = lipos[i].position.y + randomInt(0, medSpawnDev) - (medSpawnDev - 1) / 2
        }
      }
    }
  }

  //assign displacement to existing medicine
  for (m = 0; m < medArraySize; m++) {
    if (meds[m].exists) {
      meds[m].position.x += meds[m].delta.x
      meds[m].position.y += meds[m].delta.y
      meds[m].delta.x = randomInt(0, meddx * 2 + 1) - meddx
      meds[m].delta.y = randomInt(0, meddy * 2 + 1) - meddy
    }
  }

  ctx.fillStyle = medColor
  for (m = 0; m < medArraySize; m++) {
    if (meds[m].exists) {
      meds[m].age++

      ctx.beginPath();
      ctx.arc(meds[m].position.x, meds[m].position.y, medRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      if (randomInt(0, 100000) - meds[m].age < dissolveChance) {
        meds[m].exists = false;
        meds[m].age = 0;
      }
    }
  }
  //lipo actions if escaped/not escaped/not existend    
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].exists) {            // if lipo exists, make displacement
      if (!lipos[i].escaped) {
        lipos[i].delta.x = randomInt(0, delta.x) - 1;
        lipos[i].delta.y = randomInt(0, delta.y) - (delta.y - 1) / 2;
      }
      else if (lipos[i].escaped) {      //alternative rndm walk if escaped
        lipos[i].delta.x = randomInt(0, deltaEscaped.x) - (delta.x - 1) / 2;
        lipos[i].delta.y = randomInt(0, deltaEscaped.y);
      }
    }
    else if (!lipos[i].exists) {      // if lipo not exists, try to revive
      revive[i] = randomInt(0, 1000 / reviveChance);
      lipos[i].delta.x = 0;                     //now all have a displacement, also non existent
      lipos[i].delta.y = 0;
      if (revive[i] == 0) {
        lipos[i].exists = true;         //now lipo exists, gets displacement in next loup round
      }
    }
  }


  //prevent lipos from leaking through ...    
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].position.y + lipos[i].delta.y > vesselUpper - lipoRadius) {
      if (!lipos[i].escaped) {
        if (lipos[i].position.x + lipos[i].delta.x + lipoRadius > hole1Left && lipos[i].position.x + lipos[i].delta.x + lipoRadius < hole1Left + hole1Length
          || lipos[i].position.x + lipos[i].delta.x + lipoRadius > hole2Left && lipos[i].position.x + lipos[i].delta.x + lipoRadius < hole2Left + hole2Length
          || lipos[i].position.x + lipos[i].delta.x + lipoRadius > hole3Left && lipos[i].position.x + lipos[i].delta.x + lipoRadius < hole3Left + hole3Length) {
          //if lipo + dx is in a hole
          lipos[i].escaped = true;
        }
        else {
          lipos[i].delta.y = - lipos[i].delta.y;    //stay inside, you Liposome!
        }
      }
    }
    if (lipos[i].position.y + lipos[i].delta.y <= vesselLower + lipoRadius) { //prevent from leaking down
      lipos[i].delta.y = -lipos[i].delta.y;
    }
    if (lipos[i].escaped) {   //prevent leaking back in
      if (lipos[i].position.y + lipos[i].delta.y + lipoRadius < vesselUpper) {
        lipos[i].delta.y = - lipos[i].delta.y;
      }
    }
    if (lipos[i].escaped) {   //keep inside if escaped
      if (lipos[i].position.x + lipos[i].delta.x < 0 + lipoRadius || lipos[i].position.x + lipos[i].delta.x + lipoRadius > xSize) {
        lipos[i].delta.x = - lipos[i].delta.x;
      }
    }
    if (lipos[i].position.y + lipos[i].delta.y > ySize + lipoRadius) { //if escape on top: respawn
      lipos[i].escaped = false;
      lipos[i].exists = false;
    }
  }
  //add displacement for lipo exist    
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].exists) {
      lipos[i].position.x += lipos[i].delta.x;
      lipos[i].position.y += lipos[i].delta.y;
    }
  }
  //if flown out on right, respawn to wait on left    
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].position.x >= xSize + lipoRadius) {
      lipos[i].exists = false;
      lipos[i].position.x = -lipoRadius;          //on left side outside screen
      lipos[i].position.y = randomInt(0, vesselHeight - 2 * lipoRadius) + vesselLower + lipoRadius + 1;
    }
  }
  ctx.fillStyle = lipoColor
  //if lipo exists, draw lipo    
  for (i = 0; i < arraySize; i++) {
    if (lipos[i].exists) {
      ctx.beginPath();
      ctx.arc(lipos[i].position.x, lipos[i].position.y, lipoRadius, 0, 2 * Math.PI);
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

//Draw a line from (x0, y0) to (x1, y1)
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