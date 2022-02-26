import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Loader, Vector3 } from "three";
// import Stats from "three/examples/jsm/libs/stats.module.js";
// import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'

let container;
let camera, scene, renderer, go_scene;
let controls, water, sun, mesh, enem_count = 8;

let cam = true;

let TICKS = 0;
// let RIGHT_LIMIT = 7
// let LEFT_LIMIT = -7
// let FORWARD_LIMIT = -7
// let BACKWARD_LIMIT = 7
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

let load_model,
  player,
  treasure = [],
  enemies = [],
  gltf_loader,
  time = 0,
  tt = 0,
  stime = 0,
  rand_x,
  rand_z,
  score = 0,
  health = 100,
  canon = [],
  can_shoot = true,
  go = false;

// load_model = (file) => {
// 	return new Promise((resolve) => {
// 		return new THREE.GLTFLoader().load(file, resolve);
// 	});
// };

gltf_loader = (file) => {
  return new Promise((resolve) => {
    return new GLTFLoader().load(file, resolve);
  });
};
``
class Player_gen {
  constructor(position) {
    let promise = gltf_loader("textures/enemy/scene.gltf").then(
      (res) => (this.model = res.scene)
    );
    Promise.all([promise]).then(() => {
      scene.add(this.model);
      this.model.scale.set(0.02, 0.02, 0.02);
      this.model.rotation.y = 90 * (Math.PI / 180);
      this.model.position.set(position.x, position.y, position.z);
      this.width = 0.2;
      this.depth = 0.4;
      this.hitBox = {
        x: this.model.position.x,
        z: this.model.position.z - this.depth / 2,
        width: this.width,
        depth: this.depth,
      };
      this.speed = 0.6;
      this.rotationSpeed = 0.005;
      this.deleted = false;
    });
  }
  updateHitbox() {
    this.hitBox = {
      x: this.model.position.x,
      z: this.model.position.z,
      width: this.width,
      depth: this.depth,
    };
  }
}

class Enemy_gen {
  constructor(position) {
    let promise = gltf_loader("textures/player/scene.gltf").then(
      (res) => (this.model = res.scene)
    );
    Promise.all([promise]).then(() => {
      scene.add(this.model);
      this.model.scale.set(30, 30, 30);
      this.model.rotation.y = 90 * (Math.PI / 180);
      this.model.position.set(position.x, position.y, position.z);
      this.width = 0.2;
      this.depth = 0.4;
      this.hitBox = {
        x: this.model.position.x,
        z: this.model.position.z - this.depth / 2,
        width: this.width,
        depth: this.depth,
      };
      this.speed = 0.009;
      this.rotationSpeed = 0.1;
      this.alive = true;
      this.approachtime = Math.random() * 7000 + 2000;
    });
  }
}

class Treasure_gen {
  constructor(position) {
    let promise = gltf_loader("textures/treasure/scene.gltf").then(
      (res) => (this.model = res.scene)
    );
    Promise.all([promise]).then(() => {
      scene.add(this.model);
      this.model.scale.set(25, 25, 25);
      // this.model.rotation.y = (Math.PI / 180);
      this.model.position.set(position.x, position.y, position.z);
      this.width = 0.2;
      this.depth = 0.4;
      this.hitBox = {
        x: this.model.position.x,
        z: this.model.position.z - this.depth / 2,
        width: this.width,
        depth: this.depth,
      };
      this.speed = 0.009;
      this.rotationSpeed = 0.005;
      this.collected = false;
      this.deleted = false;
    });
  }
}

class Canon_gen {
    constructor(position,angle,type) {
      let promise = gltf_loader("textures/canon/scene.gltf").then(
        (res) => (this.model = res.scene)
      );
      Promise.all([promise]).then(() => {
        scene.add(this.model);
        this.model.scale.set(4, 4, 4);
        this.model.rotation.y = angle
        this.model.position.set(position.x, position.y, position.z);
        this.width = 0.2;
        this.depth = 0.4;
        this.hitBox = {
          x: this.model.position.x,
          z: this.model.position.z - this.depth / 2,
          width: this.width,
          depth: this.depth,
        };
        this.speed = 0.5;
        this.rotationSpeed = 0.005;
        this.deleted = false;
        this.collected = true;
        this.angl = angle;
        this.alive = true
        this.type = type //player canon
        this.approachtime = Math.random() * 7000 + 500;
      });
    }
  }

