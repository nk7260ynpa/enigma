/**
 * 3D 燈板元件
 * 26 個字母燈泡，排列方式與鍵盤相同（QWERTZ）
 */

import * as THREE from 'three';
import {
    createLampOffMaterial,
    createLampOnMaterial,
    createTextTexture,
} from './materials.js';

/** 燈板排列（與鍵盤相同的 QWERTZ 排列） */
const LAMP_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
    ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
];

export class Lampboard3D {
    /**
     * @param {THREE.Scene} scene - Three.js 場景
     * @param {THREE.Vector3} position - 燈板基準位置
     */
    constructor(scene, position) {
        this.group = new THREE.Group();
        this.group.position.copy(position);
        this.lamps = {};          // letter → { mesh, light, offMaterial, onMaterial }
        this._activeLamp = null;  // 當前點亮的燈

        this._buildLampboard();
        scene.add(this.group);
    }

    _buildLampboard() {
        const lampRadius = 0.32;
        const lampHeight = 0.12;
        const spacingX = 0.95;
        const spacingZ = 0.85;

        // 燈泡幾何體
        const lampGeometry = new THREE.CylinderGeometry(
            lampRadius, lampRadius, lampHeight, 24
        );
        // 燈罩幾何體（半球形頂部）
        const domeGeometry = new THREE.SphereGeometry(
            lampRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2
        );

        LAMP_ROWS.forEach((row, rowIndex) => {
            const rowOffset = rowIndex * 0.15;
            const startX = -(row.length - 1) * spacingX / 2 + rowOffset;

            row.forEach((letter, colIndex) => {
                const lampGroup = new THREE.Group();

                // 底座
                const baseMaterial = new THREE.MeshStandardMaterial({
                    color: 0x4a4035,
                    metalness: 0.6,
                    roughness: 0.4,
                });
                const base = new THREE.Mesh(
                    new THREE.CylinderGeometry(lampRadius + 0.04, lampRadius + 0.06, 0.06, 24),
                    baseMaterial
                );
                base.position.y = -lampHeight / 2;
                lampGroup.add(base);

                // 燈泡本體
                const offMaterial = createLampOffMaterial();
                const lampMesh = new THREE.Mesh(lampGeometry, offMaterial);
                lampGroup.add(lampMesh);

                // 半球頂部
                const domeMaterial = offMaterial.clone();
                const dome = new THREE.Mesh(domeGeometry, domeMaterial);
                dome.position.y = lampHeight / 2;
                lampGroup.add(dome);

                // 字母標籤
                const textTexture = createTextTexture(letter, {
                    fontSize: 72,
                    textColor: '#8a7d6b',
                    width: 128,
                    height: 128,
                });
                const textMaterial = new THREE.SpriteMaterial({
                    map: textTexture,
                    transparent: true,
                });
                const textSprite = new THREE.Sprite(textMaterial);
                textSprite.scale.set(0.35, 0.35, 1);
                textSprite.position.y = lampHeight / 2 + 0.15;
                textSprite.renderOrder = 1;
                lampGroup.add(textSprite);

                // 點光源（預設關閉）
                const pointLight = new THREE.PointLight(0xffcc00, 0, 2);
                pointLight.position.y = lampHeight / 2 + 0.1;
                lampGroup.add(pointLight);

                // 定位
                const x = startX + colIndex * spacingX;
                const z = rowIndex * spacingZ;
                lampGroup.position.set(x, 0, z);

                this.group.add(lampGroup);

                // 儲存參考
                this.lamps[letter] = {
                    mesh: lampMesh,
                    dome,
                    domeMaterial,
                    light: pointLight,
                    offMaterial,
                    onMaterial: createLampOnMaterial(),
                    textSprite,
                    textMaterial,
                    group: lampGroup,
                    isLit: false,
                };
            });
        });
    }

    /**
     * 點亮指定字母的燈
     * @param {string} letter - 要點亮的字母
     */
    lightUp(letter) {
        // 先熄滅當前燈
        if (this._activeLamp) {
            this._fadeOut(this._activeLamp);
        }

        const lamp = this.lamps[letter];
        if (!lamp) return;

        this._activeLamp = letter;
        this._fadeIn(lamp);
    }

    /**
     * 熄滅所有燈
     */
    turnOff() {
        if (this._activeLamp) {
            const lamp = this.lamps[this._activeLamp];
            if (lamp) this._fadeOut(lamp);
            this._activeLamp = null;
        }
    }

    _fadeIn(lamp) {
        lamp.isLit = true;
        lamp.mesh.material = lamp.onMaterial;
        lamp.dome.material = lamp.onMaterial.clone();
        lamp.light.intensity = 1.5;

        // 文字變亮
        lamp.textSprite.material.map = createTextTexture(
            this._getLetterFromLamp(lamp), {
                fontSize: 72,
                textColor: '#ffdd44',
                width: 128,
                height: 128,
            }
        );

        // 淡入動畫
        const duration = 100;
        const start = performance.now();
        const animate = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            lamp.light.intensity = progress * 1.5;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    _fadeOut(lamp) {
        if (typeof lamp === 'string') {
            lamp = this.lamps[lamp];
        }
        if (!lamp || !lamp.isLit) return;

        lamp.isLit = false;

        const duration = 150;
        const startIntensity = lamp.light.intensity;
        const start = performance.now();

        const animate = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            lamp.light.intensity = startIntensity * (1 - progress);

            if (progress >= 1) {
                lamp.mesh.material = lamp.offMaterial;
                lamp.dome.material = lamp.domeMaterial;
                lamp.light.intensity = 0;

                // 文字恢復
                lamp.textSprite.material.map = createTextTexture(
                    this._getLetterFromLamp(lamp), {
                        fontSize: 72,
                        textColor: '#8a7d6b',
                        width: 128,
                        height: 128,
                    }
                );
            } else {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    _getLetterFromLamp(lamp) {
        for (const [letter, l] of Object.entries(this.lamps)) {
            if (l === lamp) return letter;
        }
        return '';
    }
}
