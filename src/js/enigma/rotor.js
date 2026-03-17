/**
 * Enigma 轉子類別
 * 處理單一轉子的正向/反向信號映射與步進機制
 */

import { ALPHABET, ROTOR_WIRINGS, ROTOR_NOTCHES, letterToIndex } from './constants.js';

export class Rotor {
    /**
     * 建立轉子實例
     * @param {string} type - 轉子型號 ('I', 'II', 'III', 'IV', 'V')
     * @param {number} ringSetting - 環設定 (Ringstellung), 0-25
     * @param {number} startPosition - 初始位置 (Grundstellung), 0-25
     */
    constructor(type, ringSetting = 0, startPosition = 0) {
        this.type = type;
        this.ringSetting = ringSetting;
        this.position = startPosition;

        // 正向接線表（數字索引陣列）
        const wiring = ROTOR_WIRINGS[type];
        this.forwardWiring = [];
        for (let i = 0; i < 26; i++) {
            this.forwardWiring.push(letterToIndex(wiring[i]));
        }

        // 反向接線表（預先計算）
        this.backwardWiring = new Array(26);
        for (let i = 0; i < 26; i++) {
            this.backwardWiring[this.forwardWiring[i]] = i;
        }

        // 缺口位置（數字索引）
        this.notch = letterToIndex(ROTOR_NOTCHES[type]);
    }

    /**
     * 正向通過轉子（右→左方向，從鍵盤到反射器）
     * @param {number} inputIndex - 輸入信號索引 (0-25)
     * @returns {number} 輸出信號索引 (0-25)
     */
    forward(inputIndex) {
        const shift = this.position - this.ringSetting;
        const input = ((inputIndex + shift) % 26 + 26) % 26;
        const output = this.forwardWiring[input];
        return ((output - shift) % 26 + 26) % 26;
    }

    /**
     * 反向通過轉子（左→右方向，從反射器回到燈板）
     * @param {number} inputIndex - 輸入信號索引 (0-25)
     * @returns {number} 輸出信號索引 (0-25)
     */
    backward(inputIndex) {
        const shift = this.position - this.ringSetting;
        const input = ((inputIndex + shift) % 26 + 26) % 26;
        const output = this.backwardWiring[input];
        return ((output - shift) % 26 + 26) % 26;
    }

    /**
     * 轉子步進一格
     */
    step() {
        this.position = (this.position + 1) % 26;
    }

    /**
     * 檢查轉子是否在缺口位置
     * @returns {boolean} 是否在缺口位置
     */
    isAtNotch() {
        return this.position === this.notch;
    }

    /**
     * 取得當前顯示的字母
     * @returns {string} 目前顯示的字母 (A-Z)
     */
    getDisplayLetter() {
        return ALPHABET[this.position];
    }

    /**
     * 設定轉子位置
     * @param {number} position - 新的位置 (0-25)
     */
    setPosition(position) {
        this.position = ((position % 26) + 26) % 26;
    }
}
