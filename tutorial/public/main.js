import * as THREE from 'three';


// Create a scene: we need a scene to place objects in, a camera to see the scene, and a renderer to render the scene.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();

// setting the size of the renderer
renderer.setSize( window.innerWidth, window.innerHeight );

// adding the renderer to the DOM
document.body.appendChild( renderer.domElement );

// Create a cube: we need a geometry to define the shape of the object, and a material to define the appearance of the object.
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x01bf00 });
const cube = new THREE.Mesh( geometry, material );

// Add the cube to the scene
scene.add( cube );
camera.position.z = 5;

// render the scene using animationFrame so when the user moves to a different tab, the animation stops (saving processing power) vs using setInterval
// and when the user comes back to the tab, the animation starts again.
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();