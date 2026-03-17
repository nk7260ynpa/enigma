/**
 * Enigma 反射器類別
 * 將信號反射回轉子組，確保加密的自反性
 */

import { REFLECTOR_WIRINGS, letterToIndex } from './constants.js';

export class Reflector {
    /**
     * 建立反射器實例
     * @param {string} type - 反射器型號 ('UKW-B', 'UKW-C')
     */
    constructor(type) {
        this.type = type;
        const wiring = REFLECTOR_WIRINGS[type];
        this.wiring = [];
        for (let i = 0; i < 26; i++) {
            this.wiring.push(letterToIndex(wiring[i]));
        }
    }

    /**
     * 反射信號
     * @param {number} inputIndex - 輸入信號索引 (0-25)
     * @returns {number} 反射後的信號索引 (0-25)
     */
    reflect(inputIndex) {
        return this.wiring[inputIndex];
    }
}
