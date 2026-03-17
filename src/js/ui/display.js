/**
 * 輸入/輸出文字顯示面板
 * 管理加密過程中的明文與密文顯示
 */

export class Display {
    constructor() {
        this.inputEl = document.getElementById('input-text');
        this.outputEl = document.getElementById('output-text');
        this.clearBtn = document.getElementById('clear-display');

        this._inputText = '';
        this._outputText = '';

        this._bindEvents();
    }

    _bindEvents() {
        this.clearBtn.addEventListener('click', () => this.clear());
    }

    /**
     * 新增一個輸入字母
     * @param {string} letter - 輸入的字母
     */
    appendInput(letter) {
        this._inputText += letter;
        this._render();
    }

    /**
     * 新增一個輸出字母
     * @param {string} letter - 加密後的字母
     */
    appendOutput(letter) {
        this._outputText += letter;
        this._render();
    }

    /**
     * 清除所有文字
     */
    clear() {
        this._inputText = '';
        this._outputText = '';
        this._render();
    }

    /**
     * 格式化文字（每 5 個字母一組）
     * @param {string} text - 原始文字
     * @returns {string} 格式化後的文字
     */
    _formatText(text) {
        return text.match(/.{1,5}/g)?.join(' ') || '';
    }

    _render() {
        this.inputEl.textContent = this._formatText(this._inputText);
        this.outputEl.textContent = this._formatText(this._outputText);
    }
}
