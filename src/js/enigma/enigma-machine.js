/**
 * Enigma Machine 主類別
 * 組裝轉子、反射器與接線板，實作完整的加密路徑
 */

import { Rotor } from './rotor.js';
import { Reflector } from './reflector.js';
import { Plugboard } from './plugboard.js';
import { letterToIndex, indexToLetter } from './constants.js';

export class EnigmaMachine {
    /**
     * 建立 Enigma Machine 實例
     * @param {Object} config - 機器設定
     * @param {string[]} config.rotors - 轉子型號 [左, 中, 右]
     * @param {string} config.reflector - 反射器型號
     * @param {number[]} config.ringSettings - 環設定 [左, 中, 右]
     * @param {number[]} config.startPositions - 初始位置 [左, 中, 右]
     * @param {Array<[string, string]>} config.plugboardPairs - 接線板配對
     */
    constructor(config) {
        this.leftRotor = new Rotor(
            config.rotors[0],
            config.ringSettings[0],
            config.startPositions[0]
        );
        this.middleRotor = new Rotor(
            config.rotors[1],
            config.ringSettings[1],
            config.startPositions[1]
        );
        this.rightRotor = new Rotor(
            config.rotors[2],
            config.ringSettings[2],
            config.startPositions[2]
        );

        this.reflector = new Reflector(config.reflector);

        this.plugboard = new Plugboard();
        if (config.plugboardPairs) {
            for (const [a, b] of config.plugboardPairs) {
                this.plugboard.addPair(a, b);
            }
        }

        // 儲存初始位置供重設使用
        this._initialPositions = [...config.startPositions];
    }

    /**
     * 加密單一字母
     * 完整路徑：鍵盤 → 接線板 → 右→中→左轉子 → 反射器 → 左→中→右轉子 → 接線板 → 燈板
     * @param {string} letter - 輸入字母 (A-Z)
     * @returns {string} 加密後的字母 (A-Z)
     */
    encryptLetter(letter) {
        letter = letter.toUpperCase();
        if (letter < 'A' || letter > 'Z') return null;

        // 1. 轉子步進（在加密之前）
        this._stepRotors();

        // 2. 接線板（第一次通過）
        let index = this.plugboard.swap(letterToIndex(letter));

        // 3. 右→中→左轉子（正向）
        index = this.rightRotor.forward(index);
        index = this.middleRotor.forward(index);
        index = this.leftRotor.forward(index);

        // 4. 反射器
        index = this.reflector.reflect(index);

        // 5. 左→中→右轉子（反向）
        index = this.leftRotor.backward(index);
        index = this.middleRotor.backward(index);
        index = this.rightRotor.backward(index);

        // 6. 接線板（第二次通過）
        index = this.plugboard.swap(index);

        return indexToLetter(index);
    }

    /**
     * 加密整段文字
     * @param {string} text - 輸入文字（只處理字母）
     * @returns {string} 加密後的文字
     */
    encryptText(text) {
        let result = '';
        for (const char of text.toUpperCase()) {
            if (char >= 'A' && char <= 'Z') {
                result += this.encryptLetter(char);
            }
        }
        return result;
    }

    /**
     * 雙步進機制 (Double stepping)
     * 步進順序：
     * 1. 檢查中間轉子是否在缺口 → 帶動左轉子 + 自身雙步進
     * 2. 檢查右轉子是否在缺口 → 帶動中間轉子
     * 3. 右轉子永遠步進
     */
    _stepRotors() {
        const middleAtNotch = this.middleRotor.isAtNotch();
        const rightAtNotch = this.rightRotor.isAtNotch();

        if (middleAtNotch) {
            this.leftRotor.step();
            this.middleRotor.step();
        }

        if (rightAtNotch) {
            this.middleRotor.step();
        }

        this.rightRotor.step();
    }

    /**
     * 取得當前轉子位置
     * @returns {number[]} [左, 中, 右] 的位置 (0-25)
     */
    getRotorPositions() {
        return [
            this.leftRotor.position,
            this.middleRotor.position,
            this.rightRotor.position,
        ];
    }

    /**
     * 取得當前轉子顯示字母
     * @returns {string[]} [左, 中, 右] 的顯示字母
     */
    getRotorDisplayLetters() {
        return [
            this.leftRotor.getDisplayLetter(),
            this.middleRotor.getDisplayLetter(),
            this.rightRotor.getDisplayLetter(),
        ];
    }

    /**
     * 重設轉子到初始位置
     */
    resetPositions() {
        this.leftRotor.setPosition(this._initialPositions[0]);
        this.middleRotor.setPosition(this._initialPositions[1]);
        this.rightRotor.setPosition(this._initialPositions[2]);
    }
}
