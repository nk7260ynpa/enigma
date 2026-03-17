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
        this.lamps = {};          // letter → { mesh, offMaterial, onMaterial, textSprite }
        this._activeLamp = null;

        this._buildLampboard();
        scene.add(this.group);
    }

    _buildLampboard() {
        const lampRadius = 0.32;
        const lampHeight = 0.15;
        const spacingX = 0.95;
        const spacingZ = 0.85;

        const lampGeometry = new THREE.CylinderGeometry(
            lampRadius, lampRadius, lampHeight, 24
        );

        LAMP_ROWS.forEach((row, rowIndex) => {
            const rowOffset = rowIndex * 0.15;
            const startX = -(row.length - 1) * spacingX / 2 + rowOffset;

            row.forEach((letter, colIndex) => {
                const lampGroup = new THREE.Group();

                // 燈泡（單一圓柱）
                const offMaterial = createLampOffMaterial();
                const lampMesh = new THREE.Mesh(lampGeometry, offMaterial);
                lampGroup.add(lampMesh);

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
                    depthTest: false,
                });
                const textSprite = new THREE.Sprite(textMaterial);
                textSprite.scale.set(0.35, 0.35, 1);
                textSprite.position.y = lampHeight / 2 + 0.1;
                textSprite.renderOrder = 10;
                lampGroup.add(textSprite);

                // 定位
                const x = startX + colIndex * spacingX;
                const z = rowIndex * spacingZ;
                lampGroup.position.set(x, 0, z);

                this.group.add(lampGroup);

                this.lamps[letter] = {
                    mesh: lampMesh,
                    offMaterial,
                    onMaterial: createLampOnMaterial(),
                    textSprite,
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
        if (this._activeLamp) {
            this._turnOffLamp(this.lamps[this._activeLamp]);
        }

        const lamp = this.lamps[letter];
        if (!lamp) return;

        this._activeLamp = letter;
        lamp.isLit = true;
        lamp.mesh.material = lamp.onMaterial;

        lamp.textSprite.material.map = createTextTexture(letter, {
            fontSize: 72,
            textColor: '#ffdd44',
            width: 128,
            height: 128,
        });
    }

    /**
     * 熄滅所有燈
     */
    turnOff() {
        if (this._activeLamp) {
            this._turnOffLamp(this.lamps[this._activeLamp]);
            this._activeLamp = null;
        }
    }

    _turnOffLamp(lamp) {
        if (!lamp || !lamp.isLit) return;
        lamp.isLit = false;
        lamp.mesh.material = lamp.offMaterial;

        const letter = this._getLetterFromLamp(lamp);
        lamp.textSprite.material.map = createTextTexture(letter, {
            fontSize: 72,
            textColor: '#8a7d6b',
            width: 128,
            height: 128,
        });
    }

    _getLetterFromLamp(lamp) {
        for (const [letter, l] of Object.entries(this.lamps)) {
            if (l === lamp) return letter;
        }
        return '';
    }
}
