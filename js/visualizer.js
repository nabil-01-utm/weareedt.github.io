import * as THREE from 'three';

// === Three.js 3D Visualizer Setup ===

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3D Geometry and Material for visualizer
const geometry = new THREE.IcosahedronGeometry(10, 30);
const material = new THREE.ShaderMaterial({
    vertexShader: `
        uniform float u_time;
        uniform float u_frequency;
        varying vec3 vPosition;
        
        void main() {
            vec3 newPosition = position + normal * sin(u_time + u_frequency * 0.1);
            vPosition = newPosition;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        uniform float u_red;
        uniform float u_green;
        uniform float u_blue;
        varying vec3 vPosition;

        void main() {
            gl_FragColor = vec4(vPosition.x * u_red, vPosition.y * u_green, vPosition.z * u_blue, 1.0);
        }
    `,
    uniforms: {
        u_time: { value: 0 },
        u_frequency: { value: 0 },
        u_red: { value: 0.5 },
        u_green: { value: 0.5 },
        u_blue: { value: 1.0 }
    },
    wireframe: true
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 30;

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Audio Setup ===
// Load audio from static folder
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('static/Beats.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();

    // Connect Audio Analyser
    const analyser = new THREE.AudioAnalyser(sound, 256);
    
    // Animate the visualizer
    function animate() {
        requestAnimationFrame(animate);

        const dataArray = analyser.getFrequencyData();
        material.uniforms.u_frequency.value = dataArray[0];  // Use frequency data in visualizer
        material.uniforms.u_time.value += 0.05;  // Time for vertex shader animation

        renderer.render(scene, camera);
    }
    animate();
});
