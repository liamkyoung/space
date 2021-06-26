import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js'
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer, stars, starGeo, c_ring, l_ring, r_ring
let speed

init();

function init () {
  // Set Camera and Position
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.z = 1
  camera.position.y = 2

  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Create Point Material
  let sprite = new THREE.TextureLoader().load('./star.png')
  let starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    map: sprite
  })

  // Lights
  const color = 0xFFFFFF
  const s_color = 0x26C3F4
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity)
  const s_light = new THREE.DirectionalLight(color, intensity / 2)
  light.position.set(1, 1, 1)
  s_light.position.set(0, 0, -9)
  scene.add(light)
  scene.add(s_light)
  scene.add(light.target)
  scene.add(s_light.target)

  starGeo = createStars(0.001)
  loadModel()

  const loader = new GLTFLoader()

  // Main Ring
  loader.load('./assets/models/ring.glb', function(model) {
    console.log('Added model to scene.', model.scene)
    c_ring = model.scene
    c_ring.position.setX(0)
    c_ring.position.setZ(-5)
    scene.add(c_ring)
  })

  // Left Ring
  loader.load('./assets/models/ring.glb', function(model) {
    console.log('Added model to scene.', model.scene)
    l_ring = model.scene
    l_ring.position.setX(-8)
    l_ring.position.setY(-1)
    l_ring.position.setZ(-9)
    scene.add(l_ring)
  })

  // Right Ring
  loader.load('./assets/models/ring.glb', function(model) {
    console.log('Added model to scene.', model.scene)
    r_ring = model.scene
    r_ring.position.setX(8)
    r_ring.position.setY(-1)
    r_ring.position.setZ(-9)
    scene.add(r_ring)
  })

  stars = new THREE.Points(starGeo, starMaterial)
  scene.add(stars)
  console.log('scene', scene)

  window.addEventListener('resize', onWindowResize, false)

  // Add event listener to transition and add the rings
  window.addEventListener('click',  () => changeAcceleration(starGeo), false)

  animation()
  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animation () {
  // Change velocity by acceleration amount for each star
  // Then, change position by velocity amount

  // Sets star animation, changes velocity of stars by acceleration.
  
  starSpeed()
  if (c_ring != undefined) {
    c_ring.rotateY(0.005)
  }

  if (l_ring != undefined) {
    l_ring.rotateY(-0.005)
  }

  if (r_ring != undefined) {
    r_ring.rotateY(-0.005)
  }
  

  renderer.render(scene, camera)
  requestAnimationFrame(animation)
}

function createStars (accel) {
  let starGeo = new THREE.BufferGeometry()
  console.log(starGeo)
  let positions = []
  let velocity = []
  let acceleration = []
  
  // Giving stars random positions (-300, 300)
  for (let i = 0; i < 6000; i++) {
	  positions.push(
	    Math.random() * -600  + 300,
	    Math.random() * -600  + 300,
	    Math.random() * -600  + 300
	  )
    velocity.push(0)
    acceleration.push(accel)

  // Setting Attributes of POS, VEL, ACCEL
	starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  starGeo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocity, 1))
  starGeo.setAttribute('acceleration',  new THREE.Float32BufferAttribute(acceleration, 1))

  }

  return starGeo
}


function starSpeed () {
  for (let i = 0; i < starGeo.attributes.velocity.count; i++) {
    if (starGeo.attributes.velocity.array[i] < 0.5) {
      // console.log('vel', starGeo.attributes.velocity.array[i])
      starGeo.attributes.velocity.array[i] += starGeo.attributes.acceleration.array[i]
    }
    
    let vel = starGeo.attributes.velocity.array[i]
    let z = starGeo.attributes.position.getZ(i)
    // console.log(z)
    
    if (z >= 200) {
      starGeo.attributes.position.setXYZ(i, Math.random() * -600 + 300, Math.random() * -600 + 300, Math.random() * -500 - 100)
    } else {
      starGeo.attributes.position.setZ(i, z + vel)
    }
  }

  starGeo.attributes.position.needsUpdate = true
}

function changeAcceleration (stars, value) {
  let acceleration = []

  for (let i = 0; i < 6000; i++) {
    acceleration.push(value)
  }




}

function loadModel () {
  console.log('Loading...')
 
}