import './style.css';
import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import CannonDebugger from 'cannon-es-debugger';

/* Variables */
const loader = new GLTFLoader();
const pointsUI = document.querySelector('#pointsUI');
let points = 0;
const startButton = document.querySelector('#startButton');
const timeUI = document.querySelector('#timeUI');
const clock = new THREE.Clock();
let start = false;

// Start the game when the start button is clicked
startButton.addEventListener('click', () => {
  start = true;
  startButton.style.display = 'none';
  clock.start();

  // Start a loop that updates the timeUI every second
  setInterval(() => {
    const elapsedTime = clock.getElapsedTime();
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
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

/* Lights */
const light2 = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light, light2 );
const directionalLight = new THREE.DirectionalLight(0xffffa0, 1 );
directionalLight.position.set(-2,1, -2);
scene.add( directionalLight );



/* Ground */
const ground = new THREE.Mesh(
  new THREE.BoxGeometry( 50, 1, 50 ),
  new THREE.MeshPhongMaterial( { color: 0x00ff00 } )
  ); 

  ground.position.y = -1;
scene.add( ground ); 

/* Player */
let player;
//make the player a astronaut with the gltf loader
  loader.load('Astronaut-2.glb', (gltf) => {
    // Astronaut-2 by Quaternius [CC-BY] via Poly Pizza
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
    gltf.scene.position.set(10, 0, 10);
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
  let enemy;
  loader.load('Spaceship.glb', (gltf) => {
    // Spaceship by Quaternius [CC-BY] via Poly Pizza
    gltf.scene.scale.set(.2, .2, .2);
    gltf.scene.position.set(10, 0, 10);
    enemy = gltf.scene;
  enemy.position.x = (Math.random() - 0.7) * 20;
  enemy.position.z = (Math.random() - 0.7) * 20;
  enemy.name = 'enemy' + i + 1;
  scene.add(enemy);
  enemies.push(enemy);})
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
      enemy.position.x = (Math.random() - 1) * maxX;
    }
  })
}
// function that collects the coins and the player gets smaller
function collectCoins() {
  coins.forEach((coin) => {
    if (player.position.distanceTo(coin.position) < 0.5) {
      scene.remove(coin);
      player.scale.x += 0.01;
      player.scale.y += 0.01;
      player.scale.z += 0.01;
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

//function that detects if the player got hit by an enemy and ends the game
function detectCollision() {
  littleEnemies.forEach((enemy) => {
    if (player.position.distanceTo(enemy.position) < 0.5) {
      alert('Game Over');
      document.location.reload();
    }
  });
  enemies.forEach((enemy) => {
    if (player.position.distanceTo(enemy.position) < 0.5) {
      alert('Game Over');
      document.location.reload();
    }
  });
 
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
  moveEnemies(enemies, 0.2, 25, -25, 25, -25);
  
  detectCollision();
  resetPlayer();
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

