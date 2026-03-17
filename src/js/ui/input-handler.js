/**
 * 輸入處理器
 * 整合實體鍵盤輸入與 3D 滑鼠點擊輸入
 */

import * as THREE from 'three';

export class InputHandler {
    /**
     * @param {Object} options
     * @param {Object} options.enigmaMachine - Enigma 加密引擎
     * @param {Object} options.enigmaModel - 3D 模型
     * @param {Object} options.display - 文字顯示面板
     * @param {Function} options.getEnigmaMachine - 取得最新的加密引擎
     * @param {THREE.Camera} options.camera - 相機
     * @param {THREE.Raycaster} options.raycaster - 射線投射器
     * @param {HTMLElement} options.domElement - 渲染器 DOM 元素
     */
    constructor(options) {
        this.enigmaModel = options.enigmaModel;
        this.display = options.display;
        this.getEnigmaMachine = options.getEnigmaMachine;
        this.camera = options.camera;
        this.raycaster = options.raycaster;
        this.domElement = options.domElement;

        this._isProcessing = false;
        this._currentKey = null;
        this._pointer = new THREE.Vector2();

        this._bindKeyboardEvents();
        this._bindMouseEvents();
        this._bindPlugboardEvents();
    }

    _bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // 忽略在輸入框中的按鍵
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            if (e.repeat) return;

            const letter = e.key.toUpperCase();
            if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
                e.preventDefault();
                this._handleKeyPress(letter);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

            const letter = e.key.toUpperCase();
            if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
                this._handleKeyRelease(letter);
            }
        });
    }

    _bindMouseEvents() {
        if (!this.domElement) return;

        this.domElement.addEventListener('pointerdown', (e) => {
            this._updatePointer(e);
            const hit = this._raycast();

            if (hit && hit.userData.type === 'key') {
                this._handleKeyPress(hit.userData.letter);
            } else if (hit && hit.userData.type === 'plug') {
                this.enigmaModel.plugboard.handleSocketClick(hit.userData.letter);
            } else if (hit && hit.userData.type === 'rotor-up') {
                this._handleRotorAdjust(hit.userData.rotorIndex, 1);
            } else if (hit && hit.userData.type === 'rotor-down') {
                this._handleRotorAdjust(hit.userData.rotorIndex, -1);
            }
        });

        this.domElement.addEventListener('pointerup', () => {
            if (this._currentKey) {
                this._handleKeyRelease(this._currentKey);
            }
        });
    }

    _bindPlugboardEvents() {
        // 接線板配對回呼會在 main.js 中設定
    }

    _updatePointer(event) {
        const rect = this.domElement.getBoundingClientRect();
        this._pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this._pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    _raycast() {
        if (!this.raycaster || !this.camera) return null;

        this.raycaster.setFromCamera(this._pointer, this.camera);
        const objects = this.enigmaModel.getAllInteractiveObjects();
        const intersects = this.raycaster.intersectObjects(objects, false);

        return intersects.length > 0 ? intersects[0].object : null;
    }

    /**
     * 處理按鍵按下
     * @param {string} letter - 按下的字母
     */
    _handleKeyPress(letter) {
        if (this._isProcessing) return;
        this._isProcessing = true;
        this._currentKey = letter;

        const machine = this.getEnigmaMachine();

        // 加密
        const encrypted = machine.encryptLetter(letter);
        if (!encrypted) {
            this._isProcessing = false;
            return;
        }

        // 3D 動畫
        this.enigmaModel.keyboard.pressKey(letter);
        this.enigmaModel.lampboard.lightUp(encrypted);

        // 更新轉子顯示
        const positions = machine.getRotorPositions();
        this.enigmaModel.rotors.updatePositions(positions, true);

        // 更新文字顯示
        this.display.appendInput(letter);
        this.display.appendOutput(encrypted);
    }

    /**
     * 處理按鍵釋放
     * @param {string} letter - 釋放的字母
     */
    _handleKeyRelease(letter) {
        this.enigmaModel.keyboard.releaseKey(letter);
        this.enigmaModel.lampboard.turnOff();
        this._isProcessing = false;
        this._currentKey = null;
    }

    /**
     * 處理轉子調整
     * @param {number} rotorIndex - 轉子索引 (0=左, 1=中, 2=右)
     * @param {number} direction - 方向 (1=上, -1=下)
     */
    _handleRotorAdjust(rotorIndex, direction) {
        const machine = this.getEnigmaMachine();
        const rotors = [machine.leftRotor, machine.middleRotor, machine.rightRotor];
        const rotor = rotors[rotorIndex];

        const newPos = ((rotor.position + direction) % 26 + 26) % 26;
        rotor.setPosition(newPos);

        // 同步更新初始位置輸入框
        const posInputs = ['pos-left', 'pos-middle', 'pos-right'];
        document.getElementById(posInputs[rotorIndex]).value = newPos;

        // 更新 3D 顯示
        const positions = machine.getRotorPositions();
        this.enigmaModel.rotors.updatePositions(positions, true);
    }
}
