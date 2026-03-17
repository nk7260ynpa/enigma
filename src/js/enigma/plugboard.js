/**
 * Enigma 接線板類別 (Steckerbrett)
 * 處理字母對的交換，最多可設定 13 對
 */

import { letterToIndex } from './constants.js';

export class Plugboard {
    constructor() {
        /** @type {Map<number, number>} 字母索引的雙向映射 */
        this.mapping = new Map();
    }

    /**
     * 新增一組字母配對
     * @param {string} letterA - 第一個字母
     * @param {string} letterB - 第二個字母
     * @returns {boolean} 是否新增成功
     */
    addPair(letterA, letterB) {
        const a = letterToIndex(letterA.toUpperCase());
        const b = letterToIndex(letterB.toUpperCase());

        // 不能自己配對自己
        if (a === b) return false;

        // 檢查是否已被使用
        if (this.mapping.has(a) || this.mapping.has(b)) return false;

        // 檢查是否超過 13 對
        if (this.mapping.size >= 26) return false;

        this.mapping.set(a, b);
        this.mapping.set(b, a);
        return true;
    }

    /**
     * 移除包含指定字母的配對
     * @param {string} letter - 要移除配對的字母
     */
    removePair(letter) {
        const index = letterToIndex(letter.toUpperCase());
        if (this.mapping.has(index)) {
            const paired = this.mapping.get(index);
            this.mapping.delete(index);
            this.mapping.delete(paired);
        }
    }

    /**
     * 通過接線板交換信號
     * @param {number} inputIndex - 輸入信號索引 (0-25)
     * @returns {number} 交換後的信號索引 (0-25)
     */
    swap(inputIndex) {
        if (this.mapping.has(inputIndex)) {
            return this.mapping.get(inputIndex);
        }
        return inputIndex;
    }

    /**
     * 清除所有配對
     */
    clear() {
        this.mapping.clear();
    }

    /**
     * 取得所有配對（用於 UI 顯示）
     * @returns {Array<[string, string]>} 字母配對陣列
     */
    getPairs() {
        const pairs = [];
        const seen = new Set();
        for (const [a, b] of this.mapping) {
            if (!seen.has(a) && !seen.has(b)) {
                pairs.push([
                    String.fromCharCode(a + 65),
                    String.fromCharCode(b + 65),
                ]);
                seen.add(a);
                seen.add(b);
            }
        }
        return pairs;
    }
}
