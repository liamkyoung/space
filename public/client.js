import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js'
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer, stars, starGeo, c_ring, l_ring, r_ring, mouse, raycaster
let clicked = false
let complete = false
const STAR_COUNT = 9000

init()

function init () {
  // Set Camera and Position
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
  // Camera Position--Also pointing in Z axis.
  camera.position.set(0, 1, 0)
  // camera.position.y = 2

  mouse = new THREE.Vector2()
  raycaster = new THREE.Raycaster()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x141414)
  // scene.fog = new THREE.Fog(0x00ff00, 0, 750)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Create Point Material
  const sprite = new THREE.TextureLoader().load('star.png')
  console.log(sprite)
  let starMaterial = new THREE.PointsMaterial({
    size: 0.7,
    map: sprite
  })

  // Lights
  const color = 0xFFFFFF
  const s_color = 0x26C3F4
  const intensity = 1
  const light = new THREE.DirectionalLight(color, intensity)
  const s_light = new THREE.DirectionalLight(color, intensity / 2)
  light.position.set(1, 1, 1)
  s_light.position.set(0, 0, -9)
  scene.add(light)
  scene.add(s_light)
  scene.add(light.target)
  scene.add(s_light.target)

  // Initialize Stars, setting Velocity and Acceleration
  starGeo = createStars(2, 0)
  loadModel()

  const loader = new GLTFLoader()

  // Main Ring
  loader.load('./assets/models/ring.glb', function (model) {
    console.log('Added center model to scene.', model.scene.children[2])
    c_ring = model.scene.children[2]
    c_ring.rotateZ(Math.PI / 2)
    // c_ring.rotateY(-20)
    c_ring.rotateX(Math.PI / 10)
    c_ring.position.setX(0)
    c_ring.position.setZ(-10)
    c_ring.material.transparent = true
    c_ring.material.opacity = 0
    scene.add(c_ring)
  })

  // Left Ring
  loader.load('./assets/models/ring.glb', function (model) {
    console.log('Added model to scene.', model.scene.children[2])
    l_ring = model.scene.children[2]
    // l_ring.children[1].position.setXYZ(0, 1, 0)
    l_ring.rotateZ(Math.PI / 2)
    // l_ring.rotateX(Math.PI / 6)
    l_ring.material.transparent = true
    l_ring.material.opacity = 0
    l_ring.position.setX(-10)
    l_ring.position.setY(-1)
    l_ring.position.setZ(-15)
    scene.add(l_ring)
  })

  // Right Ring
  loader.load('./assets/models/ring.glb', function (model) {
    console.log('Added model to scene.', model.scene.children[2])
    r_ring = model.scene.children[2]
    r_ring.rotateX(0)
    r_ring.rotateZ(Math.PI / 2)
    r_ring.rotateX(Math.PI / 10)
    r_ring.material.transparent = true
    r_ring.material.opacity = 0
    r_ring.position.setX(10)
    r_ring.position.setY(-1)
    r_ring.position.setZ(-15)
    scene.add(r_ring)
  })

  stars = new THREE.Points(starGeo, starMaterial)
  scene.add(stars)
  console.log('scene', scene)

  window.addEventListener('resize', onWindowResize, false)
  window.addEventListener('mousemove', onMouseMove, false)

  // Add event listener to transition and add the rings
  window.addEventListener('click', onWindowClick, false)

  animation()
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animation () {
  // Change velocity by acceleration amount for each star
  // Then, change position by velocity amount

  // Sets star animation, changes velocity of stars by acceleration.
  starSpeed(0.1)
  if (c_ring !== undefined) {
    // c_ring.rotateZ(0.0002)
    c_ring.rotateY(0.005)
    // c_ring.rotateX(-0.0002)
  }

  if (l_ring !== undefined) {
    l_ring.rotateX(-0.002)
    l_ring.rotateY(0.006)
  }

  if (r_ring !== undefined) {
    r_ring.rotateY(-0.005)
    r_ring.rotateX(0.003)
  }

  if (clicked) {
    if (changeOpacity(0.005, c_ring) && changeOpacity(0.005, l_ring) && changeOpacity(0.005, r_ring)) {
      complete = true
    }
  }

  resetRings()
  hoverRing()
  renderer.render(scene, camera)
  requestAnimationFrame(animation)
}

function createStars (vel, accel) {
  const starGeo = new THREE.BufferGeometry()
  console.log(starGeo)
  const positions = []
  const velocity = []
  const acceleration = []

  // Giving stars random positions (-300, 300)
  for (let i = 0; i < STAR_COUNT; i++) {
    positions.push(
      Math.random() * -600 + 300,
      Math.random() * -600 + 300,
      Math.random() * -600 + 300
    )
    velocity.push(vel)
    acceleration.push(accel)

    // Setting Attributes of POS, VEL, ACCEL
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    starGeo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocity, 1))
    starGeo.setAttribute('acceleration', new THREE.Float32BufferAttribute(acceleration, 1))
  }

  return starGeo
}

function starSpeed (speedLimit) {
  for (let i = 0; i < starGeo.attributes.velocity.count; i++) {
    if (starGeo.attributes.velocity.array[i] > speedLimit) {
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
  const acceleration = []

  for (let i = 0; i < stars; i++) {
    acceleration.push(value)
  }
  starGeo.setAttribute('acceleration', new THREE.Float32BufferAttribute(acceleration, 1))
}

function loadModel () {
  console.log('Loading...')
}

function onMouseMove (event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function hoverRing () {
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  for (let i = 0; i < intersects.length; i++) {
    if (!(intersects[i].object instanceof THREE.Points) && complete) {
      console.log('object intersected', intersects)
      intersects[i].object.material.transparent = true
      intersects[i].object.material.opacity = 0.1
    }
  }
}

function resetRings () {
  // console.log("children", scene.children)
  if (clicked) {
    if (c_ring.material.opacity <= 1) {
      changeOpacity(0.01, c_ring)
    }

    if (l_ring.material.opacity <= 1) {
      changeOpacity(0.01, l_ring)
    }

    if (r_ring.material.opacity <= 1) {
      changeOpacity(0.01, r_ring)
    }
  }
}

function changeOpacity (value, ring) {
  if (ring.material.opacity < 1) {
    ring.material.opacity += value
    return false
  }
  return true
}

function onWindowClick (event) {
  console.log('click')
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  if (intersects.length > 0) {
    for (let i = 0; i < intersects.length; i++) {
      if (!(intersects[i].object instanceof THREE.Points)) {
        console.log('Clicked the object!', intersects[i].object)
      } else {
        changeAcceleration(STAR_COUNT, -0.01)
        clicked = true
      }
    }
  } else {
    changeAcceleration(STAR_COUNT, -0.01)
    clicked = true
  }
}
