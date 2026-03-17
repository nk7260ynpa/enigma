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
const { scene, camera, renderer, controls, animate } = createScene(canvasContainer);

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

// 建立顯示面板
const display = new Display();

// 建立設定面板
const controlsPanel = new ControlsPanel((newConfig) => {
    enigmaMachine = new EnigmaMachine(newConfig);
    enigmaModel.updateFromConfig(newConfig);
    display.clear();
});

// 建立輸入處理器
const inputHandler = new InputHandler({
    enigmaMachine,
    enigmaModel,
    display,
    getEnigmaMachine: () => enigmaMachine,
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
