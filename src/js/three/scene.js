/**
 * Three.js 場景設定
 * 管理場景、相機、光源、渲染器與控制器
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * 建立 3D 場景
 * @param {HTMLElement} container - 容器元素
 * @returns {Object} 場景相關物件
 */
export function createScene(container) {
    // 場景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // 霧效（增加深度感）
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);

    // 相機 - 45 度俯視角
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 16, 14);
    camera.lookAt(0, 0, 0);

    // 渲染器
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 光源
    // 環境光 - 柔和全域照明
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.4);
    scene.add(ambientLight);

    // 主方向光 - 模擬檯燈（從上方前方照射）
    const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
    mainLight.position.set(5, 12, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 30;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    // 補光 - 從左側
    const fillLight = new THREE.DirectionalLight(0xc4b5a0, 0.3);
    fillLight.position.set(-6, 8, 4);
    scene.add(fillLight);

    // 底部反射光
    const bounceLight = new THREE.HemisphereLight(0x3a2a1a, 0x1a1410, 0.2);
    scene.add(bounceLight);

    // 地面
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a18,
        roughness: 0.95,
        metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // 軌道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2.5;
    controls.minPolarAngle = Math.PI / 8;
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();

    // Raycaster（供互動使用）
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // 動畫迴圈
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        controls.update();

        // 觸發自訂更新回呼
        if (animate._callbacks) {
            for (const cb of animate._callbacks) {
                cb(delta);
            }
        }

        renderer.render(scene, camera);
    }

    // 註冊動畫更新回呼
    animate._callbacks = [];
    animate.onUpdate = function(callback) {
        animate._callbacks.push(callback);
    };

    return {
        scene,
        camera,
        renderer,
        controls,
        raycaster,
        pointer,
        animate,
        clock,
    };
}
