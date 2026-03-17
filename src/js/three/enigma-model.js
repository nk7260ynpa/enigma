/**
 * Enigma Machine 3D 模型主組裝
 * 組合機身、鍵盤、燈板、轉子、接線板等所有元件
 */

import * as THREE from 'three';
import { createWoodMaterial, createDarkWoodMaterial, createPanelMaterial, createMetalMaterial } from './materials.js';
import { Keyboard3D } from './keyboard-3d.js';
import { Lampboard3D } from './lampboard-3d.js';
import { Rotors3D } from './rotors-3d.js';
import { Plugboard3D } from './plugboard-3d.js';

export class EnigmaModel {
    /**
     * @param {THREE.Scene} scene - Three.js 場景
     */
    constructor(scene) {
        this.scene = scene;
        this.mainGroup = new THREE.Group();

        this._buildBody();
        this._buildComponents();

        this.mainGroup.position.y = 0;
        this._addEdges();
        scene.add(this.mainGroup);
    }

    _buildBody() {
        const woodMat = createWoodMaterial();

        // 主機身底座
        const baseWidth = 10;
        const baseDepth = 12;
        const baseHeight = 1.2;
        const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
        const base = new THREE.Mesh(baseGeometry, woodMat);
        base.position.y = baseHeight / 2;
        this.mainGroup.add(base);

        // 轉子區域外殼
        const rotorHousingGeometry = new THREE.BoxGeometry(7, 2.2, 2.5);
        const rotorHousing = new THREE.Mesh(rotorHousingGeometry, woodMat);
        rotorHousing.position.set(0, baseHeight + 1.1, -3.8);
        this.mainGroup.add(rotorHousing);

        // 轉子視窗頂蓋（金屬）
        const rotorCoverGeometry = new THREE.BoxGeometry(7.2, 0.08, 2.7);
        const rotorCover = new THREE.Mesh(rotorCoverGeometry, createMetalMaterial());
        rotorCover.position.set(0, baseHeight + 2.24, -3.8);
        this.mainGroup.add(rotorCover);

        // 接線板前蓋板
        const plugPanelGeometry = new THREE.BoxGeometry(baseWidth - 0.4, 2.0, 0.15);
        const plugPanel = new THREE.Mesh(plugPanelGeometry, createDarkWoodMaterial());
        plugPanel.position.set(0, baseHeight + 1.0, baseDepth / 2 - 0.15);
        this.mainGroup.add(plugPanel);
    }

    _buildComponents() {
        const baseHeight = 1.2;

        // 鍵盤（位於機身前方）
        this.keyboard = new Keyboard3D(
            this.mainGroup,
            new THREE.Vector3(0, baseHeight + 0.2, 2.2)
        );

        // 燈板（位於鍵盤後方）
        this.lampboard = new Lampboard3D(
            this.mainGroup,
            new THREE.Vector3(0, baseHeight + 0.2, -1.2)
        );

        // 轉子（位於最後方頂部）
        this.rotors = new Rotors3D(
            this.mainGroup,
            new THREE.Vector3(0, baseHeight + 1.0, -3.8)
        );

        // 接線板（位於前面板）
        this.plugboard = new Plugboard3D(
            this.mainGroup,
            new THREE.Vector3(0, baseHeight + 1.0, 5.6)
        );
    }

    _addEdges() {
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        this.mainGroup.traverse((obj) => {
            if (obj.isMesh && obj.geometry) {
                const edges = new THREE.EdgesGeometry(obj.geometry, 15);
                const line = new THREE.LineSegments(edges, edgeMaterial);
                obj.add(line);
            }
        });
    }

    /**
     * 從設定更新模型狀態
     * @param {Object} config - 機器設定
     */
    updateFromConfig(config) {
        if (config.startPositions) {
            this.rotors.updatePositions(config.startPositions, false);
        }
    }

    /**
     * 取得所有可互動物件
     * @returns {THREE.Mesh[]}
     */
    getAllInteractiveObjects() {
        return [
            ...this.keyboard.getInteractiveObjects(),
            ...this.rotors.getInteractiveObjects(),
            ...this.plugboard.getInteractiveObjects(),
        ];
    }
}