function init() {
  container = document.getElementById("container");

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  //
  go_scene = new THREE.Scene(); 
  const ldr = new THREE.TextureLoader();
  const bgTexture = ldr.load('textures/go.jpg');
  go_scene.background = bgTexture;
  //
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(10, 50, 100);

  //

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "textures/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
  }

  updateSun();

  //

  const geometry = new THREE.BoxGeometry(30, 30, 30);
  const material = new THREE.MeshStandardMaterial({ roughness: 0 });

  mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 8, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  //

  // stats = new Stats();
  // container.appendChild(stats.dom);
  window.addEventListener("resize", onWindowResize);

  // render player
  player = new Player_gen(new THREE.Vector3(0, -3, 0));
  // scene.add(player);

  // render enemies
  enemies = [];
  for (let i = 0; i < 8; i++) {
    rand_x = Math.floor(Math.random() * 1000 + 1);
    rand_z = Math.floor(Math.random() * 1000 + 1);
    if (rand_x > 500) rand_x -= 1000;
    if (rand_z > 500) rand_z += 500;
    // console.log(rand_x);

    let enem = new Enemy_gen(new THREE.Vector3(rand_x, 8, -rand_z));
    enemies.push(enem);
    // scene.add(enemies[i]);
    // TWEEN.removeAll();
    // TWEEN.Tween(enemies[i].position).to(player.position, 120).start();
  }

  // render treasure
  for(let i = 0; i < 8; i++){
    rand_x = Math.floor(Math.random() * 500 + 1);
    rand_z = Math.floor(Math.random() * 500 + 1);
    if (rand_x > 250) rand_x -= 150;
    if (rand_z > 250) rand_z += 150;
    // console.log(rand_x);

    let tres = new Treasure_gen(new THREE.Vector3(rand_x, -1, -rand_z));
    treasure.push(tres);
  }

  // follow player
  // followplayer();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  time+= 1;
  tt += 0.005;
  stime = Math.floor(tt);
  requestAnimationFrame(animate);
  render();
  // stats.update();
  followplayer(player, enemies);
  if (cam) {
    third_person();
  } else {
    bird_eye();
  }
  detect_collision();
  hit_player();
  move_bullet();
  if(!go){
    document.getElementById("scoreboard").innerHTML = "HEALTH: " + health + " &emsp; SCORE: " + score + " &emsp; TIME: " + stime;
  }
  if(health<=0 || enem_count == 0){
    go = true;
  }
}


function shoot_canon(){
    if(can_shoot){
      can_shoot = false;
      var play_x = player.model.position.x;
      var play_z = player.model.position.z;
      let can = new Canon_gen(new THREE.Vector3(play_x, 8, play_z), player.model.rotation.y, true);
      //scene.add(can)
      // can.type = true;
      canon.push(can);
    }
    if(time % 80 == 0)can_shoot = true;
}

function move_bullet(){
  for(let i = 0; i < canon.length; i++){
    // var angl = player.model.rotation.y;
    var x = Math.sin(canon[i].angl) * 0.5;
    var z = Math.cos(canon[i].angl) * 0.5;
    if(canon[i].model)
    {
      if(canon[i].type){
        canon[i].model.position.z -= z;
        canon[i].model.position.x -= x;
      }
      else{
        // canon[i].model.position.z += z;
        // canon[i].model.position.x += x;
        canon[i].model.translateZ(canon[i].speed)
      }
    }

  }
}

function hit_player(){

  if(time%400==0){
    for(let i = 0;i < 8;i++){
      // var ang = Math.atan(player.model.position.x - enemies[i].model.position.x) / (player.model.position.z - enemies[i].model.position.z);
      
      if(enemies[i].alive){
       let can = new Canon_gen(enemies[i].model.position, enemies[i].model.rotation.y , false);
       canon.push(can);
      }
      // console.log(ang);
    }
  }
}

function third_person() {
  let relativeCameraOffset = new THREE.Vector3(-9500, 5000, 0);
  if (player.model) {
    var cameraOffset = player.model.localToWorld(relativeCameraOffset);
    var offst = new THREE.Vector3(
      cameraOffset.x,
      cameraOffset.y,
      cameraOffset.z
    );
    camera.position.copy(offst);
    camera.lookAt(player.model.position);
  }
}

function bird_eye() {
  let relativeCameraOffset = new THREE.Vector3(0, 30000, 0);
  if (player.model) {
    var cameraOffset = player.model.localToWorld(relativeCameraOffset);
    var offst = new THREE.Vector3(
      cameraOffset.x,
      cameraOffset.y,
      cameraOffset.z
    );
    camera.position.copy(offst);
    camera.lookAt(player.model.position);
  }
}

