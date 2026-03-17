/**
 * 設定面板控制器
 * 管理轉子、反射器、環設定、接線板的 UI 互動
 */

export class ControlsPanel {
    /**
     * @param {Function} onConfigChange - 設定變更時的回呼函式
     */
    constructor(onConfigChange) {
        this.onConfigChange = onConfigChange;

        // UI 元素參考
        this.reflectorSelect = document.getElementById('reflector-select');
        this.rotorSelects = [
            document.getElementById('rotor-left-select'),
            document.getElementById('rotor-middle-select'),
            document.getElementById('rotor-right-select'),
        ];
        this.ringInputs = [
            document.getElementById('ring-left'),
            document.getElementById('ring-middle'),
            document.getElementById('ring-right'),
        ];
        this.posInputs = [
            document.getElementById('pos-left'),
            document.getElementById('pos-middle'),
            document.getElementById('pos-right'),
        ];
        this.plugPairInput = document.getElementById('plug-pair');
        this.addPlugBtn = document.getElementById('add-plug');
        this.plugPairsList = document.getElementById('plug-pairs-list');
        this.applyBtn = document.getElementById('apply-settings');
        this.resetBtn = document.getElementById('reset-positions');
        this.toggleBtn = document.getElementById('toggle-panel');

        this.plugboardPairs = [];

        this._bindEvents();
    }

    _bindEvents() {
        // 套用設定
        this.applyBtn.addEventListener('click', () => this._applySettings());

        // 重設位置
        this.resetBtn.addEventListener('click', () => this._resetPositions());

        // 收合面板
        this.toggleBtn.addEventListener('click', () => {
            document.getElementById('controls-panel').classList.toggle('collapsed');
        });

        // 新增接線板配對
        this.addPlugBtn.addEventListener('click', () => this._addPlugPair());
        this.plugPairInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._addPlugPair();
        });
    }

    _addPlugPair() {
        const value = this.plugPairInput.value.toUpperCase().trim();
        if (value.length !== 2) return;

        const [a, b] = value.split('');
        if (a < 'A' || a > 'Z' || b < 'A' || b > 'Z' || a === b) return;

        // 檢查是否已被使用
        const used = new Set(this.plugboardPairs.flat());
        if (used.has(a) || used.has(b)) return;

        // 最多 13 對
        if (this.plugboardPairs.length >= 13) return;

        this.plugboardPairs.push([a, b]);
        this.plugPairInput.value = '';
        this._renderPlugPairs();
    }

    /**
     * 外部新增配對（從 3D 接線板點擊）
     * @param {string} a - 第一個字母
     * @param {string} b - 第二個字母
     */
    addPlugPairExternal(a, b) {
        const used = new Set(this.plugboardPairs.flat());
        if (used.has(a) || used.has(b)) return;
        if (this.plugboardPairs.length >= 13) return;

        this.plugboardPairs.push([a, b]);
        this._renderPlugPairs();
    }

    /**
     * 外部移除配對（從 3D 接線板點擊）
     * @param {string} a - 第一個字母
     * @param {string} b - 第二個字母
     */
    removePlugPairExternal(a, b) {
        this.plugboardPairs = this.plugboardPairs.filter(
            ([x, y]) => !((x === a && y === b) || (x === b && y === a))
        );
        this._renderPlugPairs();
    }

    _removePlugPair(index) {
        this.plugboardPairs.splice(index, 1);
        this._renderPlugPairs();
    }

    _renderPlugPairs() {
        this.plugPairsList.innerHTML = '';
        this.plugboardPairs.forEach(([a, b], index) => {
            const tag = document.createElement('span');
            tag.className = 'plug-pair-tag';
            tag.textContent = `${a}↔${b}`;
            tag.title = '點擊移除';
            tag.addEventListener('click', () => this._removePlugPair(index));
            this.plugPairsList.appendChild(tag);
        });
    }

    _applySettings() {
        const config = this.getConfig();
        this.onConfigChange(config);
    }

    _resetPositions() {
        this.posInputs.forEach(input => { input.value = '0'; });
        this._applySettings();
    }

    /**
     * 取得當前設定
     * @returns {Object} 機器設定
     */
    getConfig() {
        return {
            rotors: this.rotorSelects.map(el => el.value),
            reflector: this.reflectorSelect.value,
            ringSettings: this.ringInputs.map(el => parseInt(el.value) || 0),
            startPositions: this.posInputs.map(el => parseInt(el.value) || 0),
            plugboardPairs: [...this.plugboardPairs],
        };
    }
}
