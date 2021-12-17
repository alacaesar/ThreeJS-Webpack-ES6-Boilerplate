import TWEEN from '@tweenjs/tween.js';

// This object contains the state of the app
export default {
  isDev: false,
  isShowingStats: false,
  isLoaded: false,
  isTweening: false,
  isRotating: false,
  isMouseMoving: false,
  isMouseOver: false,
  maxAnisotropy: 1,
  dpr: 1,
  easing: TWEEN.Easing.Quadratic.InOut,
  duration: 500,
  model: {
    selected: 0,
    initialTypes: ['gltf', 'box', 'object'],
    type: 'gltf'
  },
  models: [
    {
      path: './assets/models/BoxAnimated.gltf',
      scale: 20,
      type: 'gltf'
    },
    {
      path: './assets/models/duck.gltf',
      scale: 20,
      type: 'box'
    },
    {
      path: './assets/models/Teapot.json',
      scale: 20,
      type: 'object'
    }
  ],
  texture: {
    path: './assets/textures/',
    imageFiles: [
      { name: 'UV', image: 'UV_Grid_Sm.jpg' }
    ]
  },
  mesh: {
    enableHelper: false,
    wireframe: false,
    translucent: false,
    material: {
      color: 0xffffff,
      emissive: 0xffffff
    }
  },
  colors:{
    current: {r:79, g:161, b:216},
    day: {r:79, g:161, b:216},
    night: {r:21, g:17, b:31}
  },
  fog: {
    color: 0x003DB2,
    near: 0.002
  },
  fog2: {
    color: 0x002B7E,
    near: 0.004
  },
  camera: {
    fov: 45,
    near: 1,
    far: 3000,
    aspect: 1,
    posX: 0,
    posY: 0,
    posZ: 300
  },
  platformCamera:{
    posX: 0,
    posY: 0,
    posZ: 60
  },
  controls: {
    autoRotate: false,
    autoRotateSpeed: -0.5,
    rotateSpeed: 0.5,
    zoomSpeed: 0.8,
    minDistance: 160,
    maxDistance: 400,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: true,
    dampingFactor: 0.5,
    enableZoom: true,
    target: {
      x: 0,
      y: 0,
      z: 0
    }
  },
  ambientLight: {
    enabled: true,
    color: 0x333333
  },
  directionalLight: {
    enabled: true,
    color: 0xf0f0f0,
    intensity: 0.4,
    x: -75,
    y: 180,
    z: 150
  },
  shadow: {
    enabled: true,
    helperEnabled: false,
    bias: 0,
    mapWidth: 2048,
    mapHeight: 2048,
    near: 250,
    far: 400,
    top: 100,
    right: 100,
    bottom: -100,
    left: -100
  },
  pointLight: {
    enabled: true,
    color: 0xffffff,
    intensity: 0.34,
    distance: 115,
    x: 0,
    y: 0,
    z: 0
  },
  hemiLight: {
    enabled: true,
    color: 0xc8c8c8,
    groundColor: 0xffffff,
    intensity: 0.55,
    x: 0,
    y: 0,
    z: 0
  }
};
