/**
 * 3D 接線板元件 (Steckerbrett)
 * 26 個插孔，支援點擊配對與連線視覺化
 */

import * as THREE from 'three';
import { createBrassMaterial, createCableMaterial, createTextTexture } from './materials.js';
import { ALPHABET } from '../enigma/constants.js';

export class Plugboard3D {
    /**
     * @param {THREE.Scene} scene - Three.js 場景
     * @param {THREE.Vector3} position - 接線板基準位置
     */
    constructor(scene, position) {
        this.group = new THREE.Group();
        this.group.position.copy(position);
        this.sockets = {};          // letter → { mesh, group, worldPos }
        this.cables = {};           // 'AB' → cableMesh
        this.interactiveObjects = [];
        this._selectedSocket = null;
        this._onPairCallback = null;

        this._buildPlugboard();
        scene.add(this.group);
    }

    _buildPlugboard() {
        const rows = [
            ALPHABET.slice(0, 13).split(''),  // A-M
            ALPHABET.slice(13).split(''),      // N-Z
        ];
        const socketRadius = 0.18;
        const spacingX = 0.75;
        const spacingZ = 0.7;

        const socketGeometry = new THREE.CylinderGeometry(
            socketRadius, socketRadius, 0.15, 16
        );
        const innerGeometry = new THREE.CylinderGeometry(
            socketRadius * 0.6, socketRadius * 0.6, 0.16, 12
        );
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1410,
            roughness: 0.8,
            metalness: 0.1,
        });

        rows.forEach((row, rowIndex) => {
            const startX = -(row.length - 1) * spacingX / 2;

            row.forEach((letter, colIndex) => {
                const socketGroup = new THREE.Group();

                // 外圈（黃銅）
                const brassMat = createBrassMaterial();
                const socket = new THREE.Mesh(socketGeometry, brassMat);
                socket.rotation.x = Math.PI / 2;
                socketGroup.add(socket);

                // 內圈（黑色孔）
                const inner = new THREE.Mesh(innerGeometry, innerMaterial);
                inner.rotation.x = Math.PI / 2;
                inner.position.z = -0.01;
                socketGroup.add(inner);

                // 字母標籤
                const textTexture = createTextTexture(letter, {
                    fontSize: 56,
                    textColor: '#c9a84c',
                    width: 64,
                    height: 64,
                });
                const textMat = new THREE.SpriteMaterial({
                    map: textTexture,
                    transparent: true,
                });
                const textSprite = new THREE.Sprite(textMat);
                textSprite.scale.set(0.25, 0.25, 1);
                textSprite.position.y = socketRadius + 0.18;
                socketGroup.add(textSprite);

                // 定位
                const x = startX + colIndex * spacingX;
                const z = rowIndex * spacingZ;
                socketGroup.position.set(x, 0, z);

                this.group.add(socketGroup);

                // 標記可互動
                socket.userData = { type: 'plug', letter };
                this.interactiveObjects.push(socket);

                this.sockets[letter] = {
                    mesh: socket,
                    group: socketGroup,
                    material: brassMat,
                    isPaired: false,
                };
            });
        });
    }

    /**
     * 設定配對回呼
     * @param {Function} callback - (letterA, letterB) => void
     */
    onPair(callback) {
        this._onPairCallback = callback;
    }

    /**
     * 處理插孔點擊
     * @param {string} letter - 被點擊的字母
     */
    handleSocketClick(letter) {
        const socket = this.sockets[letter];
        if (!socket) return;

        // 如果已配對，點擊移除配對
        if (socket.isPaired) {
            this._removePairByLetter(letter);
            return;
        }

        // 第一次選擇
        if (!this._selectedSocket) {
            this._selectedSocket = letter;
            this._highlightSocket(letter, true);
            return;
        }

        // 第二次選擇 - 建立配對
        if (this._selectedSocket === letter) {
            // 取消選擇
            this._highlightSocket(letter, false);
            this._selectedSocket = null;
            return;
        }

        const letterA = this._selectedSocket;
        const letterB = letter;
        this._highlightSocket(letterA, false);
        this._selectedSocket = null;

        this.addPair(letterA, letterB);

        if (this._onPairCallback) {
            this._onPairCallback(letterA, letterB);
        }
    }

    /**
     * 視覺化新增配對
     * @param {string} letterA
     * @param {string} letterB
     */
    addPair(letterA, letterB) {
        const socketA = this.sockets[letterA];
        const socketB = this.sockets[letterB];
        if (!socketA || !socketB) return;

        socketA.isPaired = true;
        socketB.isPaired = true;

        // 改變插孔顏色表示已配對
        socketA.mesh.material = new THREE.MeshBasicMaterial({
            color: 0xc9a84c,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x4a3a10,
            emissiveIntensity: 0.3,
        });
        socketB.mesh.material = socketA.mesh.material;

        // 畫連線
        this._drawCable(letterA, letterB);
    }

    /**
     * 移除配對
     * @param {string} letterA
     * @param {string} letterB
     */
    removePair(letterA, letterB) {
        const key = [letterA, letterB].sort().join('');
        this._removeCable(key);

        const socketA = this.sockets[letterA];
        const socketB = this.sockets[letterB];
        if (socketA) {
            socketA.isPaired = false;
            socketA.mesh.material = socketA.material;
        }
        if (socketB) {
            socketB.isPaired = false;
            socketB.mesh.material = socketB.material;
        }
    }

    /**
     * 清除所有配對
     */
    clearAll() {
        for (const [key, cable] of Object.entries(this.cables)) {
            this.group.remove(cable);
            cable.geometry.dispose();
            cable.material.dispose();
        }
        this.cables = {};

        for (const [letter, socket] of Object.entries(this.sockets)) {
            socket.isPaired = false;
            socket.mesh.material = socket.material;
        }
    }

    _removePairByLetter(letter) {
        for (const [key, cable] of Object.entries(this.cables)) {
            if (key.includes(letter)) {
                const other = key.replace(letter, '');
                this.removePair(letter, other);

                if (this._onPairCallback) {
                    this._onPairCallback(letter, other, true); // true = remove
                }
                return;
            }
        }
    }

    _drawCable(letterA, letterB) {
        const key = [letterA, letterB].sort().join('');
        const posA = this.sockets[letterA].group.position.clone();
        const posB = this.sockets[letterB].group.position.clone();

        // 建立曲線
        const midY = 0.3 + Math.abs(posA.x - posB.x) * 0.1;
        const midPoint = new THREE.Vector3(
            (posA.x + posB.x) / 2,
            -midY,
            (posA.z + posB.z) / 2 + 0.3
        );

        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(posA.x, posA.y, posA.z + 0.1),
            midPoint,
            new THREE.Vector3(posB.x, posB.y, posB.z + 0.1),
        ]);

        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
        // 隨機暖色調線材
        const colors = [0xc9a84c, 0x8b6914, 0xa05a2c, 0x6b4423];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const cableMesh = new THREE.Mesh(tubeGeometry, createCableMaterial(color));

        this.group.add(cableMesh);
        this.cables[key] = cableMesh;
    }

    _removeCable(key) {
        const cable = this.cables[key];
        if (cable) {
            this.group.remove(cable);
            cable.geometry.dispose();
            cable.material.dispose();
            delete this.cables[key];
        }
    }

    _highlightSocket(letter, highlight) {
        const socket = this.sockets[letter];
        if (!socket) return;

        if (highlight) {
            socket.mesh.material = new THREE.MeshBasicMaterial({
                color: 0xffdd44,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0xffcc00,
                emissiveIntensity: 0.5,
            });
        } else {
            socket.mesh.material = socket.material;
        }
    }

    /**
     * 取得可互動的物件陣列
     * @returns {THREE.Mesh[]}
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
}
