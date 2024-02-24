import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Create a cube: we need a geometry to define the shape of the object, and a material to define the appearance of the object.
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x51a60 });
const cube = new THREE.Mesh( geometry, material );

// Add the cube to the scene
scene.add( cube );
camera.position.z = 5;

// render the scene using animationFrame so when the user moves to a different tab, the animation stops (saving processing power) vs using setInterval
// and when the user comes back to the tab, the animation starts again.
function animate() {
	requestAnimationFrame( animate );
    cube.rotation.x += 0.11;
    cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();