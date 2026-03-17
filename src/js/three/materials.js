/**
 * Enigma Machine 3D 模型材質定義
 * 使用程序化生成，不依賴外部貼圖
 */

import * as THREE from 'three';

/** 木紋材質（機身外殼） */
export function createWoodMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x5c3a1e,
        roughness: 0.85,
        metalness: 0.05,
    });
}

/** 深色木紋材質（機身底座） */
export function createDarkWoodMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x3a2210,
        roughness: 0.9,
        metalness: 0.02,
    });
}

/** 電木材質（按鍵） */
export function createBakeliteMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x1a1410,
        roughness: 0.4,
        metalness: 0.1,
    });
}

/** 按鍵高亮材質 */
export function createBakeliteHighlightMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.3,
        metalness: 0.15,
    });
}

/** 金屬材質（轉子外殼、螺絲） */
export function createMetalMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x8a8070,
        roughness: 0.3,
        metalness: 0.85,
    });
}

/** 黃銅材質（接線板插孔） */
export function createBrassMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0xb5a040,
        roughness: 0.35,
        metalness: 0.9,
    });
}

/** 燈板玻璃材質（未點亮） */
export function createLampOffMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x2a2520,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
    });
}

/** 燈板發光材質（點亮） */
export function createLampOnMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0xffdd44,
        emissive: 0xffcc00,
        emissiveIntensity: 2.0,
        roughness: 0.1,
        metalness: 0.0,
    });
}

/** 面板材質（燈板/鍵盤底板） */
export function createPanelMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x2a2015,
        roughness: 0.7,
        metalness: 0.1,
    });
}

/** 接線板連線材質 */
export function createCableMaterial(color = 0xc9a84c) {
    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.3,
    });
}

/**
 * 建立帶有文字的 Canvas 材質
 * @param {string} text - 顯示文字
 * @param {Object} options - 設定選項
 * @returns {THREE.CanvasTexture}
 */
export function createTextTexture(text, options = {}) {
    const {
        fontSize = 64,
        fontFamily = 'Arial, sans-serif',
        textColor = '#e0d5c1',
        bgColor = null,
        width = 128,
        height = 128,
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 背景
    if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
    } else {
        ctx.clearRect(0, 0, width, height);
    }

    // 文字
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(text, width / 2, height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

/**
 * 建立轉子表面的字母環 Canvas 材質
 * @param {number} highlightIndex - 當前高亮字母的索引 (-1 不高亮)
 * @returns {THREE.CanvasTexture}
 */
export function createRotorLetterTexture(highlightIndex = -1) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // 金屬底色
    ctx.fillStyle = '#6a6055';
    ctx.fillRect(0, 0, 512, 128);

    // 刻度線與字母
    const letterWidth = 512 / 26;
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 26; i++) {
        const x = i * letterWidth + letterWidth / 2;

        // 分隔線
        ctx.strokeStyle = '#4a4035';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(i * letterWidth, 0);
        ctx.lineTo(i * letterWidth, 128);
        ctx.stroke();

        // 高亮背景
        if (i === highlightIndex) {
            ctx.fillStyle = '#c9a84c';
            ctx.fillRect(i * letterWidth, 0, letterWidth, 128);
            ctx.fillStyle = '#1a1410';
        } else {
            ctx.fillStyle = '#e0d5c1';
        }

        ctx.fillText(String.fromCharCode(65 + i), x, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}
