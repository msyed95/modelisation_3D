import * as THREE from '../../../../tree/main/build/three.module.js';
import { OrbitControls } from '../../jsm/controls/OrbitControls.js';
import Stats from '../../jsm/libs/stats.module.js';

// all tools are exported from the "all" file 
import { gsap, ScrollTrigger, Draggable, MotionPathPlugin } from "../../gsap/all.js";
import Flip from "../../gsap/Flip.js";

// To register plugins
gsap.registerPlugin(ScrollTrigger, Draggable, Flip, MotionPathPlugin); 

// global variables
let scene;
let camera;
let renderer;
const canvas = document.querySelector('.webgl');

// scene setup
scene = new THREE.Scene();

// camera setup
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;
scene.add(camera);

// renderer setup
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
renderer.autoClear = true;
renderer.setClearColor(0x000000, 0.0);

// orbit control setup
const controls = new OrbitControls(camera, renderer.domElement);

// earth geometry
const earthGeometry = new THREE.SphereGeometry(0.6, 32, 32);

// earth material
const earthMaterial = new THREE.MeshPhongMaterial({
    roughness: 1,
    metalness: 0,
    map: THREE.ImageUtils.loadTexture('texture/earthmap1k.jpg'),
    bumpMap: THREE.ImageUtils.loadTexture('texture/earthbump.jpg'),
    bumpScale: 0.3
});

// earth mesh
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earthMesh);

// cloud Geometry
const cloudGeometry = new THREE.SphereGeometry(0.63, 32, 32);

// cloud metarial
const cloudMetarial = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('texture/earthCloud.png'),
    transparent: true,
});

// cloud mesh
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMetarial);
scene.add(cloudMesh);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64);

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
    map : THREE.ImageUtils.loadTexture('texture/galaxy.png'),
    side: THREE.BackSide
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);

// ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientlight);

// point light
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(5, 3, 5);
scene.add(pointLight);

// point light helper
const Helper = new THREE.PointLightHelper(pointLight);
scene.add(Helper);

// handling resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

// current fps
const stats = Stats();
document.body.appendChild(stats.dom);

// spinning animation
const animate = () => {
    requestAnimationFrame(animate);
    starMesh.rotation.y -= -0.002;
    earthMesh.rotation.y -= -0.0015;
    cloudMesh.rotation.y -= -0.001;
    controls.update();
    render();
    stats.update();
};



// rendering
const render = () => {
    renderer.render(scene, camera);
}

animate();


const degreesToRadians = (degrees) => {
	return degrees * (Math.PI / 180)
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Helpers
const center = (group) => {
	new THREE.Box3().setFromObject(group).getCenter( group.position ).multiplyScalar(-1)
	scene.add(group)
}

const random = (min, max, float = false) => {
  const val = Math.random() * (max - min) + min

  if (float) {
    return val
  }

  return Math.floor(val)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
})

// Material
const material = new THREE.MeshLambertMaterial({ color: 0xffffff })

// Lighting
const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.5)
scene.add(lightAmbient)

const lightDirectional = new THREE.DirectionalLight(0xffffff, 0.8)
scene.add(lightDirectional)

// Move the light source towards us
lightDirectional.position.set(5, 5, 5)

// Figure
class Figure {
	constructor(params) {
		this.params = {
			x: 0.82,
			y: 0.82,
			z: 0.82,
			ry: 0.82,
			...params
		}
		
		// Create group and add to scene
		this.group = new THREE.Group()
		scene.add(this.group)
		
		// Position according to params
		this.group.position.x = this.params.x
		this.group.position.y = this.params.y
		this.group.position.z = this.params.z
		this.group.rotation.y = this.params.ry
		this.group.scale.set(0.2, 0.2, 0.2)
		
		// Material
		this.headHue = random(0, 360)
		this.bodyHue = random(0, 360)
		this.headLightness = random(40, 65)
		this.headMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.headHue}, 30%, ${this.headLightness}%)` })
		this.bodyMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` })
		
		this.arms = []
	}
	
	createBody() {
		this.body = new THREE.Group()
		const geometry = new THREE.BoxGeometry(1, 1.5, 1)
		const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial)
		
		this.body.add(bodyMain)
		this.group.add(this.body)
		
		this.createLegs()
	}
	
	createHead() {
		// Create a new group for the head
		this.head = new THREE.Group()
		
		// Create the main cube of the head and add to the group
		const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4)
		const headMain = new THREE.Mesh(geometry, this.headMaterial)
		this.head.add(headMain)
		
		// Add the head group to the figure
		this.group.add(this.head)
		
		// Position the head group
		this.head.position.y = 1.65
		
		// Add the eyes
		this.createEyes()
	}
	
	createArms() {
		const height = 0.85
		
		for(let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group()
			const geometry = new THREE.BoxGeometry(0.25, height, 0.25)
			const arm = new THREE.Mesh(geometry, this.headMaterial)
			const m = i % 2 === 0 ? 1 : -1
			
			// Add arm to group
			armGroup.add(arm)
			
			// Add group to figure
			this.body.add(armGroup)
			
			// Translate the arm by half the height
			arm.position.y = height * -0.5
			
			// Position the arm relative to the figure
			armGroup.position.x = m * 0.8
			armGroup.position.y = 0.6
			
			// Rotate the arm
			armGroup.rotation.z = degreesToRadians(30 * m)
			
			// Push to the array
			this.arms.push(armGroup)
		}
	}
	
	createEyes() {
		const eyes = new THREE.Group()
		const geometry = new THREE.SphereGeometry(0.15, 12, 8)
		const material = new THREE.MeshLambertMaterial({ color: 0x44445c })
		
		for(let i = 0; i < 2; i++) {
			const eye = new THREE.Mesh(geometry, material)
			const m = i % 2 === 0 ? 1 : -1
			
			eyes.add(eye)
			eye.position.x = 0.36 * m
		}
		
		this.head.add(eyes)
		
		eyes.position.y = -0.1
		eyes.position.z = 0.7
	}
	
	createLegs() {
		const legs = new THREE.Group()
		const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25)
		
		for(let i = 0; i < 2; i++) {
			const leg = new THREE.Mesh(geometry, this.headMaterial)
			const m = i % 2 === 0 ? 1 : -1
			
			legs.add(leg)
			leg.position.x = m * 0.22
		}
		
		this.group.add(legs)
		legs.position.y = -1.15
		
		this.body.add(legs)
	}
	
	bounce() {
		this.group.rotation.y = this.params.ry
		this.group.position.y = this.params.y
		this.arms.forEach((arm, index) => {
			const m = index % 2 === 0 ? 1 : -1
			arm.rotation.z = this.params.armRotation * m
		})
	}
	
	init() {
		this.createBody()
		this.createHead()
		this.createArms()
	}
}

const figure = new Figure()
figure.init()

gsap.set(figure.params, {
	y: -1.5
})

gsap.to(figure.params, {
	ry: degreesToRadians(360),
	repeat: -1,
	duration: 40
})

gsap.to(figure.params, {
	y: 0,
	armRotation: degreesToRadians(90),
	repeat: -1,
	yoyo: true,
	duration: 10
})

gsap.ticker.add(() => {
	figure.bounce()
	render()
})
