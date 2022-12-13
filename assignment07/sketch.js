// example adapted from:  https://learn.ml5js.org/#/

// our video capture object
let capture;

// our ml5 detector
let poseNet;

// an array of poses that get detected (human body features & their locations)
let poses = [];

// flag indicating that the model is ready to go
let readyToGo = false;

// objective
let coinX, coinY;
let cow, cowImage;
let milkBottles = [];
let milkImage;
let dungs = [];
let dungImage;
let bucketX, bucketY;
let milkCount = 0;
let dungCount = 0;


let bucket, bucketImage;

function preload() {
  bucketImage = loadImage('images/bucket.png');
  cowImage = loadImage('images/cow.png');
  milkImage = loadImage('images/milk.png');
  dungImage = loadImage('images/poop.png');
}

function setup() {
  createCanvas(640, 480);

  // create our capture object
  capture = createCapture(VIDEO);
  capture.size(width, height);


  // set up ml5 to look for human body features in the capture object
  // call the 'modelReady' function when the model has been loaded and is ready to go
  poseNet = ml5.poseNet(capture, modelReady);

  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Hide the video element, and just show the canvas (we will draw the video to the canvas ourselves)
  capture.hide();

  // pick a random spot for our coin
  pickRandomCoinLocation();
  cow = new Cow(cowImage);

  for (let i = 0; i < 30; i++){
    milkBottles.push(new Milk(milkImage, random(cow.x, cow.x + cow.width), random(-2000,-50)));
    dungs.push(new Dung(dungImage, random(cow.x, cow.x + cow.width), random(-2000,-50)));
  }


}

function modelReady() {
  console.log("Poses ready!");
  readyToGo = true;

}

function draw() {
  background(0);

  // We can call both functions to draw all keypoints and the skeletons
  if (readyToGo) {
    image(capture, 0, 0, width, height);

    fill(255,255,0);
    //ellipse(coinX, coinY, 50, 50);


    //console.log(cow.x);

    // figure out where the user's nose is
    if (poses.length > 0 && poses[0].pose.nose) {
      let noseX = poses[0].pose.nose.x;
      let noseY = poses[0].pose.nose.y;
      bucketX = noseX;
      bucketY = noseY;

      fill(255,0,0)
      image(bucketImage, noseX-(bucketImage.width/2), noseY-(bucketImage.height/2), bucketImage.width, bucketImage.height);

      for (let i = 0; i < milkBottles.length; i++){
        milkBottles[i].isTouching();
        milkBottles[i].display();
        milkBottles[i].move();
      }

      for (let i = 0; i < dungs.length; i++){
        dungs[i].isTouching();
        dungs[i].display();
        dungs[i].move();
      }

      cow.display();
      cow.move();

      if (dist(noseX, noseY, coinX, coinY) < 25) {
        pickRandomCoinLocation();
      }
    }
    noStroke();
    fill(255);
    rect(0,0,100,30);
    rect(550,0,100,30);
    fill(0);
    textSize(10);
    text("Milk Count:" + milkCount, 10, 20);
    text("Dung Count:" + dungCount, 600, 20);




  }
  else {
    textSize(50);
    textAlign(CENTER);
    fill(255);
    text("Model Loading", width/2, height/2);
  }
}

// debug: click the mouse to see all poseNet properties
function mousePressed() {
  // iterate over all pose properties and give us a readout of where these features can be found
  if (poses.length > 0) {
    for (let property in poses[0].pose) {
      if (poses[0].pose[property].x) {
        console.log(`${property} ${poses[0].pose[property].x} ${poses[0].pose[property].y}`)
      }
    }
  }
}

function pickRandomCoinLocation() {
  coinX = random(30, width-30);
  coinY = random(30, height-30);
}

class Cow{
    constructor(picture){
        this.picture = picture;
        this.width = this.picture.width
        this.height = this.picture.height
        this.x = 10;
        this.y = 0;
        this.speed = 1;

    }
    display(){
        image(this.picture, this.x, this.y, this.width, this.height);


    }
    move(){
        if (this.x >= 450){
            this.speed *= -1;
        }
        if (this.x <= 0){
            this.speed *= -1;
        }

        this.x += this.speed;


    }

}

class Milk{
    constructor(picture, x, y){
        this.x = x;
        this.y = y;
        this.picture = picture;
        this.collected = false;
        this.speed = 1;
        this.noiseLocation = random(0,1000);
        this.width = this.picture.width;
        this.height = this.picture.height;

    }
    display(){
        if (this.y >= cow.y + (cow.height)/2){
            image(this.picture, this.x, this.y, this.width, this.height);
        }



    }
    move(){
        if (this.y >= 500){
            this.y = random(-2000,-100);
        }
        if (this.y >= 5 && this. y <= 10){
            this.x = random(cow.x+(cow.width/2), (cow.x + cow.width*2/3));
        }
        if (this.y >= cow.y + cow.height){
            let moveAmount = map(noise(this.noiseLocation), 0, 1, -2, 2);
            this.x += moveAmount;
            this.noiseLocation += 0.01;
            this.x = constrain(this.x, 40, 600);
        }
        this.y += this.speed;
    }
    isTouching(){
        if (dist(this.x + this.width/2, this.y + this.height/2, bucketX, bucketY) <= 20){


            milkCount += 1;
            this.y = random(-1000,-100);

        }
    }

}

class Dung{
    constructor(picture, x, y){
        this.x = x;
        this.y = y;
        this.picture = picture;
        this.collected = false;
        this.speed = 1;
        this.noiseLocation = random(0,1000);
        this.width = this.picture.width;
        this.height = this.picture.height;

    }
    display(){
        if (this.y >= cow.y + (cow.height)/2){
            image(this.picture, this.x, this.y, this.width, this.height);
        }



    }
    move(){
        if (this.y >= 500){
            this.y = random(-2000,-100);
        }
        if (this.y >= 5 && this. y <= 10){
            this.x = random(cow.x+(cow.width/2), (cow.x + cow.width*2/3));
        }
        if (this.y >= cow.y + cow.height){
            let moveAmount = map(noise(this.noiseLocation), 0, 1, -2, 2);
            this.x += moveAmount;
            this.noiseLocation += 0.01;
            this.x = constrain(this.x, 40, 600);
        }
        this.y += this.speed;
    }
    isTouching(){
        if (dist(this.x + this.width/2, this.y + this.height/2, bucketX, bucketY) <= 20){


            dungCount += 1;
            this.y = random(-1000,-100);

        }
    }

}
