import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShadowSlaveState } from '../types';

interface ShadowSlave3DCanvasProps {
  shadowSlave: ShadowSlaveState;
  viewMode: 'dream_realm' | 'soul_sea';
  eventSeq?: number;
  onSelectNode?: (nodeId: string) => void;
}

function getSkyPalette(sunProgress: number, actKey: string) {
  if (sunProgress >= 75) {
    return { sky: '#04060d', fog: '#070a14', lightColor: '#6366f1', lightInt: 1.0, rimColor: '#f43f5e' };
  }
  if (sunProgress >= 50) {
    return { sky: '#360d1c', fog: '#4a1224', lightColor: '#fb7185', lightInt: 1.4, rimColor: '#f59e0b' };
  }
  if (actKey === 'black_mountain') {
    return { sky: '#101829', fog: '#1e293b', lightColor: '#cbd5e1', lightInt: 1.5, rimColor: '#38bdf8' };
  }
  if (actKey === 'crimson_spire') {
    return { sky: '#2a0812', fog: '#3f0c1d', lightColor: '#fda4af', lightInt: 1.45, rimColor: '#fbbf24' };
  }
  return { sky: '#1b1121', fog: '#2d1828', lightColor: '#e2e8f0', lightInt: 1.45, rimColor: '#fb7185' };
}

