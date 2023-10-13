var flow_field;
var scrSize = 1200
circSize = scrSize*.8
var cycle;
// var R = 100
// var G = 95
// var B = 92
var R = 100
var G = 91
var B = 89
var dev = false
var RT = 1200/700
var salt

var RGBl

class FlowField {
  constructor(cellW, width, zoomX, zoomY) {
    this.cellW = cellW
    this.width = width
    this.nrows = Math.ceil(width/cellW)
    this.board = []
    for (let r=0; r<this.nrows; r++) {
      let row = []
      for (let c=0; c<this.nrows; c++) {
        row.push(noise(r*zoomX,c*zoomY))
      }
    }
    this.resizeCallback()
  }
  get(x,y) {
    return this.board
  }
  getRelative(x,y) {

  }
  resizeCallback() {

  }
}

function setup() {
  createCanvas(scrSize, scrSize);
  noiseDetail(22,.75) //.75
  flow_field = new FlowField(10, scrSize, 1/60, 1/60)
  cycle = -1
  RGBl = [
    map(R,0,100,0,255),
    map(G,0,100,0,255),
    map(B,0,100,0,255),
  ]
  salt = random()*255*RT
}

function draw() {
  // loading
  if (cycle < 1) {
    fill(50,50,50)
    textSize(16)
    text("...Generating...",windowWidth/2,windowHeight/2)
  }
  // circle
  if (cycle == 1) {
    drawCircle()
  }
  // brush
  if (cycle == 2) {
    brush()
  }
  cycle += 1
  // noLoop()
  // console.log('next loop')
}

function mousePressed() {
  // loop()
}

function drawCircle() {
  // clear
  background(255,254,252);
  noStroke()
  fill(220)
  // circle(scrSize/2,scrSize/2,circSize,80)
  let dots = []
  for (let x=0; x<scrSize; x++) {
    let dot = []
    for (let y=0; y<scrSize; y++) {
      let d = dist(x,y,scrSize/2,scrSize/2)
      if (d <= circSize/2) {
        let n = noise(x/200,y/200+40,13.023)
        n = pow(n,1.8)
        let dd = d/(circSize/2)
        let pw = 60
        n += pow(dd,pw)
        stroke(R*n,G*n,B*n)
        let sw = max(1.5,dd*3)
        strokeWeight(sw)
        dirn = noise(x/100+salt,y/100,salt)
        let rx = sin(noise(x/400+salt*3,y/400+salt,72)*PI*2)*random()
        let ry = cos(noise(x/400+salt*3,y/400+salt,72)*PI*2)*random()
        rx *= dd*dd
        ry *= dd*dd
        // let rx2 = noise(x/40,y/40,72,1/40)*random()*2-1
        // let ry2 = noise(x/40,y/40,72,1/40)*random()*2-1
        if (dev) {
          point(x+rx,y+ry)
        } else {
          dot.push({x,y,rx,ry,sw,n,dirn})
        }
      }
    }
    if (dot.length>0) {
      dots.push(dot)
    }
  }
  console.log('dot places')

  function paintDot({x,y,rx,ry,sw,n,dirn}, onlyLine=false) {
    let rn = .8
    if (!onlyLine) {
      stroke(R*n,G*n,B*n)
      strokeWeight(sw*2)
      point(x+rx*2,y+ry*2)
      rn = .7
    }
    if (random()>rn) {
      stroke(R*n*.6,G*n*.6,B*n*.6)
      let sw = pow(random(2),2)
      strokeWeight(sw)
      let dx = sin(dirn*PI*2)
      let dy = cos(dirn*PI*2)
      line(x+rx*dx,y+ry*dy,
           x+rx*dx+dx*random(2,7),
           y+ry*dy+dy*random(2,7))
      n = n*.6 + .4 // *.7
      stroke(RGBl[0]*n,RGBl[1]*n,RGBl[2]*n)
      strokeWeight(sw/3)
      line(x+rx*dx+random(),y+ry*dy+random(),
          x+rx*dx+dx*random(2,5)+random(),
          y+ry*dy+dy*random(2,5)+random())
    }
  }
  // dots
  for (let dot of dots) {
    for (let d of dot) {
      paintDot(d, false)
    }
  }
  console.log('dots')
  // dark
  // for (let dot of dots) {
  //   for (let {x,y,rx,ry,sw,n,dirn} of dot) {
  //     stroke(R*n,G*n,B*n)
  //     strokeWeight(sw/2)
  //     line(x,y,x+(dirn*2-1)*random(3),y+(dirn*2-1)*random(3))
  //   }
  // }
  // console.log('line paint')
  // indent
  for (let dot of dots) {
    for (let d of dot) {
      paintDot(d, true)
    }
  }
  console.log('line stroke')
}

