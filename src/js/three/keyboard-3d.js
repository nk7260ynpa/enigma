/**
 * 3D 鍵盤元件
 * 26 個按鍵按 QWERTZ 德式鍵盤排列
 */

import * as THREE from 'three';
import {
    createBakeliteMaterial,
    createBakeliteHighlightMaterial,
    createTextTexture,
} from './materials.js';

/** QWERTZ 德式鍵盤排列 */
const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
    ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export class Keyboard3D {
    /**
     * @param {THREE.Scene} scene - Three.js 場景
     * @param {THREE.Vector3} position - 鍵盤區域的基準位置
     */
    constructor(scene, position) {
        this.group = new THREE.Group();
        this.group.position.copy(position);
        this.keys = {};            // letter → { mesh, group, originalY }
        this.interactiveObjects = []; // 供 raycaster 檢測

        this._buildKeyboard();
        scene.add(this.group);
    }

    _buildKeyboard() {
        const keyRadius = 0.38;
        const keyHeight = 0.25;
        const keySpacingX = 0.95;
        const keySpacingZ = 0.95;
        const keyGeometry = new THREE.CylinderGeometry(
            keyRadius, keyRadius * 0.92, keyHeight, 24
        );

        KEYBOARD_ROWS.forEach((row, rowIndex) => {
            const rowOffset = rowIndex * 0.15; // 每行稍微錯開
            const startX = -(row.length - 1) * keySpacingX / 2 + rowOffset;

            row.forEach((letter, colIndex) => {
                const keyGroup = new THREE.Group();

                // 按鍵本體
                const keyMaterial = createBakeliteMaterial();
                const keyMesh = new THREE.Mesh(keyGeometry, keyMaterial);
                keyMesh.castShadow = true;
                keyMesh.receiveShadow = true;
                keyGroup.add(keyMesh);

                // 按鍵上的字母（使用 Sprite）
                const textTexture = createTextTexture(letter, {
                    fontSize: 80,
                    textColor: '#c9a84c',
                    width: 128,
                    height: 128,
                });
                const textMaterial = new THREE.SpriteMaterial({
                    map: textTexture,
                    transparent: true,
                });
                const textSprite = new THREE.Sprite(textMaterial);
                textSprite.scale.set(0.45, 0.45, 1);
                textSprite.position.y = keyHeight / 2 + 0.01;
                textSprite.renderOrder = 1;
                keyGroup.add(textSprite);

                // 按鍵金屬邊框
                const rimGeometry = new THREE.TorusGeometry(keyRadius, 0.03, 8, 24);
                const rimMaterial = new THREE.MeshStandardMaterial({
                    color: 0x6a5a40,
                    metalness: 0.7,
                    roughness: 0.4,
                });
                const rim = new THREE.Mesh(rimGeometry, rimMaterial);
                rim.rotation.x = -Math.PI / 2;
                rim.position.y = keyHeight / 2;
                keyGroup.add(rim);

                // 定位
                const x = startX + colIndex * keySpacingX;
                const z = rowIndex * keySpacingZ;
                keyGroup.position.set(x, 0, z);

                this.group.add(keyGroup);

                // 儲存參考
                const originalY = 0;
                this.keys[letter] = {
                    mesh: keyMesh,
                    group: keyGroup,
                    material: keyMaterial,
                    originalY,
                    isPressed: false,
                    animationProgress: 0,
                };

                // 標記為可互動（透過 userData）
                keyMesh.userData = { type: 'key', letter };
                this.interactiveObjects.push(keyMesh);
            });
        });
    }

    /**
     * 按下按鍵動畫
     * @param {string} letter - 按下的字母
     */
    pressKey(letter) {
        const key = this.keys[letter];
        if (!key || key.isPressed) return;

        key.isPressed = true;
        key.animationProgress = 0;

        // 按鍵下沉與變色
        key.mesh.material = createBakeliteHighlightMaterial();
        this._animateKeyDown(key);
    }

    /**
     * 釋放按鍵動畫
     * @param {string} letter - 釋放的字母
     */
    releaseKey(letter) {
        const key = this.keys[letter];
        if (!key || !key.isPressed) return;

        key.isPressed = false;
        key.mesh.material = key.material;
        this._animateKeyUp(key);
    }

    _animateKeyDown(key) {
        const targetY = key.originalY - 0.08;
        const duration = 80;
        const start = performance.now();

        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            key.group.position.y = key.originalY + (targetY - key.originalY) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    _animateKeyUp(key) {
        const startY = key.group.position.y;
        const targetY = key.originalY;
        const duration = 120;
        const start = performance.now();

        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            // 彈性緩動
            const eased = 1 - Math.pow(1 - progress, 2) * Math.cos(progress * Math.PI * 0.5);
            key.group.position.y = startY + (targetY - startY) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    /**
     * 取得可互動的物件陣列（供 raycaster 使用）
     * @returns {THREE.Mesh[]}
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}
