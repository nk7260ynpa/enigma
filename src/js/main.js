/**
 * Enigma Machine 模擬器 - 主程式進入點
 * 初始化 3D 場景、加密引擎與 UI 控制
 */

import { createScene } from './three/scene.js';
import { EnigmaModel } from './three/enigma-model.js';
import { EnigmaMachine } from './enigma/enigma-machine.js';
import { ControlsPanel } from './ui/controls.js';
import { InputHandler } from './ui/input-handler.js';
import { Display } from './ui/display.js';

// 初始化 3D 場景
const canvasContainer = document.getElementById('canvas-container');
const { scene, camera, renderer, raycaster, animate } = createScene(canvasContainer);

// 建立 3D 模型
const enigmaModel = new EnigmaModel(scene);

// 建立加密引擎（預設設定）
let enigmaMachine = new EnigmaMachine({
    rotors: ['I', 'II', 'III'],
    reflector: 'UKW-B',
    ringSettings: [0, 0, 0],
    startPositions: [0, 0, 0],
    plugboardPairs: [],
});

// 初始化轉子顯示
enigmaModel.rotors.updatePositions([0, 0, 0], false);

// 建立顯示面板
const display = new Display();

// 建立設定面板
const controlsPanel = new ControlsPanel((newConfig) => {
    enigmaMachine = new EnigmaMachine(newConfig);
    enigmaModel.updateFromConfig(newConfig);

    // 同步接線板 3D 視覺化
    enigmaModel.plugboard.clearAll();
    if (newConfig.plugboardPairs) {
        for (const [a, b] of newConfig.plugboardPairs) {
            enigmaModel.plugboard.addPair(a, b);
        }
    }

    display.clear();
});

// 建立輸入處理器
const inputHandler = new InputHandler({
    enigmaMachine,
    enigmaModel,
    display,
    getEnigmaMachine: () => enigmaMachine,
    camera,
    raycaster,
    domElement: renderer.domElement,
});

// 3D 接線板配對回呼 → 同步到設定面板
enigmaModel.plugboard.onPair((letterA, letterB, isRemove) => {
    if (isRemove) {
        controlsPanel.removePlugPairExternal(letterA, letterB);
    } else {
        controlsPanel.addPlugPairExternal(letterA, letterB);
    }
    // 重新套用設定
    const config = controlsPanel.getConfig();
    enigmaMachine = new EnigmaMachine(config);
});

// 啟動渲染迴圈
animate();

// 視窗大小變更處理
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

console.log('Enigma Machine 模擬器已啟動');
