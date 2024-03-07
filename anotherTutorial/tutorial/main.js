import './style.css'
import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import CannonDebugger from 'cannon-es-debugger';

/* Variables */
const loader = new GLTFLoader();
const pointsUI = document.querySelector('#points');
let points = 0;
const startButton = document.querySelector('#startButton');
const timeUI = document.querySelector('#time');
const clock = new THREE.Clock();

// Start the game when the start button is clicked
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  clock.start();

  // Start a loop that updates the timeUI every second
  setInterval(() => {
    const elapsedTime = clock.elapsedTime;
    // Round the elapsed time to the nearest second and update the timeUI
    timeUI.innerHTML = Math.round(elapsedTime);
  }, 1000); // 1000 milliseconds = 1 second
});

/* Physics */
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});
const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z=4.5;
camera.position.y=1.5;

const renderer = new THREE.WebGLRenderer(); 

renderer.setSize( window.innerWidth, window.innerHeight ); 
document.body.appendChild( renderer.domElement ); 

/** orbit controls */
const controls = new OrbitControls(camera, renderer.domElement);

/**Grid Helper */
const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);

/* Lights */
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set(0.5, 1, 1.5);
scene.add( directionalLight );



/* Ground */
const ground = new THREE.Mesh(
  new THREE.BoxGeometry( 30, 1, 30 ),
  new THREE.MeshPhongMaterial( { color: 0x00ff00 } )
  ); 

  ground.position.y = -1;
scene.add( ground ); 

/* Player */
let player;
//make the player a astronaut with the gltf loader
  loader.load('Astronaut.glb', (gltf) => {
//   // Astronaut by Google [CC-BY] via Poly Pizza
    gltf.scene.scale.set(.3, .3, .3);
    gltf.scene.rotation.y = Math.PI;
    gltf.scene.position.set(-1, 0, 0);
    player = gltf.scene;
    scene.add(player);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        player.position.z -= 0.5;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        player.position.z += 0.5;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        player.position.x -= 0.5;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.position.x += 0.5;
      }
      if (e.key === ' ') {
        player.position.y += 0.5;
      } 
      if (e.key === 'c') {
        player.position.y -= 0.5;
      }
      if(e.key ==='r' || e.key === 'R'){
        player.position.x = 0;
        player.position.y = 0;
        player.position.z = 0;
      }
      if(e.key ==='f' || e.key === 'F'){
        shoot();
      }
      if(e.key ==='j' || e.key === 'J'){
        jump();
      }
    })
});



// const player = new THREE.Mesh(
//   new THREE.BoxGeometry( .5, .5, .5 ),
//   new THREE.MeshPhongMaterial( { color: 0xff0000 } )
//   ); 
// scene.add( player); 

// trees
loader.load('tree.glb', (gltf) => {
  // Tree by Poly by Google [CC-BY] via Poly Pizza
  gltf.scene.scale.set(0.01, 0.01, 0.01);
  gltf.scene.position.set(5, 0, 5);
  scene.add(gltf.scene);
});

/* Enemies */
const littleEnemies = []
for (let i = 0; i < 10; i++) {
  let enemy;
  loader.load('Moon.glb', (gltf) => {
    // Moon by Google [CC-BY] via Poly Pizza
    gltf.scene.scale.set(0.21, 0.21, 0.21);
    gltf.scene.position.set(5, 0, 5);
    enemy = gltf.scene;
    enemy.position.x = (Math.random() - 0.5) * 20;
    enemy.position.z = (Math.random() - 0.5) * 20;
    enemy.name = 'enemy' + i + 1;
    scene.add(enemy);
    littleEnemies.push(enemy);}
    )
}

const enemies = [];
for (let i = 0; i < 10; i++) {
  const enemy = new THREE.Mesh(
    new THREE.BoxGeometry( .5, .5, .5 ),
    new THREE.MeshPhongMaterial( { color: 0xf0000 } )
  );
  enemy.position.x = (Math.random() - 0.5) * 20;
  enemy.position.z = (Math.random() - 0.5) * 20;
  enemy.name = 'enemy' + i + 1;
  scene.add(enemy);
  enemies.push(enemy);
}
/* Coins */
const coins = [];
for (let i = 0; i < 20; i++) {
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry( 0.2, 0.2, 0.1, 20 ),
    new THREE.MeshPhongMaterial( { color: 0xffff00 } )
  );
  coin.position.x = (Math.random() - 0.5) * 20;
  coin.position.z = (Math.random() - 0.5) * 20;
  coin.name = 'coin' + i + 1;
  scene.add(coin);
  coins.push(coin);
}
const moveEnemies =(arr, speed, maxX, minX, maxZ, minZ) => {
  arr.forEach((enemy) => {
    enemy.position.z += speed;
    if (enemy.position.z > maxZ) {
      enemy.position.z = minZ;
      enemy.position.x = (Math.random() - 0.5) * maxX;
    }
  })
}
// function that collects the coins and the player gets smaller
function collectCoins() {
  coins.forEach((coin) => {
    if (player.position.distanceTo(coin.position) < 0.5) {
      scene.remove(coin);
      player.speed += 0.1;
    }
  });
}
// function that shoots little circles at the enemies
function shoot() {
  const bullets = [];
  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  bullet.position.set(player.position.x, player.position.y, player.position.z);
  bullet.velocity = new THREE.Vector3(0, 0, -1);
  scene.add(bullet);
  bullets.push(bullet);

  function moveBullets() {
    bullets.forEach((bullet) => {
      bullet.position.add(bullet.velocity);
    });
  }
  function removeBullets() {
    bullets.forEach((bullet) => {
      if (bullet.position.z < -10) {
        scene.remove(bullet);
      }
    });
  }
  function detectCollision() {
    bullets.forEach((bullet) => {
      littleEnemies.forEach((enemy) => {
        if (bullet.position.distanceTo(enemy.position) < 0.5) {
          scene.remove(bullet);
          scene.remove(enemy);
          points += 100;
          pointsUI.innerHTML = points;
        }
      });
      enemies.forEach((enemy) => {
        if (bullet.position.distanceTo(enemy.position) < 0.5) {
          scene.remove(bullet);
          scene.remove(enemy);
          points += 100;
          pointsUI.innerHTML = points;
        }
      });
    });
  }
  function animateBullets() {
    moveBullets();
    removeBullets();
    detectCollision();
  }
  setInterval(animateBullets, 1000 / 60);
}

// function that makes the player jump
function jump() {
  player.position.y += 0.5;
  setTimeout(() => {
    player.position.y -= 0.5;
  }, 100);
}

function animate() { 

  requestAnimationFrame( animate ); 
  collectCoins();
  controls.update();
  moveEnemies(littleEnemies, 0.05, 13, -13, 13, -13);
  moveEnemies(enemies, 0.2, 13, -13, 13, -13);
  
  world.fixedStep();
  renderer.render( scene, camera ); 
} 

animate();

/*
** Event listeners
*/

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

