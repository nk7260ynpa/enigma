/**
 * 3D 轉子元件
 * 3 個可旋轉的圓柱形轉子，顯示當前字母位置
 */

import * as THREE from 'three';
import { createMetalMaterial, createTextTexture } from './materials.js';
import { ALPHABET } from '../enigma/constants.js';

export class Rotors3D {
    /**
     * @param {THREE.Scene} scene - Three.js 場景
     * @param {THREE.Vector3} position - 轉子區域基準位置
     */
    constructor(scene, position) {
        this.group = new THREE.Group();
        this.group.position.copy(position);
        this.rotors = [];         // [左, 中, 右]
        this.interactiveObjects = [];
        this._targetRotations = [0, 0, 0];
        this._currentRotations = [0, 0, 0];

        this._buildRotors();
        scene.add(this.group);
    }

    _buildRotors() {
        const rotorSpacing = 2.0;
        const startX = -(2 * rotorSpacing) / 2;

        for (let i = 0; i < 3; i++) {
            const rotorGroup = new THREE.Group();

            // 轉子外殼
            const shellRadius = 0.8;
            const shellWidth = 1.2;
            const shellGeometry = new THREE.CylinderGeometry(
                shellRadius, shellRadius, shellWidth, 32
            );
            const shellMaterial = createMetalMaterial();
            const shell = new THREE.Mesh(shellGeometry, shellMaterial);
            shell.rotation.z = Math.PI / 2; // 水平放置
            shell.castShadow = true;
            rotorGroup.add(shell);

            // 轉子凹槽紋理（裝飾環）
            for (let j = -2; j <= 2; j++) {
                const grooveGeometry = new THREE.TorusGeometry(
                    shellRadius + 0.01, 0.015, 8, 32
                );
                const grooveMaterial = new THREE.MeshStandardMaterial({
                    color: 0x5a5045,
                    metalness: 0.9,
                    roughness: 0.2,
                });
                const groove = new THREE.Mesh(grooveGeometry, grooveMaterial);
                groove.rotation.y = Math.PI / 2;
                groove.position.x = j * 0.25;
                rotorGroup.add(groove);
            }

            // 字母視窗框
            const windowWidth = 0.6;
            const windowHeight = 0.5;
            const windowFrameGeometry = new THREE.BoxGeometry(
                windowWidth + 0.1, 0.05, windowHeight + 0.1
            );
            const windowFrameMaterial = new THREE.MeshStandardMaterial({
                color: 0x3a3025,
                metalness: 0.6,
                roughness: 0.4,
            });
            const windowFrame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial);
            windowFrame.position.y = shellRadius + 0.02;
            rotorGroup.add(windowFrame);

            // 字母顯示面板（使用 Plane + Canvas Texture）
            const displayGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const displayCanvas = this._createLetterCanvas('A');
            const displayTexture = new THREE.CanvasTexture(displayCanvas);
            const displayMaterial = new THREE.MeshBasicMaterial({
                map: displayTexture,
            });
            const display = new THREE.Mesh(displayGeometry, displayMaterial);
            display.position.y = shellRadius + 0.03;
            display.rotation.x = -Math.PI / 2;
            rotorGroup.add(display);

            // 上下箭頭按鈕
            const arrowUp = this._createArrowButton('▲');
            arrowUp.position.set(0, shellRadius + 0.03, -(windowHeight / 2 + 0.25));
            arrowUp.rotation.x = -Math.PI / 2;
            arrowUp.userData = { type: 'rotor-up', rotorIndex: i };
            rotorGroup.add(arrowUp);
            this.interactiveObjects.push(arrowUp);

            const arrowDown = this._createArrowButton('▼');
            arrowDown.position.set(0, shellRadius + 0.03, (windowHeight / 2 + 0.25));
            arrowDown.rotation.x = -Math.PI / 2;
            arrowDown.userData = { type: 'rotor-down', rotorIndex: i };
            rotorGroup.add(arrowDown);
            this.interactiveObjects.push(arrowDown);

            // 定位
            rotorGroup.position.x = startX + i * rotorSpacing;

            this.group.add(rotorGroup);

            this.rotors.push({
                group: rotorGroup,
                shell,
                display,
                displayTexture,
                displayCanvas,
                displayMaterial,
                currentPosition: 0,
            });
        }
    }

    _createLetterCanvas(letter) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');

        // 背景
        ctx.fillStyle = '#e0d5c1';
        ctx.fillRect(0, 0, 128, 96);

        // 邊框
        ctx.strokeStyle = '#3a3025';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 124, 92);

        // 字母
        ctx.font = 'bold 64px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1a1410';
        ctx.fillText(letter, 64, 48);

        return canvas;
    }

    _createArrowButton(symbol) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#4a4035';
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#c9a84c';
        ctx.fillText(symbol, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
        });
        const geometry = new THREE.PlaneGeometry(0.35, 0.35);
        return new THREE.Mesh(geometry, material);
    }

    /**
     * 更新轉子顯示的字母位置
     * @param {number[]} positions - [左, 中, 右] 位置 (0-25)
     * @param {boolean} animated - 是否使用動畫
     */
    updatePositions(positions, animated = true) {
        positions.forEach((pos, i) => {
            const rotor = this.rotors[i];
            if (rotor.currentPosition === pos) return;

            rotor.currentPosition = pos;
            const letter = ALPHABET[pos];

            if (animated) {
                this._animateRotorChange(rotor, letter);
            } else {
                this._updateDisplay(rotor, letter);
            }
        });
    }

    _animateRotorChange(rotor, letter) {
        const duration = 200;
        const start = performance.now();
        const shell = rotor.shell;
        const startRotation = shell.rotation.x;
        const targetRotation = startRotation + (Math.PI * 2 / 26);

        const animate = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            // 轉子旋轉動畫
            shell.rotation.x = startRotation + (targetRotation - startRotation) * eased;

            if (progress >= 0.5 && !rotor._displayUpdated) {
                rotor._displayUpdated = true;
                this._updateDisplay(rotor, letter);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                rotor._displayUpdated = false;
            }
        };
        requestAnimationFrame(animate);
    }

    _updateDisplay(rotor, letter) {
        const ctx = rotor.displayCanvas.getContext('2d');

        // 清除
        ctx.fillStyle = '#e0d5c1';
        ctx.fillRect(0, 0, 128, 96);

        // 邊框
        ctx.strokeStyle = '#3a3025';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 124, 92);

        // 字母
        ctx.font = 'bold 64px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1a1410';
        ctx.fillText(letter, 64, 48);

        rotor.displayTexture.needsUpdate = true;
    }

    /**
     * 取得可互動的物件陣列
     * @returns {THREE.Mesh[]}
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}