function detect_collision() {

  if (player.model) { // player and enemy
    for (let i = 0; i < 8; i++) {
  
      if (enemies[i].model && enemies[i].alive) {
        if (
          Math.abs(player.model.position.x - enemies[i].model.position.x) <
            20 &&
          Math.abs(player.model.position.z - enemies[i].model.position.z) < 20
        ) {
            health-=15;
            enemies[i].alive = false;
            scene.remove(enemies[i].model);
            enem_count--;
          // player.model.position.set(0, -3, 0);
          // enemies[i].model.position.set(0, -3, 0);
        }
      }
    }
    for(let i = 0; i < 8; i++){
        if(treasure[i].model && treasure[i].collected == false){
            if(Math.abs(player.model.position.x - treasure[i].model.position.x) <
            20 &&
          Math.abs(player.model.position.z - treasure[i].model.position.z) < 20)
          {
              score+=15;
              treasure[i].collected = true
              scene.remove(treasure[i].model);
            
          }
        }
    }

    for(let j = 0; j < canon.length; j++){

      if(canon[j].model && !canon[j].type && canon[j].alive){

          if(Math.abs(player.model.position.x - canon[j].model.position.x) <
          20 &&
        Math.abs(player.model.position.z - canon[j].model.position.z) < 20)
        {
            // console.log("AYE AYE CAPTAIN");
            // scene.remove(enemies[i].model);
            canon[j].alive = false
            scene.remove(canon[j].model);
            health-= 10;
        }
      }
    }
    for(let i = 0; i < 8; i++){
      for(let j = 0; j < canon.length; j++){
        if(enemies[i].model && canon[j].model && canon[j].type && enemies[i].alive && canon[j].alive){
            if(Math.abs(enemies[i].model.position.x - canon[j].model.position.x) <
            20 &&
          Math.abs(enemies[i].model.position.z - canon[j].model.position.z) < 20)
          {
              score += 15;
              canon[j].alive = false
              enemies[i].alive = false
              scene.remove(enemies[i].model);
              enem_count--;
              scene.remove(canon[j].model);
          }
        }
    }
  }
  }
}


function render() {
  if(!go){
    const time = performance.now() * 0.001;
  
    mesh.position.y = Math.sin(time) * 20 + 5;
    mesh.rotation.x = time * 0.5;
    mesh.rotation.z = time * 0.51;
  
    water.material.uniforms["time"].value += 1.0 / 60.0;
    renderer.render(scene, camera);
  }
  else{
    renderer.render(go_scene,camera);
  }
}

let followplayer = (player, enemies) => {
  if (player.model) {
    // requestAnimationFrame(followplayer);
    for (let i = 0; i < 8; i++) {
      var vel_x =
      2* (player.model.position.x - enemies[i].model.position.x) /
        enemies[i].approachtime;
      var vel_z =
      2* (player.model.position.z - enemies[i].model.position.z) /
        enemies[i].approachtime;
      // console.log(vel_x);
      enemies[i].model.position.x += vel_x;
      enemies[i].model.position.z += vel_z;
      enemies[i].model.lookAt(player.model.position);
      // enemies[i].approachtime -= 1;
    }
  }
};

var keyState = {};

window.addEventListener(
  "keydown",
  function (e) {
    keyState[e.keyCode || e.which] = true;
  },
  true
);

window.addEventListener(
  "keyup",
  function (e) {
    keyState[e.keyCode || e.which] = false;
  },
  true
);

function toggle() {
  if (keyState[69]) { // E pressed, changes camera
    if (cam) {
      cam = false;
    } else {
      cam = true;
    }
  }
  setTimeout(toggle, 200);
}

function gameLoop() {
  if(keyState[32]){ // space pressed, fires bullet
    shoot_canon();
  }
  if (keyState[65]) {
    // A pressed
    player.model.translateZ(-player.speed);
    // player.hitBox.x = player.model.position.x;
    // console.log("A pressed");
  }
  if (keyState[87]) {
    // W pressed
    player.model.translateX(player.speed);
    // console.log("W pressed");
  }
  if (keyState[68]) {
    // D pressed
    player.model.translateZ(player.speed);
    // console.log("D pressed");
  }
  if (keyState[83]) {
    // S pressed
    player.model.translateX(-player.speed);
    // console.log("S pressed");
  }
  if (keyState[87] && keyState[68]) {
    // W and D pressed
    player.model.translateX(player.speed);
    player.model.translateZ(player.speed);
    // console.log("W and D pressed");
  }
  if ((keyState[87] && keyState[83]) || (keyState[68] && keyState[65])) {
    // W and S pressed
    // do nothing
  }
  if (keyState[83] && keyState[68]) {
    // S and D pressed
    player.model.translateX(-player.speed);
    player.model.translateZ(player.speed);
    // console.log("S and D pressed");
  }
  if (keyState[83] && keyState[65]) {
    // S and A pressed
    player.model.translateX(-player.speed);
    player.model.translateZ(-player.speed);
    // console.log("S and A pressed");
  }
  if (keyState[37]) {
    // left arrow pressed
    player.model.rotation.y += player.rotationSpeed;
    // console.log("left arrow pressed");
  }
  if (keyState[39]) {
    // right arrow pressed
    player.model.rotation.y -= player.rotationSpeed;
    // console.log("right arrow pressed");
  }
  if (keyState[37] && keyState[39]) {
    // right and left arrow pressed
    // do nothing
  }
  setTimeout(gameLoop, 2);
}

var mySong = document.getElementById("mysong");
var icon = document.getElementById("mus-icon");

icon.onclick = function () {
    if (mySong.paused) {
        mySong.play();
        icon.src = "textures/pause.png";
    } else {
        mySong.pause();
        icon.src = "textures/play.png"
    }
}

function music_sort() {
    mySong.pause();
}

gameLoop();
toggle();
init();
animate();
