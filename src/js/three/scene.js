/**
 * Three.js 場景設定
 * 管理場景、相機、渲染器與控制器（無光照）
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * 建立 3D 場景
 * @param {HTMLElement} container - 容器元素
 * @returns {Object} 場景相關物件
 */
export function createScene(container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);

    // 相機
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 20, 14);
    camera.lookAt(0, 3, 0);

    // 渲染器（無陰影、無 tone mapping）
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    // 無光源 — 全部使用 MeshBasicMaterial，不需要光照

    // 軌道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 3, 0);
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

        if (animate._callbacks) {
            for (const cb of animate._callbacks) {
                cb(delta);
            }
        }

        renderer.render(scene, camera);
    }

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