function lize(v,a=1) {
  return 1-exp(-v*a)
}

function brush() {
  let oldBrush = random() > .5
  let hairPad = 8 // 5
  let inStroke = false
  let yStartVariation = 137 //80
  let xVariation = 25 //15
  lines = []
  for (let x=0; x < scrSize; x += hairPad) {
    // start y on bottom
    let y = scrSize - noise(x/400*RT+salt)* yStartVariation
    // 0-4 smoothed (brush loaded a bit)
    let charcoal = noise(x/80*RT+salt*2)
    charcoal = map(sin(x/scrSize*PI),0,1,0,charcoal)
    // _./
    charcoal *= charcoal
    charcoal *= 4
    // flipped y
    // charcoal = 1-charcoal
    let line = []
    let tp = 0
    for (;y>=0; y -= 0.5) {
      let pressure = noise(x/120*RT+salt*3, y/2000*RT+salt)
      pressure = pow(pressure,2)
      // cap noise at 0-1
      cappedPressure = 1-exp(-pressure * 2)
      let n;
      oldBrush = false
      if (oldBrush) {
        n = noise(x/200*RT+salt,y/1000*RT+salt*4)*2-1
      } else {
        n = noise(x/4000*RT+salt,y/1000*RT+salt*4)*2-1
      }
      let xx = x + pow(n,.5) * xVariation
      if (xx <=1 || xx >= scrSize-1 || y <=1 || y >= scrSize-1) {
        c = 255
      } else {
        c = red(get(int(xx),int(y)))
      }
      let sw = pow(cappedPressure,9)*5
      let pushThrough = map(pow(cappedPressure,5),0,1,c,255)
      let endColor = max(0,map(pushThrough,0,255,(1-min(charcoal,1))*255,255))
      encColor = endColor *.5 + map(noise(xx/305*RT+50,y/200*RT+2),0,1,0,c)*.5

      let pickup = random((255-c))
      charcoal += map(pickup, 0,255, 0,1)
      let nn = noise(x/300*RT+salt*4)
      nn = pow(nn,5)
      charcoal = min(3,charcoal * (1-nn*.05))
      line.push({pressure, n, xx, y, c, sw, pushThrough, endColor, chc: charcoal})
    }
    lines.push(line)

    // move brush hair randomly
    if (random()>.7) {
      x += random(hairPad*2)
    } else {
      x += random(hairPad/2)
    }
  }

  // actually draw the lines

  // charcoal buildup
  for (let line of lines) {
    for (let i=0;i<line.length;i++) {
      let {
        pressure, n, xx, y, c, sw, pushThrough, endColor, chc
      } = line[i]
      let nn = noise(xx/5000+salt*5,y/5000+salt*6)
      nn = max(-1,map(nn,0,1,-20,1))
      let xxx = xx + (sw/3)*nn
      // if (xxx > xx) {
      //   console.log('>')
      // } else if (xxx < xx) {
      //   console.log('<')
      // }
      let yy = y - sw/2
      c = c*.3 + (255-min(chc,.8)*255)*.7
      strokeWeight(sw + noise(y/400)*pressure)
      if (c < 255/2) {
        stroke(RGBl[0]*(c/255),RGBl[1]*(c/255),RGBl[2]*(c/255))
      } else {
        stroke(c)
      }
      point(xxx,yy)
      line.xxx = xxx
    }
  }
  // trough
  for (let line of lines) {
    for ({pressure, n, xx, y, c, sw, pushThrough, endColor, chc} of line) {
      strokeWeight(sw)
      fill(endColor)
      stroke(endColor)
      point(xx,y)
    }
  }
  // specks
  for (let line of lines) {
    for ({pressure, n, xx, y, c, sw, pushThrough, endColor, chc} of line) {
      strokeWeight(sw)
      fill(endColor)
      stroke(endColor)
      point(xx,y)
    }
  }  
}
