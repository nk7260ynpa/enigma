/**
 * Enigma Machine 常數定義
 * 資料來源：https://en.wikipedia.org/wiki/Enigma_rotor_details
 */

/** 字母表 */
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * 轉子接線表
 * 輸入 ABCDEFGHIJKLMNOPQRSTUVWXYZ 對應的輸出字母
 */
export const ROTOR_WIRINGS = {
    I:   'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    II:  'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    III: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    IV:  'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    V:   'VZBRGITYUPSDNHLXAWMJQOFECK',
};

/**
 * 轉子缺口位置
 * 當轉子顯示此字母時，下一次按鍵會觸發左鄰轉子步進
 */
export const ROTOR_NOTCHES = {
    I:   'Q',
    II:  'E',
    III: 'V',
    IV:  'J',
    V:   'Z',
};

/**
 * 反射器接線表
 */
export const REFLECTOR_WIRINGS = {
    'UKW-B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
    'UKW-C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
};

/**
 * 將字母轉換為數字索引 (A=0, B=1, ..., Z=25)
 * @param {string} letter - 單一大寫字母
 * @returns {number} 0-25 的索引值
 */
export function letterToIndex(letter) {
    return letter.charCodeAt(0) - 65;
}

/**
 * 將數字索引轉換為字母 (0=A, 1=B, ..., 25=Z)
 * @param {number} index - 0-25 的索引值
 * @returns {string} 單一大寫字母
 */
export function indexToLetter(index) {
    return String.fromCharCode(index + 65);
}
