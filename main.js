// // import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
// // import { OrbitControl } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
// import THREE from 'https://cdn.skypack.dev/three';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
// import cameraControls from 'https://cdn.skypack.dev/camera-controls';

let load_model, player , treasure, scene, camera, renderer, cube, id, enemy = [], gltf_loader, time = 0;

load_model = (file) => {
	return new Promise((resolve) => {
		return new THREE.GLTFLoader().load(file, resolve);
	});
};

gltf_loader = (file) => {
	return new Promise((resolve) => {
		return new GLTFLoader().load(file, resolve);
	});
}


class Player_gen {
	constructor(position) {
		let promise = load_model("../ship3.glb").then(
			(res) => (this.model = res.scene)
		);
		Promise.all([promise]).then(() => {
			scene.add(this.model);
			this.model.scale.set(1, 1, 1);
			this.model.rotation.y = 270 * (Math.PI / 180);
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
			this.deleted = false;
		});
	}
	updateHitbox()
    {
        this.hitBox = {
            x: this.model.position.x,
            z: this.model.position.z,
            width: this.width,
            depth: this.depth
        }
    }
}

class Enemy_gen{
	constructor(position){
		let promise = gltf_loader("../asian/scene.gltf").then(res => (this.model = res.scene));
		Promise.all([promise]).then(() => {
			scene.add(this.model);
			this.model.scale.set(0.04, 0.04, 0.04);
			this.model.rotation.y = (Math.PI / 180);
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
			this.deleted = false;
		});
	}
}

class Treasure_gen{
	constructor(position){
		let promise = gltf_loader("../assets/treasure.gltf").then(res => (this.model = res.scene));
		Promise.all([promise]).then(() => {
			scene.add(this.model);
			this.model.scale.set(1, 1, 1);
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
			this.deleted = false;
		});
	}
}

function spawnEnemy() {
    x_pos = Math.floor(Math.random() * 20) + -10;
    random_pos = new THREE.Vector3(x_pos , 0 ,-50)
    let new_enemy = new Enemy_gen(random_pos)
    enemy.push(new_enemy)
    console.log('aayo')
}

function init() {
	scene = new THREE.Scene();

	const bgloader = new THREE.TextureLoader();
	const bgtexture = bgloader.load("../horizon1.jpg");
	scene.background = bgtexture;

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
		
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const player_pos = new THREE.Vector3(0, -1.5, -2);
	player = new Player_gen(player_pos);
	scene.add(player);

	const enemy_pos = new THREE.Vector3(-2, -1.5, -4);
	enemy = new Enemy_gen(enemy_pos);
	scene.add(enemy);
	
	const treasure_pos = new THREE.Vector3(2, -1.5, -4);
	treasure = new Treasure_gen(treasure_pos);
	scene.add(treasure);
	
	// back light
	const spotLight1 = new THREE.SpotLight(0xffffff);
	spotLight1.intensity = 1.5;
	spotLight1.position.set(0, 1000, 1000);
	scene.add(spotLight1);

	// right light
	const spotLight2 = new THREE.SpotLight(0xffffff);
	spotLight2.intensity = 1.5;
	spotLight2.position.set(1000, 1000, 0);
	scene.add(spotLight2);

	const spotLight3 = new THREE.SpotLight(0xffffff);
	spotLight3.intensity = 1.5;
	spotLight3.position.set(-1000, 1000, 0);
	scene.add(spotLight3);
}

function animate() {
	time+=1;
	id = requestAnimationFrame(animate);
	renderer.render(scene, camera);
	
}


var keyState = {};    

window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);    

window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);

function gameLoop() {
	if(keyState[65]){ // A pressed
		player.model.position.x -= player.speed;
		player.hitBox.x = player.model.position.x;
		console.log("A pressed");
	}
	if(keyState[87]){ // W pressed
		player.model.position.z -= player.speed;
		player.hitBox.z = player.model.position.z;
		console.log("W pressed");
	}
	if(keyState[68]){ // D pressed
		player.model.position.x += player.speed;
		player.hitBox.x = player.model.position.x;
		console.log("D pressed");
	}
	if(keyState[83]){ // S pressed
		player.model.position.z += player.speed;
		player.hitBox.z = player.model.position.z;
		console.log("S pressed");
	}
	if(keyState[87] && keyState[68]){ // W and D pressed
		player.model.position.x += player.speed;
		player.model.position.z -= player.speed;
		player.hitBox.x = player.model.position.x;
		player.hitBox.z = player.model.position.z;
		console.log("W and D pressed");
	}
	if(keyState[87] && keyState[83] || keyState[68] && keyState[65]){ // W and S pressed
		// do nothing
	}
	if(keyState[83] && keyState[68]){ // S and D pressed
		player.model.position.x += player.speed;
		player.model.position.z += player.speed;
		player.hitBox.x = player.model.position.x;
		player.hitBox.z = player.model.position.z;
		console.log("S and D pressed");
	}
	if(keyState[83] && keyState[65]){ // S and A pressed
		player.model.position.x -= player.speed;
		player.model.position.z += player.speed;
		player.hitBox.x = player.model.position.x;
		player.hitBox.z = player.model.position.z;
		console.log("S and A pressed");
	}
	if(keyState[37]){ // left arrow pressed
		player.model.rotation.y -= player.rotationSpeed;
		console.log("left arrow pressed");
	}
	if(keyState[39]){ // right arrow pressed
		player.model.rotation.y += player.rotationSpeed;
		console.log("right arrow pressed");
	}
	if(keyState[37] && keyState[39]){ // right and left arrow pressed
		// do nothing
	}

    setTimeout(gameLoop, 20);
}    
gameLoop();

init();
animate();

var mySong = document.getElementById("mysong");
var icon = document.getElementById("mus-icon");

icon.onclick = function () {
    if (mySong.paused) {
        mySong.play();
        icon.src = "assets/pause.png";
    } else {
        mySong.pause();
        icon.src = "assets/play.png"
    }
}
function music_sort() {
    mySong.pause();
}