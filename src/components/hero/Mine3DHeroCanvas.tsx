import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Truck, Eye, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export type LightingMode = 'standard' | 'highbeam' | 'emergency';
export type CameraMode = 'parallax' | 'chase' | 'inspector';

interface Mine3DHeroCanvasProps {
  className?: string;
  onTelemetryUpdate?: (data: { speed: number; distance: number; status: string }) => void;
}

export const Mine3DHeroCanvas: React.FC<Mine3DHeroCanvasProps> = ({
  className = '',
  onTelemetryUpdate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // User-facing interactive state
  const [lightingMode, setLightingMode] = useState<LightingMode>('standard');
  const [cameraMode, setCameraMode] = useState<CameraMode>('parallax');
  const [truckMoving, setTruckMoving] = useState<boolean>(true);
  const [hudMinimized, setHudMinimized] = useState<boolean>(false);
  const [truckSpeed, setTruckSpeed] = useState<number>(14);

  // References for render loop mutable state
  const stateRef = useRef({
    lightingMode: 'standard' as LightingMode,
    cameraMode: 'parallax' as CameraMode,
    truckMoving: true,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    speed: 14,
    distanceTraveled: 0
  });

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current.lightingMode = lightingMode;
  }, [lightingMode]);

  useEffect(() => {
    stateRef.current.cameraMode = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    stateRef.current.truckMoving = truckMoving;
  }, [truckMoving]);

  // Mouse move handler for natural parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    stateRef.current.mouse.targetX = (e.clientX / width - 0.5) * 2;
    stateRef.current.mouse.targetY = -(e.clientY / height - 0.5) * 2;
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // -------------------------------------------------------------------------
    // 1. SCENE, CAMERA, RENDERER SETUP
    // -------------------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a14);
    scene.fog = new THREE.FogExp2(0x070b16, 0.038);

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // -------------------------------------------------------------------------
    // 2. TEXTURE LOADER & ASSETS
    // -------------------------------------------------------------------------
    const textureLoader = new THREE.TextureLoader();
    
    // Foundational original mine image
    const bgTexture = textureLoader.load('/images/mine-hero.png');
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    bgTexture.minFilter = THREE.LinearFilter;
    bgTexture.magFilter = THREE.LinearFilter;

    // Light cone texture
    const lightConeTexture = textureLoader.load('/images/light-cone.png');
    
    // Dust particle texture
    const dustTexture = textureLoader.load('/images/dust-particle.png');

    // -------------------------------------------------------------------------
    // 3. FOUNDATIONAL BACKPLATE (PRESERVING THE ORIGINAL IMAGE)
    // -------------------------------------------------------------------------
    // The original mine hero photograph is placed in the background at z = -14
    const bgPlaneGeo = new THREE.PlaneGeometry(28, 16);
    const bgPlaneMat = new THREE.MeshBasicMaterial({
      map: bgTexture,
      depthWrite: false,
      transparent: true,
      opacity: 0.98
    });
    const bgMesh = new THREE.Mesh(bgPlaneGeo, bgPlaneMat);
    bgMesh.position.set(0, 0.2, -14);
    scene.add(bgMesh);

    // Dynamic Amber Cavern Veins Shimmer Layer
    // Adds an organic pulse to the golden mineral veins along the rock walls
    const veinShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseTexture: { value: bgTexture },
        uGlowIntensity: { value: 0.5 },
        uAlertMode: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uBaseTexture;
        uniform float uGlowIntensity;
        uniform float uAlertMode;
        varying vec2 vUv;

        void main() {
          vec4 col = texture2D(uBaseTexture, vUv);
          
          // Detect warm golden/amber rock veins: high red, moderate green, low blue
          float isAmber = 0.0;
          if (col.r > 0.45 && col.g > 0.28 && (col.r - col.b) > 0.22) {
            isAmber = smoothstep(0.45, 0.85, col.r) * smoothstep(0.2, 0.55, col.g);
          }

          // Organic pulsating glow
          float pulse = 0.5 + 0.5 * sin(uTime * 1.8 + vUv.y * 6.0);
          float alertPulse = 0.5 + 0.5 * sin(uTime * 6.0);

          vec3 goldColor = vec3(1.0, 0.72, 0.18);
          vec3 alertColor = vec3(1.0, 0.2, 0.1);
          vec3 finalGlow = mix(goldColor, alertColor, uAlertMode * alertPulse);

          float alpha = isAmber * uGlowIntensity * mix(pulse * 0.4 + 0.2, alertPulse * 0.7 + 0.3, uAlertMode);
          gl_FragColor = vec4(finalGlow, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const veinGlowMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 16), veinShaderMat);
    veinGlowMesh.position.set(0, 0.2, -13.95);
    scene.add(veinGlowMesh);

    // Haul Road Ground Plane (Subterranean haul road)
    const groundGeo = new THREE.PlaneGeometry(24, 30, 24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.88,
      metalness: 0.12
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -1.8, -4);
    scene.add(groundMesh);

    // -------------------------------------------------------------------------
    // 4. OVERHEAD GANTRY LIGHTING & VOLUMETRIC GOD RAYS
    // -------------------------------------------------------------------------
    const gantrySpotLight = new THREE.SpotLight(0xffecd0, 6.0, 28, Math.PI / 6, 0.65, 1.2);
    gantrySpotLight.position.set(-2.5, 5.5, -8);
    const gantryTarget = new THREE.Object3D();
    gantryTarget.position.set(1.5, -1.8, -4);
    scene.add(gantryTarget);
    gantrySpotLight.target = gantryTarget;
    scene.add(gantrySpotLight);

    // Volumetric God Ray Cones
    const rayConeGeo = new THREE.ConeGeometry(3.2, 10, 32, 1, true);
    rayConeGeo.translate(0, -5, 0);
    const rayConeMat = new THREE.MeshBasicMaterial({
      map: lightConeTexture,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const rayConeMesh = new THREE.Mesh(rayConeGeo, rayConeMat);
    rayConeMesh.position.copy(gantrySpotLight.position);
    rayConeMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(1.5, -1.8, -4).sub(gantrySpotLight.position).normalize()
    );
    scene.add(rayConeMesh);

    // Secondary ambient overhead mine illumination
    const cavernAmbient = new THREE.AmbientLight(0x283042, 1.4);
    scene.add(cavernAmbient);

    const warmCeilingLight = new THREE.PointLight(0xf59e0b, 2.5, 18);
    warmCeilingLight.position.set(0, 3.8, -5);
    scene.add(warmCeilingLight);

    // -------------------------------------------------------------------------
    // 5. 3D PERSPECTIVE MINING HAUL TRUCK (CATERPILLAR DUMP TRUCK)
    // -------------------------------------------------------------------------
    const truckGroup = new THREE.Group();
    truckGroup.position.set(2.4, -1.8, -3.2);

    // Colors & materials
    const catYellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.38,
      metalness: 0.28
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.65,
      metalness: 0.8
    });
    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      roughness: 0.92,
      metalness: 0.05
    });
    const cabGlassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });

    // 5a. Main Chassis Frame
    const chassisGeo = new THREE.BoxGeometry(1.9, 0.45, 3.8);
    const chassisMesh = new THREE.Mesh(chassisGeo, darkSteelMat);
    chassisMesh.position.set(0, 0.65, 0);
    truckGroup.add(chassisMesh);

    // Front Radiator Grille & Bumper
    const bumperGeo = new THREE.BoxGeometry(2.1, 0.4, 0.5);
    const bumperMesh = new THREE.Mesh(bumperGeo, darkSteelMat);
    bumperMesh.position.set(0, 0.5, 1.95);
    truckGroup.add(bumperMesh);

    const grilleGeo = new THREE.BoxGeometry(1.4, 0.5, 0.1);
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.9 });
    const grilleMesh = new THREE.Mesh(grilleGeo, grilleMat);
    grilleMesh.position.set(0, 0.85, 1.96);
    truckGroup.add(grilleMesh);

    // 5b. Offset Operator Cab (Authentic Caterpillar design on Left)
    const cabGeo = new THREE.BoxGeometry(0.75, 0.9, 1.1);
    const cabMesh = new THREE.Mesh(cabGeo, catYellowMat);
    cabMesh.position.set(-0.55, 1.45, 0.9);
    truckGroup.add(cabMesh);

    // Cab Windows
    const frontWindshieldGeo = new THREE.PlaneGeometry(0.65, 0.55);
    const frontWindshield = new THREE.Mesh(frontWindshieldGeo, cabGlassMat);
    frontWindshield.position.set(-0.55, 1.55, 1.46);
    truckGroup.add(frontWindshield);

    const sideWindowGeo = new THREE.PlaneGeometry(0.9, 0.45);
    const sideWindow = new THREE.Mesh(sideWindowGeo, cabGlassMat);
    sideWindow.rotation.y = -Math.PI / 2;
    sideWindow.position.set(-0.93, 1.55, 0.9);
    truckGroup.add(sideWindow);

    // Safety Railings & Access Stairs
    const railMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.3 });
    const railGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.85);
    const railMesh1 = new THREE.Mesh(railGeo, railMat);
    railMesh1.position.set(0.1, 1.35, 1.5);
    truckGroup.add(railMesh1);

    const railMesh2 = new THREE.Mesh(railGeo, railMat);
    railMesh2.position.set(-0.98, 1.35, 1.5);
    truckGroup.add(railMesh2);

    // Amber Rotating Safety Strobe Beacon on Cab Roof
    const beaconGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(-0.55, 1.95, 0.85);
    truckGroup.add(beaconMesh);

    const beaconLight = new THREE.PointLight(0xf59e0b, 1.5, 6);
    beaconLight.position.set(-0.55, 2.05, 0.85);
    truckGroup.add(beaconLight);

    // 5c. Heavy-Duty Ribbed Dump Bed
    const bedGroup = new THREE.Group();
    bedGroup.position.set(0, 1.15, -0.2);

    // Bed bottom
    const bedFloorGeo = new THREE.BoxGeometry(2.0, 0.15, 3.2);
    const bedFloorMesh = new THREE.Mesh(bedFloorGeo, catYellowMat);
    bedFloorMesh.position.set(0, 0, -0.4);
    bedGroup.add(bedFloorMesh);

    // Bed sides (angled outwards)
    const sideWallGeo = new THREE.BoxGeometry(0.12, 0.9, 3.2);
    const leftWall = new THREE.Mesh(sideWallGeo, catYellowMat);
    leftWall.position.set(-1.05, 0.45, -0.4);
    leftWall.rotation.z = -0.15;
    bedGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, catYellowMat);
    rightWall.position.set(1.05, 0.45, -0.4);
    rightWall.rotation.z = 0.15;
    bedGroup.add(rightWall);

    // Front bed wall with Cab Protector Canopy
    const frontWallGeo = new THREE.BoxGeometry(2.0, 0.9, 0.15);
    const frontWall = new THREE.Mesh(frontWallGeo, catYellowMat);
    frontWall.position.set(0, 0.45, 1.2);
    bedGroup.add(frontWall);

    const canopyGeo = new THREE.BoxGeometry(2.1, 0.1, 1.4);
    const canopyMesh = new THREE.Mesh(canopyGeo, catYellowMat);
    canopyMesh.position.set(0, 0.95, 1.8);
    bedGroup.add(canopyMesh);

    // Articulated hydraulic cylinders (chrome)
    const hydMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 });
    const hydGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0);
    const hydMeshL = new THREE.Mesh(hydGeo, hydMat);
    hydMeshL.position.set(-0.45, -0.25, 0.2);
    hydMeshL.rotation.x = 0.35;
    truckGroup.add(hydMeshL);

    const hydMeshR = new THREE.Mesh(hydGeo, hydMat);
    hydMeshR.position.set(0.45, -0.25, 0.2);
    hydMeshR.rotation.x = 0.35;
    truckGroup.add(hydMeshR);

    truckGroup.add(bedGroup);

    // 5d. 6 Heavy Mining Wheels & Tires
    const wheelMeshes: THREE.Group[] = [];

    const createWheel = (x: number, y: number, z: number) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(x, y, z);

      // Outer tire with tread
      const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMesh = new THREE.Mesh(tireGeo, tireRubberMat);
      wheelAssembly.add(tireMesh);

      // Heavy steel wheel hub & lug bolts
      const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.42, 16);
      hubGeo.rotateZ(Math.PI / 2);
      const hubMesh = new THREE.Mesh(hubGeo, darkSteelMat);
      wheelAssembly.add(hubMesh);

      const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.44, 12);
      capGeo.rotateZ(Math.PI / 2);
      const capMesh = new THREE.Mesh(capGeo, catYellowMat);
      wheelAssembly.add(capMesh);

      truckGroup.add(wheelAssembly);
      wheelMeshes.push(wheelAssembly);
      return wheelAssembly;
    };

    // Front Wheels (Steering)
    const frontLeftWheel = createWheel(-1.15, 0.55, 1.25);
    const frontRightWheel = createWheel(1.15, 0.55, 1.25);

    // Rear Dual Wheels (Drive)
    createWheel(-1.25, 0.55, -1.15);
    createWheel(-0.85, 0.55, -1.15);
    createWheel(0.85, 0.55, -1.15);
    createWheel(1.25, 0.55, -1.15);

    // 5e. High-Intensity Projector Headlights
    const headlightGroup = new THREE.Group();
    headlightGroup.position.set(0, 0.85, 2.0);

    const headlightLensGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
    headlightLensGeo.rotateX(Math.PI / 2);
    const headlightLensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftHeadlightLens = new THREE.Mesh(headlightLensGeo, headlightLensMat);
    leftHeadlightLens.position.set(-0.7, 0, 0);
    headlightGroup.add(leftHeadlightLens);

    const rightHeadlightLens = new THREE.Mesh(headlightLensGeo, headlightLensMat);
    rightHeadlightLens.position.set(0.7, 0, 0);
    headlightGroup.add(rightHeadlightLens);

    // Left SpotLight
    const leftSpot = new THREE.SpotLight(0xfff6e5, 7.5, 24, Math.PI / 7, 0.5, 1.4);
    leftSpot.position.set(-0.7, 0.85, 2.1);
    const leftSpotTarget = new THREE.Object3D();
    leftSpotTarget.position.set(-0.7, 0.1, 14);
    truckGroup.add(leftSpotTarget);
    leftSpot.target = leftSpotTarget;
    truckGroup.add(leftSpot);

    // Right SpotLight
    const rightSpot = new THREE.SpotLight(0xfff6e5, 7.5, 24, Math.PI / 7, 0.5, 1.4);
    rightSpot.position.set(0.7, 0.85, 2.1);
    const rightSpotTarget = new THREE.Object3D();
    rightSpotTarget.position.set(0.7, 0.1, 14);
    truckGroup.add(rightSpotTarget);
    rightSpot.target = rightSpotTarget;
    truckGroup.add(rightSpot);

    // Volumetric 3D Light Cones
    const headlightBeamGeo = new THREE.ConeGeometry(1.6, 9.0, 24, 1, true);
    headlightBeamGeo.translate(0, 4.5, 0);
    headlightBeamGeo.rotateX(-Math.PI / 2);

    const headlightBeamMat = new THREE.MeshBasicMaterial({
      map: lightConeTexture,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const leftBeamMesh = new THREE.Mesh(headlightBeamGeo, headlightBeamMat);
    leftBeamMesh.position.set(-0.7, 0, 0.1);
    headlightGroup.add(leftBeamMesh);

    const rightBeamMesh = new THREE.Mesh(headlightBeamGeo, headlightBeamMat);
    rightBeamMesh.position.set(0.7, 0, 0.1);
    headlightGroup.add(rightBeamMesh);

    truckGroup.add(headlightGroup);

    // Red Tail Lamps
    const tailLampMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tailLampGeo = new THREE.BoxGeometry(0.18, 0.1, 0.05);
    const leftTail = new THREE.Mesh(tailLampGeo, tailLampMat);
    leftTail.position.set(-0.85, 0.7, -1.92);
    truckGroup.add(leftTail);

    const rightTail = new THREE.Mesh(tailLampGeo, tailLampMat);
    rightTail.position.set(0.85, 0.7, -1.92);
    truckGroup.add(rightTail);

    scene.add(truckGroup);

    // -------------------------------------------------------------------------
    // 6. ANIMATED 3D UNDERGROUND MINE WORKERS (GEOTECHNICAL SURVEYORS)
    // -------------------------------------------------------------------------
    const createMiner = (initialPos: THREE.Vector3, isWalking = true) => {
      const miner = new THREE.Group();
      miner.position.copy(initialPos);

      const vestMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 }); // Hi-Vis Orange
      const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }); // Dark Navy Coal Coverall
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Yellow Hard Hat
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.9 }); // Heavy Mining Boots
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });

      // Pelvis & Torso
      const torsoGroup = new THREE.Group();
      torsoGroup.position.set(0, 0.9, 0);

      const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.46, 0.22), vestMat);
      torsoGroup.add(torsoMesh);

      // Reflective Scotchlite stripe
      const stripeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.37, 0.06, 0.23),
        new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
      );
      stripeMesh.position.y = 0.05;
      torsoGroup.add(stripeMesh);

      // Neck & Head
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.35, 0);

      const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.18), skinMat);
      headGroup.add(headMesh);

      // Hard Hat
      const helmetMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.12, 16), helmetMat);
      helmetMesh.position.set(0, 0.1, 0.02);
      headGroup.add(helmetMesh);

      const brimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.28), helmetMat);
      brimMesh.position.set(0, 0.06, 0.05);
      headGroup.add(brimMesh);

      // Headlamp LED + Conical Beam
      const headlampLens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12),
        new THREE.MeshBasicMaterial({ color: 0xecfeff })
      );
      headlampLens.rotation.x = Math.PI / 2;
      headlampLens.position.set(0, 0.1, 0.16);
      headGroup.add(headlampLens);

      const headlampSpot = new THREE.SpotLight(0xecfeff, 3.5, 9, Math.PI / 8, 0.4);
      headlampSpot.position.set(0, 0.1, 0.18);
      const headlampTarget = new THREE.Object3D();
      headlampTarget.position.set(0, -0.4, 4.0);
      headGroup.add(headlampTarget);
      headlampSpot.target = headlampTarget;
      headGroup.add(headlampSpot);

      // Headlamp subtle volumetric ray
      const headRayGeo = new THREE.ConeGeometry(0.7, 4.5, 16, 1, true);
      headRayGeo.translate(0, 2.25, 0);
      headRayGeo.rotateX(-Math.PI / 2);
      const headRayMesh = new THREE.Mesh(headRayGeo, headlightBeamMat);
      headRayMesh.position.set(0, 0.1, 0.18);
      headGroup.add(headRayMesh);

      torsoGroup.add(headGroup);

      // Left & Right Arms
      const armGeo = new THREE.BoxGeometry(0.1, 0.38, 0.1);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.24, 0.18, 0);
      const leftArmMesh = new THREE.Mesh(armGeo, suitMat);
      leftArmMesh.position.y = -0.19;
      leftArm.add(leftArmMesh);
      torsoGroup.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.24, 0.18, 0);
      const rightArmMesh = new THREE.Mesh(armGeo, suitMat);
      rightArmMesh.position.y = -0.19;
      rightArm.add(rightArmMesh);

      // Handheld Geotechnical Strata Scanner / Tablet
      const tabletMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.22, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.6 })
      );
      tabletMesh.position.set(0.04, -0.38, 0.12);
      tabletMesh.rotation.x = 0.5;
      rightArm.add(tabletMesh);

      torsoGroup.add(rightArm);
      miner.add(torsoGroup);

      // Left & Right Legs
      const legGeo = new THREE.BoxGeometry(0.12, 0.44, 0.12);

      const leftLeg = new THREE.Group();
      leftLeg.position.set(-0.1, 0.68, 0);
      const leftLegMesh = new THREE.Mesh(legGeo, suitMat);
      leftLegMesh.position.y = -0.22;
      leftLeg.add(leftLegMesh);

      const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.22), bootMat);
      leftBoot.position.set(0, -0.42, 0.04);
      leftLeg.add(leftBoot);
      miner.add(leftLeg);

      const rightLeg = new THREE.Group();
      rightLeg.position.set(0.1, 0.68, 0);
      const rightLegMesh = new THREE.Mesh(legGeo, suitMat);
      rightLegMesh.position.y = -0.22;
      rightLeg.add(rightLegMesh);

      const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.22), bootMat);
      rightBoot.position.set(0, -0.42, 0.04);
      rightLeg.add(rightBoot);
      miner.add(rightLeg);

      scene.add(miner);

      return {
        group: miner,
        torso: torsoGroup,
        head: headGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        isWalking
      };
    };

    // Miner 1: Lead Geotechnical Surveyor patrolling near the haul road shoulder
    const surveyor = createMiner(new THREE.Vector3(-1.8, -1.8, -1.8), true);
    // Miner 2: Secondary Safety Inspector in midground
    const safetyInspector = createMiner(new THREE.Vector3(-3.4, -1.8, -5.2), true);

    // -------------------------------------------------------------------------
    // 7. ATMOSPHERIC COAL DUST PARTICULATE FIELD
    // -------------------------------------------------------------------------
    const dustCount = 1600;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustVelocities = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 18;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 8 + 0.5;
      dustPositions[i * 3 + 2] = -Math.random() * 16 + 2;

      dustVelocities[i * 3] = (Math.random() - 0.5) * 0.015;
      dustVelocities[i * 3 + 1] = -Math.random() * 0.008 - 0.002;
      dustVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.08,
      map: dustTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const dustField = new THREE.Points(dustGeo, dustMat);
    scene.add(dustField);

    // -------------------------------------------------------------------------
    // 8. TIRE DUST EMITTER TRAIL
    // -------------------------------------------------------------------------
    const tireDustCount = 120;
    const tireDustGeo = new THREE.BufferGeometry();
    const tireDustPos = new Float32Array(tireDustCount * 3);
    const tireDustLife = new Float32Array(tireDustCount);

    for (let i = 0; i < tireDustCount; i++) {
      tireDustPos[i * 3] = truckGroup.position.x + (Math.random() - 0.5) * 1.5;
      tireDustPos[i * 3 + 1] = -1.7 + Math.random() * 0.2;
      tireDustPos[i * 3 + 2] = truckGroup.position.z - 1.2;
      tireDustLife[i] = Math.random();
    }
    tireDustGeo.setAttribute('position', new THREE.BufferAttribute(tireDustPos, 3));

    const tireDustMat = new THREE.PointsMaterial({
      color: 0x857564,
      size: 0.16,
      map: dustTexture,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });
    const tireDustEmitter = new THREE.Points(tireDustGeo, tireDustMat);
    scene.add(tireDustEmitter);

    // -------------------------------------------------------------------------
    // 9. ANIMATION & RENDER LOOP
    // -------------------------------------------------------------------------
    const clock = new THREE.Clock();
    let animFrameId: number;

    const baseTruckX = 2.4;
    const baseTruckZ = -3.2;
    let truckTravelZ = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      const currentMode = stateRef.current.lightingMode;
      const isMoving = stateRef.current.truckMoving;

      // 9a. Vein Shimmer & Gantry Flicker
      veinShaderMat.uniforms.uTime.value = elapsedTime;
      veinShaderMat.uniforms.uAlertMode.value = currentMode === 'emergency' ? 1.0 : 0.0;

      // Subtle atmospheric flicker of overhead gantry
      const gantryFlicker = 1.0 + 0.08 * Math.sin(elapsedTime * 9.3) + 0.05 * Math.sin(elapsedTime * 23.1);
      gantrySpotLight.intensity = (currentMode === 'emergency' ? 2.5 : 6.0) * gantryFlicker;
      rayConeMat.opacity = (currentMode === 'emergency' ? 0.1 : 0.22) * gantryFlicker;

      // 9b. Truck Kinematics & Wheel Rotation
      if (isMoving) {
        // Slow cinematic patrol: advances forward and backward along haul road
        const travelSpeed = 0.85; // units per second
        const patrolCycle = Math.sin(elapsedTime * 0.25);
        truckTravelZ = patrolCycle * 2.8;

        // Subtle road curve steering
        const steeringAngle = Math.cos(elapsedTime * 0.25) * 0.12;
        truckGroup.position.x = baseTruckX + steeringAngle * 0.35;
        truckGroup.position.z = baseTruckZ + truckTravelZ;
        truckGroup.rotation.y = steeringAngle * 0.5;
        frontLeftWheel.rotation.y = steeringAngle;
        frontRightWheel.rotation.y = steeringAngle;

        // Wheel rolling rotation based on distance
        const rollSpeed = travelSpeed * (patrolCycle >= 0 ? 1 : -1) * delta * 4.0;
        wheelMeshes.forEach((w) => {
          w.rotation.x += rollSpeed;
        });

        // Authentic diesel engine rumble & road vibration
        const rumble = Math.sin(elapsedTime * 22.0) * 0.012 + Math.sin(elapsedTime * 7.5) * 0.008;
        truckGroup.position.y = -1.8 + rumble;

        stateRef.current.distanceTraveled += Math.abs(rollSpeed * 0.55);
        const curSpd = Math.round(12 + Math.abs(patrolCycle) * 6);
        stateRef.current.speed = curSpd;
        if (Math.floor(elapsedTime * 2) % 4 === 0) {
          setTruckSpeed(curSpd);
        }
      } else {
        // Idling rumble
        truckGroup.position.x = baseTruckX;
        truckGroup.position.y = -1.8 + Math.sin(elapsedTime * 18.0) * 0.006;
        stateRef.current.speed = 0;
        if (Math.floor(elapsedTime * 2) % 4 === 0) {
          setTruckSpeed(0);
        }
      }

      // Strobe warning beacon rotation & flash
      beaconMesh.rotation.y += delta * 8.0;
      const beaconFlash = (Math.sin(elapsedTime * 12.0) + 1.0) * 0.5;
      beaconLight.intensity = beaconFlash * (currentMode === 'emergency' ? 4.0 : 2.0);

      // Headlight mode response
      if (currentMode === 'highbeam') {
        leftSpot.intensity = 14.0;
        rightSpot.intensity = 14.0;
        leftBeamMesh.material.opacity = 0.55;
        rightBeamMesh.material.opacity = 0.55;
      } else if (currentMode === 'emergency') {
        const hazardBlink = Math.sin(elapsedTime * 7.0) > 0 ? 1.0 : 0.2;
        leftSpot.intensity = 4.0 * hazardBlink;
        rightSpot.intensity = 4.0 * hazardBlink;
        leftBeamMesh.material.opacity = 0.18 * hazardBlink;
        rightBeamMesh.material.opacity = 0.18 * hazardBlink;
      } else {
        leftSpot.intensity = 8.0;
        rightSpot.intensity = 8.0;
        leftBeamMesh.material.opacity = 0.32;
        rightBeamMesh.material.opacity = 0.32;
      }

      // 9c. Animated Miners Kinematic Walk Cycles
      // Miner 1: Lead Surveyor
      const walkFreq = 3.4;
      const t1 = elapsedTime * walkFreq;
      surveyor.leftLeg.rotation.x = Math.sin(t1) * 0.55;
      surveyor.rightLeg.rotation.x = Math.sin(t1 + Math.PI) * 0.55;
      surveyor.leftArm.rotation.x = Math.sin(t1 + Math.PI) * 0.45;
      surveyor.rightArm.rotation.x = Math.sin(t1) * 0.25; // holding scanner
      surveyor.torso.position.y = 0.9 + Math.abs(Math.sin(t1 * 2)) * 0.035;
      surveyor.head.rotation.y = Math.sin(elapsedTime * 0.8) * 0.25; // looking around tunnel
      // Slight slow patrol path along road shoulder
      surveyor.group.position.z = -1.8 + Math.sin(elapsedTime * 0.18) * 1.6;

      // Miner 2: Inspector
      const t2 = (elapsedTime + 1.2) * walkFreq * 0.95;
      safetyInspector.leftLeg.rotation.x = Math.sin(t2) * 0.45;
      safetyInspector.rightLeg.rotation.x = Math.sin(t2 + Math.PI) * 0.45;
      safetyInspector.leftArm.rotation.x = Math.sin(t2 + Math.PI) * 0.35;
      safetyInspector.rightArm.rotation.x = Math.sin(t2) * 0.35;
      safetyInspector.torso.position.y = 0.9 + Math.abs(Math.sin(t2 * 2)) * 0.025;
      safetyInspector.group.position.z = -5.2 + Math.sin(elapsedTime * 0.12) * 1.2;

      // 9d. Airborne Dust Particles Drift
      const dPositions = dustGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const idx = i * 3;
        dPositions[idx] += dustVelocities[idx] + Math.sin(elapsedTime * 0.4 + idx) * 0.003;
        dPositions[idx + 1] += dustVelocities[idx + 1];
        dPositions[idx + 2] += dustVelocities[idx + 2] + 0.005;

        // Reset particles that drift out of bounds
        if (dPositions[idx + 1] < -1.8) dPositions[idx + 1] = 4.5;
        if (dPositions[idx + 2] > 4.0) dPositions[idx + 2] = -15.0;
        if (dPositions[idx] > 8.0) dPositions[idx] = -8.0;
        if (dPositions[idx] < -8.0) dPositions[idx] = 8.0;
      }
      dustGeo.attributes.position.needsUpdate = true;

      // Tire dust emitter logic
      const tPositions = tireDustGeo.attributes.position.array as Float32Array;
      if (isMoving) {
        for (let i = 0; i < tireDustCount; i++) {
          const idx = i * 3;
          tireDustLife[i] += delta * 1.5;
          tPositions[idx + 1] += delta * 0.25; // rise slowly
          tPositions[idx] += (Math.random() - 0.5) * 0.01;

          if (tireDustLife[i] > 1.0) {
            tireDustLife[i] = 0;
            // Respawn behind rear wheels
            tPositions[idx] = truckGroup.position.x + (Math.random() - 0.5) * 1.8;
            tPositions[idx + 1] = -1.75;
            tPositions[idx + 2] = truckGroup.position.z - 1.4;
          }
        }
        tireDustGeo.attributes.position.needsUpdate = true;
      }

      // 9e. Camera Lerp & Parallax Mode Handling
      const mouse = stateRef.current.mouse;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const camMode = stateRef.current.cameraMode;

      if (camMode === 'chase') {
        // Track the haul truck smoothly
        const targetCamX = truckGroup.position.x * 0.6 + 0.8;
        const targetCamY = 0.9;
        const targetCamZ = truckGroup.position.z + 5.5;

        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.position.z += (targetCamZ - camera.position.z) * 0.06;
        camera.lookAt(truckGroup.position.x, 0.4, truckGroup.position.z);
      } else if (camMode === 'inspector') {
        // Focus on the geotechnical surveyor
        camera.position.x += (-0.8 + mouse.x * 0.4 - camera.position.x) * 0.06;
        camera.position.y += (0.4 + mouse.y * 0.25 - camera.position.y) * 0.06;
        camera.position.z += (2.2 - camera.position.z) * 0.06;
        camera.lookAt(surveyor.group.position.x, 0.2, surveyor.group.position.z);
      } else {
        // Default Cinematic Parallax
        const targetX = mouse.x * 0.75;
        const targetY = 0.6 + mouse.y * 0.4;
        const targetZ = 5.2;

        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.position.z += (targetZ - camera.position.z) * 0.05;
        camera.lookAt(mouse.x * 0.35, 0.1 + mouse.y * 0.15, -6);
      }

      renderer.render(scene, camera);

      // Push telemetry callback
      if (onTelemetryUpdate && Math.floor(elapsedTime * 4) % 2 === 0) {
        onTelemetryUpdate({
          speed: stateRef.current.speed,
          distance: Math.round(stateRef.current.distanceTraveled),
          status: currentMode === 'emergency' ? 'EVACUATION ALERT' : 'HAUL ROUTE OPTIMAL'
        });
      }
    };

    animate();

    // -------------------------------------------------------------------------
    // 10. RESIZE & CLEANUP
    // -------------------------------------------------------------------------
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      bgTexture.dispose();
      lightConeTexture.dispose();
      dustTexture.dispose();
      bgPlaneGeo.dispose();
      bgPlaneMat.dispose();
      veinShaderMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      tireDustGeo.dispose();
      tireDustMat.dispose();
      renderer.dispose();
    };
  }, [handleMouseMove, onTelemetryUpdate]);

  return (
    <div
      ref={mountRef}
      className={`mine-3d-hero-canvas-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {/* Interactive 3D Fleet & Environment Controls HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          right: '2.5rem',
          zIndex: 10,
          background: 'rgba(6, 10, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '14px',
          padding: hudMinimized ? '0.65rem 1rem' : '1.15rem',
          color: '#f8fafc',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(245, 158, 11, 0.15)',
          minWidth: hudMinimized ? 'auto' : '280px',
          maxWidth: '340px',
          pointerEvents: 'auto',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* HUD Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hudMinimized ? 0 : '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: lightingMode === 'emergency' ? '#ef4444' : '#10b981',
                boxShadow: lightingMode === 'emergency' ? '0 0 10px #ef4444' : '0 0 10px #10b981'
              }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fbbf24' }}>
              Subterranean 3D Fleet HUD
            </span>
          </div>

          <button
            onClick={() => setHudMinimized(!hudMinimized)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '6px',
              color: '#94a3b8',
              padding: '2px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={hudMinimized ? 'Expand Telemetry HUD' : 'Minimize Telemetry HUD'}
          >
            {hudMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {!hudMinimized && (
          <>
            {/* Live Telemetry Readout */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.65rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Haul Unit</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>CAT-777D</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Speed</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                  {truckMoving ? `${truckSpeed} km/h` : 'IDLE'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Strata AI</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>ACTIVE</div>
              </div>
            </div>

            {/* Lighting Mode Selector */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} color="#fbbf24" /> Lighting Mode:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                <button
                  onClick={() => setLightingMode('standard')}
                  style={{
                    background: lightingMode === 'standard' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: lightingMode === 'standard' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: lightingMode === 'standard' ? '#fbbf24' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Standard
                </button>
                <button
                  onClick={() => setLightingMode('highbeam')}
                  style={{
                    background: lightingMode === 'highbeam' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: lightingMode === 'highbeam' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: lightingMode === 'highbeam' ? '#38bdf8' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  High Beam
                </button>
                <button
                  onClick={() => setLightingMode('emergency')}
                  style={{
                    background: lightingMode === 'emergency' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: lightingMode === 'emergency' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: lightingMode === 'emergency' ? '#ef4444' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Alert Flash
                </button>
              </div>
            </div>

            {/* Camera View Selector */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={12} color="#38bdf8" /> Camera View:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                <button
                  onClick={() => setCameraMode('parallax')}
                  style={{
                    background: cameraMode === 'parallax' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: cameraMode === 'parallax' ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: cameraMode === 'parallax' ? '#22d3ee' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  3D Parallax
                </button>
                <button
                  onClick={() => setCameraMode('chase')}
                  style={{
                    background: cameraMode === 'chase' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: cameraMode === 'chase' ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: cameraMode === 'chase' ? '#22d3ee' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Truck Chase
                </button>
                <button
                  onClick={() => setCameraMode('inspector')}
                  style={{
                    background: cameraMode === 'inspector' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: cameraMode === 'inspector' ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: cameraMode === 'inspector' ? '#22d3ee' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Surveyor
                </button>
              </div>
            </div>

            {/* Truck Drive / Pause Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setTruckMoving(!truckMoving)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: truckMoving ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: truckMoving ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)',
                  color: truckMoving ? '#34d399' : '#fbbf24',
                  borderRadius: '6px',
                  padding: '0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Truck size={14} />
                {truckMoving ? 'Haul Route: Active' : 'Haul Route: Paused'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mine-3d-hero-canvas-container > div:last-child {
            bottom: 1rem !important;
            right: 1rem !important;
            max-width: calc(100vw - 2rem) !important;
          }
        }
      `}</style>
    </div>
  );
};