export function ShadowSlave3DCanvas({
  shadowSlave,
  viewMode,
  eventSeq = 0,
  onSelectNode,
}: ShadowSlave3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ shadowSlave, viewMode, onSelectNode });
  stateRef.current = { shadowSlave, viewMode, onSelectNode };

  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const hitFlashRef = useRef(0);

  useEffect(() => {
    if (eventSeq > 0) hitFlashRef.current = 1.0;
  }, [eventSeq]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    if (!renderer || !renderer.getContext()) {
      setWebglUnavailable(true);
      return;
    }

    setWebglUnavailable(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.borderRadius = '0.75rem';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight), 0.1, 100);

    // Lighting rig
    const ambientLight = new THREE.AmbientLight('#94a3b8', 0.85);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight('#f8fafc', 1.45);
    dirLight.position.set(7, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const rimLight = new THREE.PointLight('#f43f5e', 2.6, 26);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    const soulLight = new THREE.PointLight('#fde047', 2.2, 20);
    soulLight.position.set(0, 4, 2);
    scene.add(soulLight);

    // Groups for hot-swapping scenes cleanly
    const dreamGroup = new THREE.Group();
    const soulGroup = new THREE.Group();
    scene.add(dreamGroup);
    scene.add(soulGroup);

    // ==========================================
    // DREAM REALM SCENE OBJECTS
    // ==========================================
    const groundGeo = new THREE.PlaneGeometry(34, 34, 24, 24);
    const gPos = groundGeo.attributes.position;
    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i);
      const y = gPos.getY(i);
      const bump = Math.sin(x * 0.9) * Math.cos(y * 0.8) * 0.18;
      gPos.setZ(i, bump);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({ color: '#1b1320', roughness: 0.9, metalness: 0.12 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.35;
    groundMesh.receiveShadow = true;
    dreamGroup.add(groundMesh);

    // Rising Black Sea Plane
    const seaGeo = new THREE.PlaneGeometry(36, 36, 26, 26);
    const seaMat = new THREE.MeshStandardMaterial({
      color: '#03040a',
      roughness: 0.12,
      metalness: 0.92,
      transparent: true,
      opacity: 0.94,
    });
    const seaMesh = new THREE.Mesh(seaGeo, seaMat);
    seaMesh.rotation.x = -Math.PI / 2;
    seaMesh.position.y = -0.8;
    dreamGroup.add(seaMesh);

    // Distant Crimson Spire Monument
    const spireMat = new THREE.MeshStandardMaterial({
      color: '#6b0f1a',
      emissive: '#9f1239',
      emissiveIntensity: 0.35,
      roughness: 0.45,
    });
    const spireCone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 11.5, 6), spireMat);
    spireCone.position.set(6.5, 4.2, -9.2);
    dreamGroup.add(spireCone);

    // Decorative Crimson Coral Spires around the Valley
    const coralMat = new THREE.MeshStandardMaterial({
      color: '#881337',
      roughness: 0.65,
      metalness: 0.15,
    });
    const coralPositions: [number, number, number, number][] = [
      [-5.6, 0.4, -3.4, 1.3],
      [-2.5, 0.3, -4.2, 1.0],
      [1.8, 0.4, -4.6, 1.4],
      [5.4, 0.3, -3.5, 1.2],
      [-5.2, 0.3, 3.2, 1.1],
      [4.9, 0.4, 3.4, 1.2],
      [-0.4, 0.2, 3.8, 0.9],
    ];
    for (const [cx, cy, cz, sc] of coralPositions) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.45 * sc, 1.9 * sc, 5), coralMat);
      spire.position.set(cx, cy, cz);
      spire.rotation.z = Math.sin(cx) * 0.22;
      dreamGroup.add(spire);
    }

    // Dynamic Waypoints Container (rebuilt when Act changes)
    const nodesContainer = new THREE.Group();
    dreamGroup.add(nodesContainer);
    let interactiveNodeMeshes: THREE.Mesh[] = [];
    let builtActKey = '';

    // Sleeper Hero Avatar + Weapon + Orbiting Shadow Ribbon
    const heroGroup = new THREE.Group();
    const heroBodyMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.6 });
    const heroCloakMat = new THREE.MeshStandardMaterial({ color: '#312e81', emissive: '#6d28d9', emissiveIntensity: 0.45 });
    const heroTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.85, 8), heroBodyMat);
    heroTorso.position.y = 0.48;
    const heroHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 1), new THREE.MeshStandardMaterial({ color: '#e2e8f0' }));
    heroHead.position.y = 1.05;
    const heroBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.82, 0.14), new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.85, roughness: 0.15 }));
    heroBlade.position.set(0.38, 0.72, 0.12);
    heroBlade.rotation.z = -0.35;
    const shadowRibbonMat = new THREE.MeshStandardMaterial({
      color: '#09090b',
      emissive: '#8b5cf6',
      emissiveIntensity: 0.95,
      wireframe: false,
    });
    const shadowRibbon = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.045, 8, 28), shadowRibbonMat);
    shadowRibbon.position.y = 0.65;
    const runicAuraMat = new THREE.MeshBasicMaterial({
      color: '#fde047',
      transparent: true,
      opacity: 0.65,
    });
    const runicAuraRing = new THREE.Mesh(new THREE.RingGeometry(0.54, 0.62, 32), runicAuraMat);
    runicAuraRing.rotation.x = -Math.PI / 2;
    runicAuraRing.position.y = 0.06;
    heroGroup.add(
      heroTorso,
      heroHead,
      heroBlade,
      shadowRibbon,
      new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.7, 6), heroCloakMat),
      runicAuraRing
    );
    heroGroup.children[4].position.set(-0.08, 0.42, -0.05);
    dreamGroup.add(heroGroup);

    // Atmospheric Ash / Ember Particle Field across both Dream Realm & Soul Sea
    const particleCount = 160;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = 0.3 + Math.random() * 6.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#fde047',
      size: 0.09,
      transparent: true,
      opacity: 0.72,
    });
    const ashParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(ashParticles);

    // Stone Saint Echo Companion (visible when unlocked or on Wrap Echo)
    const saintGroup = new THREE.Group();
    const saintMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7, roughness: 0.35 });
    const saintTorso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.68, 0.24), saintMat);
    saintTorso.position.y = 0.45;
    const saintHelm = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 6), new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#991b1b', emissiveIntensity: 0.5 }));
    saintHelm.position.y = 0.92;
    saintGroup.add(saintTorso, saintHelm);
    dreamGroup.add(saintGroup);

    // 3D Nightmare Creature Facing Hero
    const enemyGroup = new THREE.Group();
    const enemyMat = new THREE.MeshStandardMaterial({
      color: '#991b1b',
      emissive: '#450a0a',
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.55,
    });
    const enemyCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), enemyMat);
    enemyCore.position.y = 0.65;
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.58, 5), new THREE.MeshStandardMaterial({ color: '#fda4af' }));
    hornL.position.set(-0.28, 1.05, 0);
    hornL.rotation.z = 0.55;
    const hornR = hornL.clone();
    hornR.position.x = 0.28;
    hornR.rotation.z = -0.55;
    const staggerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.04, 8, 24),
      new THREE.MeshBasicMaterial({ color: '#fde047' })
    );
    staggerRing.rotation.x = Math.PI / 2;
    staggerRing.position.y = 0.15;
    staggerRing.visible = false;
    enemyGroup.add(enemyCore, hornL, hornR, staggerRing);
    dreamGroup.add(enemyGroup);

    // ==========================================
    // SOUL SEA & GOLDEN SPELLWEAVE LOOM OBJECTS
    // ==========================================
    const soulSeaGeo = new THREE.PlaneGeometry(42, 42, 32, 32);
    const soulSeaMat = new THREE.MeshStandardMaterial({
      color: '#020308',
      roughness: 0.08,
      metalness: 0.95,
    });
    const soulSeaMesh = new THREE.Mesh(soulSeaGeo, soulSeaMat);
    soulSeaMesh.rotation.x = -Math.PI / 2;
    soulSeaMesh.position.y = -0.5;
    soulGroup.add(soulSeaMesh);

    // 1-7 Eclipsed Black Suns Container
    const sunsGroup = new THREE.Group();
    soulGroup.add(sunsGroup);
    let builtCoresKey = '';

    // InstancedMesh Legion of Slain Shades across the Black Water
    const shadeGeo = new THREE.ConeGeometry(0.18, 0.95, 5);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: '#09090b',
      emissive: '#312e81',
      emissiveIntensity: 0.35,
      roughness: 0.6,
    });
    const maxShades = 84;
    const shadesInstanced = new THREE.InstancedMesh(shadeGeo, shadeMat, maxShades);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < maxShades; i++) {
      const ring = 2.6 + Math.floor(i / 14) * 1.35;
      const ang = (i % 14) * ((Math.PI * 2) / 14) + Math.floor(i / 14) * 0.25;
      dummy.position.set(Math.cos(ang) * ring, -0.02, Math.sin(ang) * ring);
      dummy.scale.setScalar(0.85 + (i % 3) * 0.18);
      dummy.updateMatrix();
      shadesInstanced.setMatrixAt(i, dummy.matrix);
    }
    shadesInstanced.count = 1;
    soulGroup.add(shadesInstanced);

    // 3D Golden Spellweave Constellation Loom
    const loomGroup = new THREE.Group();
    loomGroup.position.set(0, 1.35, 0);
    soulGroup.add(loomGroup);
    let builtStringsKey = '';

    // Orbit + Raycaster Interaction State
    let azimuth = 0.22;
    let polar = 0.62;
    let radius = 10.5;
    let isDragging = false;
    let downPos = { x: 0, y: 0 };
    let prevPos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      downPos = { x: e.clientX, y: e.clientY };
      prevPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPos.x;
      const dy = e.clientY - prevPos.y;
      azimuth -= dx * 0.007;
      polar = Math.max(0.28, Math.min(1.22, polar - dy * 0.006));
      prevPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist < 7 && stateRef.current.viewMode === 'dream_realm' && stateRef.current.onSelectNode && renderer) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(interactiveNodeMeshes, false);
        if (hits.length > 0 && hits[0].object.userData?.nodeId) {
          hitFlashRef.current = 0.85;
          stateRef.current.onSelectNode(String(hits[0].object.userData.nodeId));
        }
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(6.2, Math.min(15.5, radius + e.deltaY * 0.008));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    const updateSize = () => {
      if (!renderer || !container) return;
      const w = Math.max(200, container.clientWidth);
      const h = Math.max(180, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      const { shadowSlave: ss, viewMode: mode } = stateRef.current;

      dreamGroup.visible = mode === 'dream_realm';
      soulGroup.visible = mode === 'soul_sea';

      if (mode === 'soul_sea') {
        scene.background = new THREE.Color('#020308');
        scene.fog = new THREE.FogExp2('#020308', 0.032);
        dirLight.color.set('#a5b4fc');
        dirLight.intensity = 1.1;
        rimLight.color.set(ss.aspect.primaryColor || '#8b5cf6');

        // Build 1-7 Eclipsed Black Suns if coreCount/aspect changed
        const cKey = `${ss.coreCount}-${ss.aspect.primaryColor}-${Math.floor(ss.soulFragments / 50)}`;
        if (builtCoresKey !== cKey) {
          builtCoresKey = cKey;
          sunsGroup.clear();
          const count = Math.max(1, Math.min(7, ss.coreCount || 1));
          const satScale = 0.72 + Math.min(0.45, (ss.soulFragments / 1000) * 0.45);
          for (let i = 0; i < count; i++) {
            const spread = (i - (count - 1) / 2) * 1.85;
            const arcY = 4.4 - Math.abs(i - (count - 1) / 2) * 0.35;
            const sunSphere = new THREE.Mesh(
              new THREE.SphereGeometry(0.56 * satScale, 20, 20),
              new THREE.MeshBasicMaterial({ color: '#030306' })
            );
            const corona = new THREE.Mesh(
              new THREE.TorusGeometry(0.68 * satScale, 0.055, 10, 36),
              new THREE.MeshBasicMaterial({ color: ss.aspect.primaryColor || '#8b5cf6' })
            );
            sunSphere.position.set(spread, arcY, -5.8);
            corona.position.copy(sunSphere.position);
            sunsGroup.add(sunSphere, corona);
          }
        }
        sunsGroup.children.forEach((obj, idx) => {
          if (idx % 2 === 1) obj.rotation.z = t * 0.45 + idx;
        });

        // Update Slain Shades count
        shadesInstanced.count = Math.max(1, Math.min(maxShades, ss.slainShades?.count || 1));

        // Build Golden Spellweave Constellation Loom
        const sKey = `${ss.spellweaveStrings}-${ss.memories.length}`;
        if (builtStringsKey !== sKey) {
          builtStringsKey = sKey;
          loomGroup.clear();
          const nodeCount = Math.min(14, 5 + (ss.spellweaveStrings || 1) + ss.memories.length);
          const pts: THREE.Vector3[] = [];
          const nodeMat = new THREE.MeshStandardMaterial({
            color: '#fef08a',
            emissive: '#f59e0b',
            emissiveIntensity: 0.9,
          });
          for (let i = 0; i < nodeCount; i++) {
            const ang = (i / nodeCount) * Math.PI * 2;
            const rNode = i % 2 === 0 ? 1.75 : 0.95;
            const vy = Math.sin(i * 1.7) * 0.72;
            const p = new THREE.Vector3(Math.cos(ang) * rNode, vy, Math.sin(ang) * rNode);
            pts.push(p);
            const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), nodeMat);
            diamond.position.copy(p);
            loomGroup.add(diamond);
          }
          const linePositions: number[] = [];
          for (let i = 0; i < pts.length; i++) {
            const next = pts[(i + 1) % pts.length];
            const across = pts[(i + 3) % pts.length];
            linePositions.push(pts[i].x, pts[i].y, pts[i].z, next.x, next.y, next.z);
            linePositions.push(pts[i].x, pts[i].y, pts[i].z, across.x, across.y, across.z);
          }
          const strGeo = new THREE.BufferGeometry();
          strGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
          const strLines = new THREE.LineSegments(
            strGeo,
            new THREE.LineBasicMaterial({ color: '#fde047', transparent: true, opacity: 0.88 })
          );
          loomGroup.add(strLines);
        }
        loomGroup.rotation.y = t * 0.28;
        loomGroup.position.y = 1.45 + Math.sin(t * 1.1) * 0.12;
      } else {
        // DREAM REALM SCENE
        const pal = getSkyPalette(ss.sunProgress, ss.currentAct.key);
        scene.background = new THREE.Color(pal.sky);
        scene.fog = new THREE.FogExp2(pal.fog, ss.sunProgress >= 75 ? 0.055 : 0.032);
        dirLight.color.set(pal.lightColor);
        dirLight.intensity = pal.lightInt;
        rimLight.color.set(pal.rimColor);

        // Animate Rising Black Sea Water Plane based on sunProgress (Night >= 75 submerges low coral y=0)
        const targetSeaY = ss.sunProgress >= 75 ? 0.42 : ss.sunProgress >= 50 ? -0.18 : -0.78;
        seaMesh.position.y += (targetSeaY - seaMesh.position.y) * 0.06;
        const sPos = seaGeo.attributes.position;
        for (let i = 0; i < sPos.count; i++) {
          const sx = sPos.getX(i);
          const sy = sPos.getY(i);
          sPos.setZ(i, Math.sin(sx * 0.65 + t * 2.1) * Math.cos(sy * 0.55 + t * 1.6) * 0.08);
        }
        sPos.needsUpdate = true;

        // Rebuild Waypoint Pedestals & Crystals when Act updates
        const actKey = `${ss.arcAct}-${ss.currentNode.id}-${ss.clearedNodeIds.length}`;
        if (builtActKey !== actKey) {
          builtActKey = actKey;
          nodesContainer.clear();
          interactiveNodeMeshes = [];
          const nodes = ss.currentAct.nodes;

          const pathPts: THREE.Vector3[] = [];
          for (const n of nodes) {
            const [nx, ny, nz] = n.pos;
            pathPts.push(new THREE.Vector3(nx, ny + 0.15, nz));

            // Pedestal (tall statue column for High ground vs flat coral pad for Low coral)
            if (n.altitude === 'high') {
              const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.68, 0.85, Math.max(1.2, ny + 0.6), 7),
                new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.8 })
              );
              col.position.set(nx, (ny - 0.3) * 0.5, nz);
              nodesContainer.add(col);
            } else {
              const pad = new THREE.Mesh(
                new THREE.CylinderGeometry(0.65, 0.72, 0.16, 6),
                new THREE.MeshStandardMaterial({ color: '#4c1d24', roughness: 0.85 })
              );
              pad.position.set(nx, ny - 0.12, nz);
              nodesContainer.add(pad);
            }

            const isCurrent = n.id === ss.currentNode.id;
            const isCleared = ss.clearedNodeIds.includes(n.id);
            const nodeColor = isCurrent
              ? ss.aspect.primaryColor || '#fde047'
              : n.isBoss
                ? '#f43f5e'
                : isCleared
                  ? '#34d399'
                  : n.altitude === 'high'
                    ? '#38bdf8'
                    : '#fb7185';
            const beacon = new THREE.Mesh(
              new THREE.OctahedronGeometry(isCurrent ? 0.28 : 0.22, 0),
              new THREE.MeshStandardMaterial({
                color: nodeColor,
                emissive: nodeColor,
                emissiveIntensity: isCurrent ? 1.1 : 0.65,
              })
            );
            beacon.position.set(nx, ny + 1.55, nz);
            beacon.userData = { nodeId: n.id };
            nodesContainer.add(beacon);
            interactiveNodeMeshes.push(beacon);
          }

          if (pathPts.length >= 2) {
            const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPts);
            nodesContainer.add(
              new THREE.Line(
                pathGeo,
                new THREE.LineBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.45 })
              )
            );
          }
        }

        // Bob interactive waypoint crystals
        interactiveNodeMeshes.forEach((m, i) => {
          m.rotation.y = t * 1.4 + i;
          m.position.y += Math.sin(t * 2.5 + i) * 0.0025;
        });

        // Position Hero & Active Enemy on Current Node
        const [hx, hy, hz] = ss.currentNode.pos;
        const heroTargetPos = new THREE.Vector3(hx - 0.42, hy - 0.02, hz + 0.18);
        heroGroup.position.lerp(heroTargetPos, 0.14);
        heroGroup.rotation.y = Math.PI * 0.28;
        heroCloakMat.emissive.set(ss.aspect.primaryColor || '#8b5cf6');
        shadowRibbonMat.emissive.set(ss.aspect.primaryColor || '#8b5cf6');
        runicAuraMat.color.set(ss.aspect.primaryColor || '#fde047');
        runicAuraRing.scale.setScalar(1 + Math.sin(t * 2.8) * 0.08);
        particleMat.color.set(ss.sunPhase === 'night' ? '#818cf8' : ss.aspect.primaryColor || '#fde047');
        ashParticles.rotation.y = t * 0.04;
        ashParticles.position.y = Math.sin(t * 0.8) * 0.14;

        // Animate Shadow Wrap Ribbon onto Weapon / Body / Stone Saint
        const saintUnlocked = ss.echoes.some((e) => e.unlocked);
        saintGroup.visible = saintUnlocked || ss.shadowWrap === 'echo';
        saintGroup.position.set(heroGroup.position.x - 0.55, hy - 0.02, heroGroup.position.z - 0.48);

        if (ss.shadowWrap === 'weapon') {
          shadowRibbon.scale.setScalar(0.45);
          shadowRibbon.position.set(0.38, 0.85, 0.12);
          shadowRibbon.rotation.set(t * 4.2, t * 2.8, 0.3);
        } else if (ss.shadowWrap === 'body') {
          shadowRibbon.scale.setScalar(1.05);
          shadowRibbon.position.set(0, 0.65, 0);
          shadowRibbon.rotation.set(Math.PI / 2.2, t * 3.2, t * 1.4);
        } else {
          shadowRibbon.scale.setScalar(0.95);
          shadowRibbon.position.set(-0.55, 0.68, -0.48);
          shadowRibbon.rotation.set(Math.PI / 2, t * 4.5, 0);
        }

        const hasEnemy = Boolean(ss.activeCombat && ss.activeCombat.hp > 0);
        enemyGroup.visible = hasEnemy;
        if (hasEnemy && ss.activeCombat) {
          const flashBump = hitFlashRef.current > 0 ? Math.sin(t * 38) * 0.08 : 0;
          enemyGroup.position.set(hx + 0.58 + flashBump, hy + 0.04, hz - 0.22);
          enemyGroup.rotation.y = -Math.PI * 0.72 + Math.sin(t * 1.8) * 0.08;
          const isBoss = ss.activeCombat.isBoss;
          enemyGroup.scale.setScalar(isBoss ? 1.45 : 1.0);
          enemyMat.emissive.set(
            ss.activeCombat.staggered
              ? '#ca8a04'
              : ss.activeCombat.intent === 'HEAVY_CRUSH'
                ? '#dc2626'
                : '#450a0a'
          );
          enemyMat.emissiveIntensity = ss.activeCombat.intent === 'HEAVY_CRUSH' ? 0.7 + Math.sin(t * 9) * 0.35 : 0.45;
          staggerRing.visible = ss.activeCombat.staggered;
          staggerRing.rotation.z = t * 2.6;
        }
      }

      if (hitFlashRef.current > 0) {
        hitFlashRef.current = Math.max(0, hitFlashRef.current - 0.04);
      }

      // Smooth orbital camera update
      const camX = radius * Math.sin(polar) * Math.sin(azimuth);
      const camY = radius * Math.cos(polar) + 1.2;
      const camZ = radius * Math.sin(polar) * Math.cos(azimuth);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, mode === 'soul_sea' ? 1.1 : 0.45, 0);

      renderer!.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      renderer?.dispose();
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className="w-full aspect-[16/10] rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center justify-center p-4 text-center space-y-2">
        <div className="text-2xl">{shadowSlave.aspect.icon}</div>
        <div className="text-xs font-extrabold text-white">
          {viewMode === 'soul_sea' ? '3D Soul Sea & Spellweave Loom' : shadowSlave.currentAct.title}
        </div>
        <div className="text-[11px] text-slate-300">
          Current Node: {shadowSlave.currentNode.name} • Sun: {shadowSlave.sunPhase.toUpperCase()} ({shadowSlave.sunProgress}%)
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-amber-400/25 bg-black shadow-[0_12px_40px_rgba(0,0,0,0.75)]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" aria-label="ThreeJS Nightmare Realm Viewport" />

      {/* Subtle Vignette Frame */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.72)]" />

      {/* Top Left Overlay Pill */}
      <div className="pointer-events-none absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/75 border border-white/15 text-[10px] font-extrabold text-white backdrop-blur-md shadow-lg flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: shadowSlave.aspect.primaryColor }} />
        <span>
          {viewMode === 'soul_sea'
            ? `Soul Sea • ${shadowSlave.coreCount} Core${shadowSlave.coreCount > 1 ? 's' : ''} (${shadowSlave.coreClass.name}) • ${shadowSlave.slainShades.count} Silent Shades`
            : `${shadowSlave.currentNode.name} (${shadowSlave.currentNode.altitude === 'high' ? 'High Statue ⛰️' : 'Low Coral 🪸'})`}
        </span>
      </div>

      {/* Top Right Sea / Sun Phase Indicator */}
      <div className="pointer-events-none absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/75 border border-white/15 text-[10px] font-extrabold backdrop-blur-md shadow-lg">
        {viewMode === 'soul_sea' ? (
          <span className="text-amber-300">🧵 {shadowSlave.spellweaveStrings} Golden Strings</span>
        ) : shadowSlave.sunPhase === 'night' ? (
          <span className="text-rose-400 animate-pulse">🌑 BLACK SEA FLOODED ({shadowSlave.sunProgress}%)</span>
        ) : shadowSlave.sunPhase === 'dusk' ? (
          <span className="text-amber-300 animate-pulse">🌅 DUSK TIDE RISING ({shadowSlave.sunProgress}%)</span>
        ) : (
          <span className="text-sky-300">☀️ DAYLIGHT ({shadowSlave.sunProgress}%)</span>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[9px] font-bold text-slate-300/90">
        <span className="px-2 py-0.5 rounded-lg bg-black/70 border border-white/10 backdrop-blur-sm">
          3D WebGL • Drag Orbit / Scroll Zoom
        </span>
        {viewMode === 'dream_realm' && (
          <span className="px-2 py-0.5 rounded-lg bg-black/70 border border-white/10 backdrop-blur-sm">
            Click Glowing 3D Crystal Nodes to Advance
          </span>
        )}
      </div>
    </div>
  );
}
