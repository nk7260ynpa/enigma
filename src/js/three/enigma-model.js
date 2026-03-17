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

        // 建立各組件
        this._buildBody();
        this._buildComponents();

        this.mainGroup.position.y = -1.5;
        scene.add(this.mainGroup);
    }

    _buildBody() {
        const woodMat = createWoodMaterial();
        const darkWoodMat = createDarkWoodMaterial();

        // 主機身底座
        const baseWidth = 10;
        const baseDepth = 12;
        const baseHeight = 1.2;
        const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
        const base = new THREE.Mesh(baseGeometry, woodMat);
        base.position.y = baseHeight / 2;
        base.castShadow = true;
        base.receiveShadow = true;
        this.mainGroup.add(base);

        // 底座邊框裝飾
        const edgeGeometry = new THREE.BoxGeometry(
            baseWidth + 0.1, 0.15, baseDepth + 0.1
        );
        const edge = new THREE.Mesh(edgeGeometry, darkWoodMat);
        edge.position.y = 0.08;
        edge.castShadow = true;
        this.mainGroup.add(edge);

        // 頂部邊框
        const topEdge = new THREE.Mesh(edgeGeometry, darkWoodMat);
        topEdge.position.y = baseHeight + 0.08;
        this.mainGroup.add(topEdge);

        // 鍵盤區域面板（稍微傾斜）
        const keyPanelGeometry = new THREE.BoxGeometry(baseWidth - 0.4, 0.15, 3.2);
        const keyPanel = new THREE.Mesh(keyPanelGeometry, createPanelMaterial());
        keyPanel.position.set(0, baseHeight + 0.08, 2.2);
        keyPanel.rotation.x = -0.05; // 輕微傾斜
        keyPanel.receiveShadow = true;
        this.mainGroup.add(keyPanel);

        // 燈板區域面板
        const lampPanelGeometry = new THREE.BoxGeometry(baseWidth - 0.4, 0.15, 2.8);
        const lampPanel = new THREE.Mesh(lampPanelGeometry, createPanelMaterial());
        lampPanel.position.set(0, baseHeight + 0.08, -1.2);
        lampPanel.receiveShadow = true;
        this.mainGroup.add(lampPanel);

        // 轉子區域外殼
        const rotorHousingGeometry = new THREE.BoxGeometry(7, 2.2, 2.5);
        const rotorHousing = new THREE.Mesh(rotorHousingGeometry, woodMat);
        rotorHousing.position.set(0, baseHeight + 1.1, -3.8);
        rotorHousing.castShadow = true;
        this.mainGroup.add(rotorHousing);

        // 轉子視窗頂蓋（金屬）
        const rotorCoverGeometry = new THREE.BoxGeometry(7.2, 0.08, 2.7);
        const rotorCover = new THREE.Mesh(rotorCoverGeometry, createMetalMaterial());
        rotorCover.position.set(0, baseHeight + 2.24, -3.8);
        rotorCover.castShadow = true;
        this.mainGroup.add(rotorCover);

        // 接線板前蓋板
        const plugPanelGeometry = new THREE.BoxGeometry(baseWidth - 0.4, 2.0, 0.15);
        const plugPanel = new THREE.Mesh(plugPanelGeometry, darkWoodMat);
        plugPanel.position.set(0, baseHeight + 1.0, baseDepth / 2 - 0.15);
        plugPanel.castShadow = true;
        this.mainGroup.add(plugPanel);

        // 四個角的金屬裝飾
        const cornerGeometry = new THREE.CylinderGeometry(0.15, 0.15, baseHeight + 0.3, 8);
        const cornerMat = createMetalMaterial();
        const corners = [
            [-baseWidth / 2 + 0.2, baseHeight / 2, -baseDepth / 2 + 0.2],
            [baseWidth / 2 - 0.2, baseHeight / 2, -baseDepth / 2 + 0.2],
            [-baseWidth / 2 + 0.2, baseHeight / 2, baseDepth / 2 - 0.2],
            [baseWidth / 2 - 0.2, baseHeight / 2, baseDepth / 2 - 0.2],
        ];
        corners.forEach(([x, y, z]) => {
            const corner = new THREE.Mesh(cornerGeometry, cornerMat);
            corner.position.set(x, y, z);
            corner.castShadow = true;
            this.mainGroup.add(corner);
        });
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
