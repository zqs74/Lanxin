import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 16 images forming a complete ring
const RING_IMAGES = [
  '/images/showcase/case-game-action-01.png',
  '/images/showcase/case-yueba-champion.png',
  '/images/showcase/case-brand-sandknit.png',
  '/images/showcase/case-youth-championship.jpeg',
  '/images/showcase/case-villageba-ceremony.png',
  '/images/showcase/case-game-action-02.jpeg',
  '/images/showcase/case-serbia-trip.jpeg',
  '/images/showcase/case-yueba-action.jpeg',
  '/images/showcase/business-growth-coach.jpeg',
  '/images/showcase/recognition-villageba.jpeg',
  '/images/showcase/case-youth-game.jpeg',
  '/images/showcase/case-villageba-team.jpeg',
  '/images/showcase/case-villageba-audience.jpeg',
  '/images/showcase/case-growth-player.jpeg',
  '/images/showcase/case-brand-event.png',
  '/images/showcase/case-training-camp.jpeg',
];

function createTextureFromImage(sourceImg) {
  // 圆柱参数，需与下方保持一致
  const radius = 520;
  const count = 16;
  const gap = 0.02;
  const itemAngle = (Math.PI * 2) / count - gap;
  const arcLength = radius * itemAngle;
  const imgHeight = 200;

  const canvas = document.createElement('canvas');
  // canvas 宽高比 = 圆柱弧长 : 圆柱高度，确保贴图不变形
  canvas.width = Math.round(arcLength * 2);
  canvas.height = Math.round(imgHeight * 2);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const imgRatio = sourceImg.width / sourceImg.height;
  const canvasRatio = canvas.width / canvas.height;

  // Cover 模式：图片填满 canvas，保持比例，超出部分裁剪
  // 这样图片不会被压缩变形
  let drawW, drawH, drawX, drawY;
  if (imgRatio > canvasRatio) {
    // 图片更宽：以高度为准，宽度超出裁剪
    drawH = canvas.height;
    drawW = drawH * imgRatio;
    drawX = (canvas.width - drawW) / 2;
    drawY = 0;
  } else {
    // 图片更高：以宽度为准，高度超出裁剪
    drawW = canvas.width;
    drawH = drawW / imgRatio;
    drawX = 0;
    drawY = (canvas.height - drawH) / 2;
  }
  ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export default function HeroRingBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Ring parameters for top-down view
    const radius = 520;
    const imgHeight = 200;
    const segments = 80;
    const count = RING_IMAGES.length;
    const gap = 0.02; // small gap between images
    const itemAngle = (Math.PI * 2) / count - gap;

    const group = new THREE.Group();
    scene.add(group);

    const loadImg = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });

    let materials = [];

    Promise.all(RING_IMAGES.map((url) => loadImg(url))).then((imgs) => {
      imgs.forEach((img, i) => {
        if (!img) return;
        const startAngle = i * ((Math.PI * 2) / count);
        // Cylinder geometry with arc length = one image
        const geometry = new THREE.CylinderGeometry(
          radius,
          radius,
          imgHeight,
          segments,
          1,
          true,
          startAngle,
          itemAngle
        );
        // Flip so texture shows on outside
        geometry.scale(-1, 1, 1);

        const sharpTex = createTextureFromImage(img);

        const material = new THREE.MeshBasicMaterial({
          map: sharpTex,
          side: THREE.DoubleSide,
          transparent: true,
        });

        const slice = new THREE.Mesh(geometry, material);
        slice.userData.material = material;
        group.add(slice);
        materials.push(material);
      });
    });

    // Top-down angled view: camera is high up and slightly offset
    camera.position.set(0, 900, 350);
    camera.lookAt(0, 0, 0);

    let autoRotateSpeed = 0.0015;
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      group.rotation.y += autoRotateSpeed;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      materials.forEach((m) => {
        m.map.dispose();
        m.dispose();
      });
      group.children.forEach((c) => c.geometry.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-ring-bg absolute inset-0 z-0">
      {/* Center glow effect */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 rounded-full"
        style={{
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 40%, transparent 70%)',
        }}
      />

      {/* Vignette for depth - theme-aware */}
      <div
        className="absolute inset-0 pointer-events-none z-10 hero-ring-vignette"
      />

      {/* Top fade for navbar readability */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10 hero-ring-top-fade"
      />

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--page-bg))',
        }}
      />
    </div>
  );
}
