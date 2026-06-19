// @ts-nocheck
import * as ThreeLib from 'three';
import PeerConstructor from 'peerjs';

type Cleanup = () => void;

export function initNeonBruiser(): Cleanup {
    const THREE = ThreeLib;
    const Peer = PeerConstructor;

// --- SOUND EFFECTS SYNTHESIZER (Web Audio API) ---
        const AudioSynth = {
            ctx: null,
            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
            },
            getSpatialVolume(pos, maxDist = 80) {
                if (!pos || !camera) return 1.0;
                const dx = pos.x - camera.position.x;
                const dy = pos.y - camera.position.y;
                const dz = pos.z - camera.position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist >= maxDist) return 0.0;
                return Math.max(0.0, 1.0 - dist / maxDist);
            },
            playWhoosh(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 60);
                if (vol <= 0.01) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
                
                gain.gain.setValueAtTime(0.2 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(now + 0.13);
            },
            playHit(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 65);
                if (vol <= 0.01) return;
                
                // Low thud
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.linearRampToValueAtTime(30, now + 0.15);
                
                gain.gain.setValueAtTime(0.4 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.16);
                
                // Add noise crunch
                const bufferSize = this.ctx.sampleRate * 0.1;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 250;
                
                const noiseGain = this.ctx.createGain();
                noiseGain.gain.setValueAtTime(0.15 * vol, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);
                
                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(this.ctx.destination);
                
                noise.start();
                noise.stop(now + 0.11);
            },
            playClang(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 70);
                if (vol <= 0.01) return;

                const freqs = [350, 480, 580, 850, 1100];
                freqs.forEach(f => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, now);
                    gain.gain.setValueAtTime(0.12 * vol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(now + 0.85);
                });
                
                // Metal clatter noise
                const bufferSize = this.ctx.sampleRate * 0.4;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 600;
                const noiseGain = this.ctx.createGain();
                noiseGain.gain.setValueAtTime(0.2 * vol, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);
                
                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(this.ctx.destination);
                noise.start();
                noise.stop(now + 0.45);
            },
            playTwang(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 60);
                if (vol <= 0.01) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);
                
                gain.gain.setValueAtTime(0.25 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(now + 0.2);
            },
            playWin() {
                this.init();
                const now = this.ctx.currentTime;
                const notes = [261.63, 329.63, 392.00, 523.25];
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                    gain.gain.setValueAtTime(0.15, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.35);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.4);
                });
            },
            playLose() {
                this.init();
                const now = this.ctx.currentTime;
                const notes = [220.00, 207.65, 196.00, 174.61];
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + i * 0.15);
                    osc.frequency.linearRampToValueAtTime(freq - 20, now + i * 0.15 + 0.2);
                    gain.gain.setValueAtTime(0.15, now + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.15);
                    osc.stop(now + i * 0.15 + 0.3);
                });
            },
            playClack(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 60);
                if (vol <= 0.01) return;
                
                for (let i = 0; i < 3; i++) {
                    const timeOffset = i * 0.08;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(800 + Math.random() * 400, now + timeOffset);
                    gain.gain.setValueAtTime(0.15 * vol, now + timeOffset);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.04);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + timeOffset);
                    osc.stop(now + timeOffset + 0.05);
                }
            },
            playMoan(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 60);
                if (vol <= 0.01) return;
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100 + Math.random() * 20, now);
                osc.frequency.linearRampToValueAtTime(65, now + 1.2);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(450, now);
                
                gain.gain.setValueAtTime(0.18 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 1.2);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(now + 1.25);
            },
            playHrrm(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 60);
                if (vol <= 0.01) return;
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(125, now);
                osc.frequency.linearRampToValueAtTime(85, now + 0.55);
                
                gain.gain.setValueAtTime(0.15 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.55);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(now + 0.6);
            },
            playBuzz(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 45);
                if (vol <= 0.01) return;
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200 + Math.random() * 40, now);
                osc.frequency.linearRampToValueAtTime(220, now + 0.45);
                
                gain.gain.setValueAtTime(0.04 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                
                osc.start();
                osc.stop(now + 0.5);
            },
            playPickup() {
                this.init();
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.09);
            },
            playEating() {
                this.init();
                const now = this.ctx.currentTime;
                for (let j = 0; j < 3; j++) {
                    const tStart = now + j * 0.15;
                    const bufferSize = this.ctx.sampleRate * 0.08;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noise = this.ctx.createBufferSource();
                    noise.buffer = buffer;
                    
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.value = 180 + Math.random() * 100;
                    
                    const gain = this.ctx.createGain();
                    gain.gain.setValueAtTime(0.15, tStart);
                    gain.gain.exponentialRampToValueAtTime(0.001, tStart + 0.08);
                    
                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    noise.start(tStart);
                    noise.stop(tStart + 0.09);
                }
                
                setTimeout(() => {
                    if (!this.ctx) return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.16);
                }, 450);
            },
            playAnimalSound(type, pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 55);
                if (vol <= 0.01) return;
                
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.08 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                
                if (type === 'pig') {
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, now);
                    osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.value = 300;
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(now + 0.22);
                } else if (type === 'cow') {
                    const osc = this.ctx.createOscillator();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(110, now);
                    osc.frequency.linearRampToValueAtTime(80, now + 0.6);
                    gain.gain.setValueAtTime(0.12 * vol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(now + 0.62);
                } else if (type === 'sheep') {
                    const osc = this.ctx.createOscillator();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(220, now);
                    const mod = this.ctx.createOscillator();
                    mod.frequency.value = 16;
                    const modGain = this.ctx.createGain();
                    modGain.gain.value = 15;
                    mod.connect(modGain);
                    modGain.connect(osc.frequency);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    mod.start();
                    osc.start();
                    mod.stop(now + 0.35);
                    osc.stop(now + 0.35);
                } else if (type === 'chicken') {
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(450, now);
                    osc.frequency.setValueAtTime(550, now + 0.05);
                    gain.gain.setValueAtTime(0.08 * vol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(now + 0.13);
                }
            }
        };

        // --- GAME CONTROLS & NETWORKING ---
        let peer = null;
        let conn = null;
        let peerId = null;
        let isHost = false;
        let isConnected = false;

        const elLobby = document.getElementById('lobby');
        const elHud = document.getElementById('hud');
        const elCrosshair = document.getElementById('crosshair');
        const elGameOver = document.getElementById('game-over');
        const elStatus = document.getElementById('status-text');
        const elPeerIdDisplay = document.getElementById('peer-id-display');
        const elCopyBtn = document.getElementById('copy-id-btn');
        const elJoinInput = document.getElementById('join-id-input');
        const elBtnHost = document.getElementById('btn-host');
        const elBtnSolo = document.getElementById('btn-solo');
        const elBtnJoin = document.getElementById('btn-join');
        const elGameOverTitle = document.getElementById('game-over-title');
        const elGameOverSubtitle = document.getElementById('game-over-subtitle');
        const elBtnRematch = document.getElementById('btn-rematch');
        const elRematchStatus = document.getElementById('rematch-status');
        const elToast = document.getElementById('toast');
        const elMapOverlay = document.getElementById('map-overlay');
        const elCloseMapBtn = document.getElementById('btn-close-map');

        // --- CHARACTER CUSTOMIZATION PREVIEW & UI LOGIC ---
        let previewScene, previewCamera, previewRenderer, previewMeshGroup, previewAnimationId;
        let previewSkinMat, previewHairMat, previewEyeMat, previewShirtMat, previewPantsMat;

        const elBtnCustomizePlayer = document.getElementById('btn-customize-player');
        const elCustomizeScreen = document.getElementById('customize-screen');
        const elBtnSaveCustomize = document.getElementById('btn-save-customize');

        elBtnCustomizePlayer.addEventListener('click', () => {
            elLobby.style.display = 'none';
            elCustomizeScreen.style.display = 'flex';
            updateActiveSwatchesInUI();
            initCustomizePreview();
        });

        elBtnSaveCustomize.addEventListener('click', () => {
            stopCustomizePreview();
            elCustomizeScreen.style.display = 'none';
            elLobby.style.display = 'flex';
        });

        function updateActiveSwatchesInUI() {
            const categories = ['skin', 'hair', 'eye', 'shirt', 'pants'];
            categories.forEach(cat => {
                const group = document.querySelector(`.color-picker-group[data-category="${cat}"]`);
                if (group) {
                    const swatches = group.querySelectorAll('.color-swatch');
                    swatches.forEach(swatch => {
                        if (swatch.getAttribute('data-color').toLowerCase() === myAppearance[cat].toLowerCase()) {
                            swatch.classList.add('active');
                        } else {
                            swatch.classList.remove('active');
                        }
                    });
                }
            });
        }

        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const parent = swatch.parentElement;
                const cat = parent.getAttribute('data-category');
                const color = swatch.getAttribute('data-color');
                
                myAppearance[cat] = color;
                
                parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                
                updatePreviewColors();
                
                localStorage.setItem('appearance_' + cat, color);
            });
        });

        function initCustomizePreview() {
            const container = document.getElementById('character-preview-canvas');
            if (!container) return;

            container.innerHTML = '';

            previewScene = new THREE.Scene();
            
            const ambient = new THREE.AmbientLight(0xffffff, 0.7);
            previewScene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
            dirLight.position.set(2, 4, 3);
            previewScene.add(dirLight);

            previewCamera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 10);
            previewCamera.position.set(0, 1.25, 3.0);
            previewCamera.lookAt(0, 1.1, 0);

            previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            previewRenderer.setSize(container.clientWidth, container.clientHeight);
            previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(previewRenderer.domElement);

            previewMeshGroup = new THREE.Group();
            previewScene.add(previewMeshGroup);

            previewSkinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.skin), roughness: 0.8 });
            previewShirtMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.shirt), roughness: 0.7 });
            previewPantsMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.pants), roughness: 0.8 });
            previewHairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.hair), roughness: 0.9 });
            previewEyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(myAppearance.eye) });
            const previewShoesMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.8 });

            // Torso (split into shirt and pants/shorts - slender and short T-shirt style)
            const shirtTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.55, 12), previewShirtMat);
            shirtTorso.position.y = 1.175;
            previewMeshGroup.add(shirtTorso);

            const pantsTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.55, 12), previewPantsMat);
            pantsTorso.position.y = 0.625;
            previewMeshGroup.add(pantsTorso);

            // Head
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), previewSkinMat);
            head.position.y = 1.6;
            previewMeshGroup.add(head);

            // Eyes (small dark pupils direct on face matching reference image)
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), previewEyeMat);
            eyeL.position.set(-0.07, 0.05, 0.245);
            head.add(eyeL);

            const eyeR = eyeL.clone();
            eyeR.position.x = 0.07;
            head.add(eyeR);

            // Nose
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.075, 0.06), previewSkinMat);
            nose.position.set(0, -0.02, 0.24);
            head.add(nose);

            // Hair (layered skullcap wrapping top, sides, and back matching reference image - no skin clipping)
            const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.17, 0.37), previewHairMat);
            hairTop.position.set(0, 0.195, -0.055);
            head.add(hairTop);

            const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.20, 0.09), previewHairMat);
            hairBack.position.set(0, 0.01, -0.195);
            head.add(hairBack);

            const hairL = new THREE.Mesh(new THREE.BoxGeometry(0.037, 0.13, 0.28), previewHairMat);
            hairL.position.set(-0.23, 0.046, -0.01);
            head.add(hairL);

            const hairR = hairL.clone();
            hairR.position.x = 0.23;
            head.add(hairR);

            // Left Arm (attached to shoulder)
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.65, 0.11), previewSkinMat);
            armL.position.set(-0.28, 1.175, 0);
            previewMeshGroup.add(armL);
            const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.3, 0.13), previewShirtMat);
            sleeveL.position.y = 0.17;
            armL.add(sleeveL);

            // Right Arm (attached to shoulder)
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.65, 0.11), previewSkinMat);
            armR.position.set(0.28, 1.175, 0);
            previewMeshGroup.add(armR);
            const sleeveR = sleeveL.clone();
            armR.add(sleeveR);

            // Left Leg (shorts + bare leg + shoes - attached to hips)
            const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.14), previewSkinMat);
            legL.position.set(-0.10, 0.38, 0);
            previewMeshGroup.add(legL);

            const shortsL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), previewPantsMat);
            shortsL.position.y = 0.185;
            legL.add(shortsL);

            const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.2), previewShoesMat);
            shoeL.position.set(0, -0.38, 0.03);
            legL.add(shoeL);

            // Right Leg (attached to hips)
            const legR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.14), previewSkinMat);
            legR.position.set(0.10, 0.38, 0);
            previewMeshGroup.add(legR);

            const shortsR = shortsL.clone();
            legR.add(shortsR);
            const shoeR = shoeL.clone();
            legR.add(shoeR);

            container.addEventListener('mousedown', (e) => { isDragging = true; previousMousePosition.x = e.clientX; });
            window.addEventListener('mouseup', () => { isDragging = false; });
            container.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - previousMousePosition.x;
                previewMeshGroup.rotation.y += deltaX * 0.015;
                previousMousePosition.x = e.clientX;
            });

            // Touch interaction
            container.addEventListener('touchstart', (e) => { isDragging = true; previousMousePosition.x = e.touches[0].clientX; });
            window.addEventListener('touchend', () => { isDragging = false; });
            container.addEventListener('touchmove', (e) => {
                if (!isDragging || !e.touches.length) return;
                const deltaX = e.touches[0].clientX - previousMousePosition.x;
                previewMeshGroup.rotation.y += deltaX * 0.015;
                previousMousePosition.x = e.touches[0].clientX;
            });

            function animatePreview() {
                if (!previewRenderer) return;
                previewAnimationId = requestAnimationFrame(animatePreview);
                if (!isDragging) {
                    previewMeshGroup.rotation.y += 0.006;
                }
                previewRenderer.render(previewScene, previewCamera);
            }
            animatePreview();
        }

        function stopCustomizePreview() {
            if (previewAnimationId) {
                cancelAnimationFrame(previewAnimationId);
                previewAnimationId = null;
            }
            previewScene = null;
            previewCamera = null;
            previewRenderer = null;
            previewMeshGroup = null;
        }

        function updatePreviewColors() {
            if (previewSkinMat) previewSkinMat.color.set(myAppearance.skin);
            if (previewShirtMat) previewShirtMat.color.set(myAppearance.shirt);
            if (previewPantsMat) previewPantsMat.color.set(myAppearance.pants);
            if (previewHairMat) previewHairMat.color.set(myAppearance.hair);
            if (previewEyeMat) previewEyeMat.color.set(myAppearance.eye);
        }

        function generateShortId() {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = 0; i < 5; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        // Initializing PeerJS
        let reconnectInterval = null;
        function initPeer() {
            if (reconnectInterval) clearInterval(reconnectInterval);

            const shortId = generateShortId();
            peer = new Peer(shortId, { debug: 2 });

            peer.on('open', (id) => {
                peerId = id;
                elPeerIdDisplay.value = id;
                elCopyBtn.disabled = false;
                elStatus.innerText = "Connected to network. Share ID to start game.";
                elBtnHost.innerText = "Host Game (Room Ready)";
                elBtnHost.disabled = false;
                
                const urlParams = new URLSearchParams(window.location.search);
                const joinId = urlParams.get('join');
                if (joinId) {
                    const cleanJoinId = joinId.trim().toUpperCase();
                    elJoinInput.value = cleanJoinId;
                    connectToOpponent(cleanJoinId);
                }
            });

            peer.on('connection', (incomingConn) => {
                if (isConnected) {
                    incomingConn.close();
                    return;
                }
                conn = incomingConn;
                isHost = true;
                setupConnection();
            });

            peer.on('error', (err) => {
                console.error("PeerJS Error:", err);
                if (err.type === 'unavailable-id') {
                    setTimeout(() => {
                        initPeer();
                    }, 300);
                    return;
                }
                elStatus.innerText = "Connection Error: " + err.type;
            });

            // Keepalive to automatically reconnect if broker server connection drops
            reconnectInterval = setInterval(() => {
                if (peer && peer.disconnected && !peer.destroyed) {
                    console.log("Peer disconnected from broker server. Reconnecting...");
                    peer.reconnect();
                }
            }, 6000);
        }

        // Copy Room Link
        elCopyBtn.addEventListener('click', () => {
            if (!peerId) return;
            const shareLink = window.location.origin + window.location.pathname + '?join=' + peerId;
            navigator.clipboard.writeText(shareLink).then(() => {
                elToast.classList.add('show');
                setTimeout(() => elToast.classList.remove('show'), 2000);
            }).catch(err => {
                navigator.clipboard.writeText(peerId);
                elToast.innerText = "Copied Room ID!";
                elToast.classList.add('show');
                setTimeout(() => elToast.classList.remove('show'), 2000);
            });
        });

        elBtnHost.addEventListener('click', () => {
            elStatus.innerText = "Waiting for an opponent to join...";
        });

        elBtnSolo.addEventListener('click', () => {
            isHost = true;
            isConnected = false;
            startGame();
        });

        elBtnJoin.addEventListener('click', () => {
            const targetId = elJoinInput.value.trim().toUpperCase();
            if (!targetId) {
                elStatus.innerText = "Please enter a valid Room ID.";
                return;
            }
            connectToOpponent(targetId);
        });

        function connectToOpponent(targetId) {
            const cleanId = targetId.trim().toUpperCase();
            elStatus.innerText = "Connecting to room " + cleanId + "...";
            conn = peer.connect(cleanId);
            isHost = false;
            setupConnection();
        }

        function setupConnection() {
            const handleOpen = () => {
                isConnected = true;
                elStatus.innerText = "Connection established! Preparing game...";
                
                // Sync customized character appearance
                sendNetworkMessage({
                    type: 'appearance',
                    skin: myAppearance.skin,
                    hair: myAppearance.hair,
                    eye: myAppearance.eye,
                    shirt: myAppearance.shirt,
                    pants: myAppearance.pants
                });

                setTimeout(() => {
                    startGame();
                }, 1000);
            };

            if (conn.open) {
                handleOpen();
            } else {
                conn.on('open', handleOpen);
            }

            conn.on('data', (data) => {
                handleNetworkMessage(data);
            });

            conn.on('close', () => {
                handleDisconnect();
            });
        }

        function handleDisconnect() {
            isConnected = false;
            exitPointerLock();
            elLobby.style.display = 'flex';
            elHud.style.display = 'none';
            elCrosshair.style.display = 'none';
            elGameOver.style.display = 'none';
            elMapOverlay.style.display = 'none';
            elStatus.innerText = "Opponent disconnected. Room reset.";
            resetGameScene();
        }

        // --- THREE.JS GAME ENGINE SETUP ---
        let scene, camera, renderer, clock;
        let isLocked = false;
        let myHealth = 100;
        let oppHealth = 100;
        let gameActive = false;

        // Turret Variables
        let turretGroup = null;
        let turretHeadGroup = null;
        let turretBarrel = null;
        let turretPos = new THREE.Vector3();
        let inTurret = false;
        let turretOccupant = null; // null, 'local', or 'peer'
        let turretActive = false; // whether turret is spawned
        const turretShells = []; // local shells
        const peerShells = []; // peer shells
        const TURRET_COOLDOWN = 1200;
        let lastTurretShootTime = 0;
        let lastTurretSyncTime = 0;

        let myAppearance = {
            skin: localStorage.getItem('appearance_skin') || '#ffdbac',
            hair: localStorage.getItem('appearance_hair') || '#2c1d11',
            eye: localStorage.getItem('appearance_eye') || '#0a1128',
            shirt: localStorage.getItem('appearance_shirt') || '#2b6cb0',
            pants: localStorage.getItem('appearance_pants') || '#2d3748'
        };
        let opponentAppearance = {
            skin: '#ffdbac',
            hair: '#2c1d11',
            eye: '#0a1128',
            shirt: '#2b6cb0',
            pants: '#2d3748'
        };

        // Zombie Variables
        let zombies = []; // Host-side zombie state and meshes
        let clientZombies = new Map(); // Client-side mapped visual meshes
        let lastZombieSyncTime = 0;
        let lastBeeSyncTime = 0;
        let hasSpawnedZombiesThisNight = false;
        let lastNightSpawnTime = 0;
        let isDayTime = true;

        // Lake Configuration
        const LAKE_CENTER_X = -45;
        const LAKE_CENTER_Z = 60;
        const LAKE_RADIUS = 22;
        const WATER_Y = -0.5;
        const CRATER_RADIUS = 30;

        let timeOffset = 0;
        let chatOpen = false;

        // Bush Configuration
        const BUSH_POSITIONS = [
            { x: -50, z: -50 }, // Near village
            { x: -90, z: -50 }, // Near village outskirts
            { x: 30, z: 20 },   // Plains
            { x: 0, z: -10 },   // Mid divider
            { x: -55, z: 45 },  // Near forest
            { x: 50, z: -30 }   // Plains
        ];
        let bushes = [];
        let inBush = false;
        let activeBushId = null;
        let localPlayerInvisible = false;
        let opponentInvisible = false;
        let turretEnterTime = 0;

        let villagers = [];
        let beehives = [];
        let bees = [];
        let clientBees = new Map();
        let cherryFlowers = [];
        let beesAngryAt = null;
        let beesAngerStartTime = 0;
        let skeletonArrows = [];
        let myBurnTime = 0;
        let isOpponentBurning = false;
        const fireParticles = [];
        
        // Quantum Lands Cube Variables
        let quantumCubes = [];
        let ridingCube = null;
        let lastQuantumCubesSyncTime = 0;

        // Minecraft & Animal Systems variables
        let hunger = 100;
        let lastHungerTickTime = 0;
        let lastStarveTime = 0;
        let lastRegenTime = 0;
        let selectedHotbarIndex = 0;
        let inventoryOpen = false;
        let heldItem = null;
        let hotbarItems = ['fists', 'kick', 'bow', null, null, null, null, null, null];
        let hotbarCounts = [1, 1, 1, 0, 0, 0, 0, 0, 0];
        let inventoryItems = new Array(27).fill(null);
        let inventoryCounts = new Array(27).fill(0);
        let animals = [];
        let droppedFoods = [];

        // Environment Details
        const grassClumps = [];
        let ambientLight = null; // Global reference to adjust brightness

        // Player physics
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();
        const knockbackVel = new THREE.Vector3();
        const moveForces = { forward: false, backward: false, left: false, right: false, jump: false };
        let isGrounded = true;

        // Weapons
        let activeWeapon = 'fists'; // 'fists' or 'bow'
        const PUNCH_COOLDOWN = 300;
        const KICK_COOLDOWN = 550;
        const BOW_COOLDOWN = 800;
        let lastPunchTime = 0, lastKickTime = 0, lastBowTime = 0;

        // First Person Meshes
        let firstPersonHands, rightHand, leftHand, kickerLeg, bowGroup;
        let localPunching = false, localKicking = false, localDrawingBow = false;
        let localPunchTimer = 0, localKickTimer = 0, localBowTimer = 0;

        // Projectiles
        const localArrows = [];
        const peerArrows = [];
        let portalVortices = [];
        let lastQuantumDamageTime = 0;

        // Opponent
        let opponentGroup;
        let opponentHead, opponentTorso, opponentLArm, opponentRArm, opponentLLeg, opponentRLeg;
        let targetOpponentPos = new THREE.Vector3(60, 0, 12); // Spawn Client in Plain
        let targetOpponentRotY = 0;
        let isOpponentPunching = false;
        let isOpponentKicking = false;
        let opponentPunchTimer = 0;
        let opponentKickTimer = 0;
        let isOpponentDamaged = false;
        let opponentDamageTimer = 0;

        // Visual recoil variables for hit bounce back
        const opponentRecoilPos = new THREE.Vector3();
        let opponentRecoilRotX = 0;
        let opponentRecoilRotZ = 0;
        const camHitRecoil = new THREE.Vector3();
        let camHitTilt = 0;
        const zombieRecoilMap = new Map();

        // Terrain & Decoration
        const TERRAIN_SIZE = 1200;
        let terrainGeometry;
        const houseWindows = [];
        let starField;

        // Day-Night Cycle (13.5 min total = 810s)
        // Day (8min = 480s), Midday (30s), Night (5min = 300s)
        const CYCLE_DURATION = 810; 
        let sunLight, moonLight;
        let sunSphere, moonSphere;
        let skyMesh, skyMat;

        // Radar Map State
        let mapOpen = false;
        let mapCanvas, mapCtx;
        let mapZoom = 1.0;
        let mapOffsetX = 0;
        let mapOffsetZ = 0;

        // Trash cans
        const trashCans = [];
        const trashCanCoords = [];

        // Procedural Heightmap Formula
        function getTerrainHeight(x, z) {
            if (x > 1400) {
                // Quantum Lands
                let qH = -45.0; // Abyss/Pool bottom
                
                // 1. Main Island
                const dMain = Math.sqrt(Math.pow(x - 2000, 2) + Math.pow(z, 2));
                if (dMain < 220) {
                    const w = Math.min(1.0, (220 - dMain) / 20); // 20m transition
                    const hMain = 20.0 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hMain * w);
                }
                
                // 2. Upper Island
                const dUpper = Math.sqrt(Math.pow(x - 2000, 2) + Math.pow(z - 300, 2));
                if (dUpper < 150) {
                    const w = Math.min(1.0, (150 - dUpper) / 20);
                    const hUpper = 60.0 + Math.sin(x * 0.06) * Math.cos(z * 0.06) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hUpper * w);
                }
                
                // 3. Lower Island
                const dLower = Math.sqrt(Math.pow(x - 2000, 2) + Math.pow(z + 300, 2));
                if (dLower < 150) {
                    const w = Math.min(1.0, (150 - dLower) / 20);
                    const hLower = -10.0 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hLower * w);
                }
                
                // 3b. Lower West Island (low-level, center 1700, -250)
                const dLowerWest = Math.sqrt(Math.pow(x - 1700, 2) + Math.pow(z + 250, 2));
                if (dLowerWest < 100) {
                    const w = Math.min(1.0, (100 - dLowerWest) / 20);
                    const hLowerWest = -15.0 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hLowerWest * w);
                }
                
                // 4. High Peak
                const dPeak = Math.sqrt(Math.pow(x - 2350, 2) + Math.pow(z, 2));
                if (dPeak < 130) {
                    const w = Math.min(1.0, (130 - dPeak) / 20);
                    const hPeak = 90.0 + (1.0 - dPeak / 130) * 15.0 + Math.sin(x * 0.07) * Math.cos(z * 0.07) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hPeak * w);
                }
                
                // 5. Connecting Bridges (Main to Lower, Main to Upper)
                const distFromCenter = Math.abs(x - 2000);
                if (distFromCenter < 15) {
                    const edgeWeight = Math.min(1.0, (15 - distFromCenter) / 3.0); // 3m smooth transition at edges
                    // Main to Lower (z between -220 and -150)
                    if (z >= -220 && z <= -150) {
                        const t = (z - (-220)) / (-150 - (-220)); // t goes from 0 at z=-220 to 1 at z=-150
                        const hBridge = 20.0 - t * 30.0; // Corrected: starts at 20 (Main) and goes down to -10 (Lower)
                        qH = hBridge * edgeWeight + qH * (1.0 - edgeWeight);
                    }
                    // Main to Upper (z between 150 and 220)
                    if (z >= 150 && z <= 220) {
                        const t = (z - 150) / (220 - 150); // t goes from 0 at z=150 to 1 at z=220
                        const hBridge = 60.0 - t * 40.0; // Corrected: starts at 60 (Upper) and goes down to 20 (Main)
                        qH = hBridge * edgeWeight + qH * (1.0 - edgeWeight);
                    }
                }

                // 6. Bridge between Lower Island (2000, -300) and Lower West Island (1700, -250)
                if (x >= 1800 && x <= 1850) {
                    const distFromBridgeCenter = Math.abs(z - (-275));
                    if (distFromBridgeCenter < 15) {
                        const edgeWeight = Math.min(1.0, (15 - distFromBridgeCenter) / 3.0);
                        const t = (x - 1800) / (1850 - 1800); // t goes from 0 at x=1800 to 1 at x=1850
                        const hBridge = -15.0 + t * 5.0; // goes from -15 (Lower West) to -10 (Lower)
                        qH = hBridge * edgeWeight + qH * (1.0 - edgeWeight);
                    }
                }
                
                return qH;
            }

            const r = Math.sqrt(x * x + z * z);
            if (r > 595) return 0;
            
            // Calculate distance to lake center
            const dx = x - LAKE_CENTER_X;
            const dz = z - LAKE_CENTER_Z;
            const distToLake = Math.sqrt(dx * dx + dz * dz);
            
            let h = -6.0; // Default deep ocean height
            let landH = -6.0;
            
            // 1. Main Island (Forest hills, plains, central dividing valley, etc.)
            const d1 = Math.sqrt(x*x + z*z);
            if (d1 < 210) {
                const w = Math.min(1.0, (210 - d1) / 30); // 30m shore transition
                let h1 = 0;
                
                // Hilly Forest Area (Top-Left quadrant: x < -20, z > 20)
                if (x < -20 && z > 20) {
                    h1 += Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3.5;
                    h1 += Math.cos(x * 0.03) * 1.5;
                }
                
                // Flat valley for Village (Bottom-Left quadrant: x < -30, z < -30)
                if (x < -20 && z < -20) {
                    const distToVillageCenter = Math.sqrt(Math.pow(x + 80, 2) + Math.pow(z + 80, 2));
                    if (distToVillageCenter > 30) {
                        h1 += Math.sin(x * 0.05) * 1.2;
                    }
                } else {
                    // Open Plain Area (Right-side: x > 20)
                    if (x > 20) {
                        h1 += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.4;
                    } else {
                        // Central dividing valley
                        h1 += Math.sin(x * 0.04) * Math.cos(z * 0.04) * 1.2;
                    }
                }
                
                // Carve out lake basin inside the Main Island
                if (distToLake < CRATER_RADIUS) {
                    if (distToLake >= LAKE_RADIUS) {
                        const t = (distToLake - LAKE_RADIUS) / (CRATER_RADIUS - LAKE_RADIUS);
                        const smoothT = t * t * (3 - 2 * t);
                        h1 = -0.5 * (1 - smoothT) + h1 * smoothT;
                    } else {
                        const t = distToLake / LAKE_RADIUS;
                        const bowlDepth = -5.5 + 5.0 * (t * t);
                        h1 = bowlDepth;
                    }
                }
                
                landH = Math.max(landH, -0.6 * (1 - w) + h1 * w);
            }
            
            // 2. Desert Island (center (350, -350), radius 180)
            const d2 = Math.sqrt(Math.pow(x - 350, 2) + Math.pow(z + 350, 2));
            if (d2 < 180) {
                const w = Math.min(1.0, (180 - d2) / 30);
                const h2 = 1.0 + Math.sin(x * 0.06) * Math.cos(z * 0.06) * 3.0; // Dunes
                landH = Math.max(landH, -0.6 * (1 - w) + h2 * w);
            }
            
            // 3. Cherry Island (center (-150, -350), radius 180)
            const d3 = Math.sqrt(Math.pow(x + 150, 2) + Math.pow(z + 350, 2));
            if (d3 < 180) {
                const w = Math.min(1.0, (180 - d3) / 30);
                const h3 = 2.0 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.0; // Cherry hills
                landH = Math.max(landH, -0.6 * (1 - w) + h3 * w);
            }
            
            // 4. Tall Mountain Island (center (250, 350), radius 180)
            const d4 = Math.sqrt(Math.pow(x - 250, 2) + Math.pow(z - 350, 2));
            if (d4 < 180) {
                const w = Math.min(1.0, (180 - d4) / 30);
                const h4 = (1.0 - d4 / 180) * 75.0 + Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2.0; // Tall mountain
                landH = Math.max(landH, -0.6 * (1 - w) + h4 * w);
            }
            
            // 5. Second Village Island (center (-350, 250), radius 180)
            const d5 = Math.sqrt(Math.pow(x + 350, 2) + Math.pow(z - 250, 2));
            if (d5 < 180) {
                const w = Math.min(1.0, (180 - d5) / 30);
                const h5 = 1.5 + Math.sin(x * 0.05) * 0.5; // Flat plain
                landH = Math.max(landH, -0.6 * (1 - w) + h5 * w);
            }
            
            h = landH;
            
            // Edge mountain boundaries (keep players in 1200x1200m)
            if (r > 550) {
                const factor = (r - 550) / 45;
                h = h * (1 - Math.min(1.0, factor)) + factor * factor * 22.0;
            }
            
            return h;
        }

        function requestPointerLock() {
            try {
                const promise = document.body.requestPointerLock();
                if (promise && promise.catch) {
                    promise.catch(err => {
                        if (err.name !== 'NotAllowedError') {
                            console.warn("Pointer lock request failed:", err);
                        }
                    });
                }
            } catch (err) {
                // Ignore synchronous errors
            }
        }

        function exitPointerLock() {
            document.exitPointerLock();
        }

        // Custom Pointer Lock logic
        function initPointerLock() {
            document.addEventListener('pointerlockchange', () => {
                if (document.pointerLockElement === document.body) {
                    isLocked = true;
                    elCrosshair.style.display = 'flex';
                    const prompt = document.getElementById('click-lock-prompt');
                    if (prompt) prompt.style.display = 'none';
                    gameActive = true;
                    document.activeElement.blur();
                    window.focus();
                } else {
                    isLocked = false;
                    elCrosshair.style.display = 'none';
                    if (gameActive && myHealth > 0 && oppHealth > 0 && !mapOpen) {
                        const prompt = document.getElementById('click-lock-prompt');
                        if (prompt) prompt.style.display = 'block';
                    }
                }
            });

            document.addEventListener('mousemove', (event) => {
                if (inventoryOpen && heldItem) {
                    const floatingDiv = document.getElementById('held-item-floating');
                    if (floatingDiv) {
                        floatingDiv.style.left = event.clientX + 'px';
                        floatingDiv.style.top = event.clientY + 'px';
                    }
                }

                if (!isLocked || !gameActive || myHealth <= 0 || mapOpen) return;
                const sensitivity = 0.0022;
                camera.rotation.y -= event.movementX * sensitivity;
                camera.rotation.x -= event.movementY * sensitivity;
                camera.rotation.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, camera.rotation.x));
            });
        }

        function init3D() {
            const container = document.getElementById('canvas-container');
            
            scene = new THREE.Scene();
            
            // Camera (Yaw Y first, Pitch X second)
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.rotation.order = 'YXZ';
            
            // Set spawn coordinates inside Open Plains
            const spawnZ = isHost ? 28 : 12;
            const spawnY = getTerrainHeight(60, spawnZ) + 1.6;
            camera.position.set(60, spawnY, spawnZ);
            if (!isHost) {
                camera.rotation.y = Math.PI; // Look towards Host
            }

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            container.appendChild(renderer.domElement);

            clock = new THREE.Clock();

            // Lights
            ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // soft base
            scene.add(ambientLight);

            // Sun directional light
            sunLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 1024;
            sunLight.shadow.mapSize.height = 1024;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 400;
            const d = 150;
            sunLight.shadow.camera.left = -d;
            sunLight.shadow.camera.right = d;
            sunLight.shadow.camera.top = d;
            sunLight.shadow.camera.bottom = -d;
            scene.add(sunLight);

            // Moon directional light
            moonLight = new THREE.DirectionalLight(0x7090ff, 0.0);
            moonLight.castShadow = false; // moon doesn't need high-res shadows
            scene.add(moonLight);

            // Celestial sphere indicators (Visual sun & moon spheres)
            const sunGeo = new THREE.SphereGeometry(6, 16, 16);
            const sunMat = new THREE.MeshBasicMaterial({ color: 0xffea90 });
            sunSphere = new THREE.Mesh(sunGeo, sunMat);
            scene.add(sunSphere);

            const moonGeo = new THREE.SphereGeometry(4, 16, 16);
            const moonMat = new THREE.MeshBasicMaterial({ color: 0xd9e3ff });
            moonSphere = new THREE.Mesh(moonGeo, moonMat);
            scene.add(moonSphere);

            // Sky Dome
            skyMat = new THREE.MeshBasicMaterial({ color: 0x081530, side: THREE.BackSide });
            skyMesh = new THREE.Mesh(new THREE.SphereGeometry(320, 24, 24), skyMat);
            scene.add(skyMesh);

            // Fog matching sky
            scene.fog = new THREE.FogExp2(0x081530, 0.007);

            // Starfield
            const starGeo = new THREE.BufferGeometry();
            const starCount = 350;
            const starPositions = new Float32Array(starCount * 3);
            for (let i = 0; i < starCount; i++) {
                const u = Math.random();
                const v = Math.random();
                const theta = u * 2.0 * Math.PI;
                const phi = Math.acos(2.0 * v - 1.0);
                starPositions[i*3] = 310 * Math.sin(phi) * Math.cos(theta);
                starPositions[i*3+1] = Math.abs(310 * Math.sin(phi) * Math.sin(theta)); // Keep above horizon
                starPositions[i*3+2] = 310 * Math.cos(phi);
            }
            starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
            const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, transparent: true, opacity: 0 });
            starField = new THREE.Points(starGeo, starMat);
            scene.add(starField);

            // Heightmapped Terrain
            terrainGeometry = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 240, 240);
            terrainGeometry.rotateX(-Math.PI / 2); // align flat
            
            const positions = terrainGeometry.attributes.position.array;
            const colors = [];
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i+2];
                const y = getTerrainHeight(x, z);
                positions[i+1] = y; // Adjust Y coordinate
                
                // Default forest green color
                let r_col = 0.10, g_col = 0.22, b_col = 0.12;
                
                // Distances to biome centers
                const d_desert = Math.sqrt(Math.pow(x - 350, 2) + Math.pow(z + 350, 2));
                const d_cherry = Math.sqrt(Math.pow(x + 150, 2) + Math.pow(z + 350, 2));
                const d_mountain = Math.sqrt(Math.pow(x - 250, 2) + Math.pow(z - 350, 2));
                const d_village2 = Math.sqrt(Math.pow(x + 350, 2) + Math.pow(z - 250, 2));
                
                if (d_desert < 180) {
                    const w = Math.min(1.0, (180 - d_desert) / 30);
                    // Blend to desert sand (0.85, 0.78, 0.50)
                    r_col = r_col * (1 - w) + 0.85 * w;
                    g_col = g_col * (1 - w) + 0.78 * w;
                    b_col = b_col * (1 - w) + 0.50 * w;
                } else if (d_cherry < 180) {
                    const w = Math.min(1.0, (180 - d_cherry) / 30);
                    // Blend to vibrant light grass green (0.28, 0.58, 0.24)
                    r_col = r_col * (1 - w) + 0.28 * w;
                    g_col = g_col * (1 - w) + 0.58 * w;
                    b_col = b_col * (1 - w) + 0.24 * w;
                } else if (d_mountain < 180) {
                    const w = Math.min(1.0, (180 - d_mountain) / 30);
                    let mr = 0.12, mg = 0.24, mb = 0.14;
                    if (y > 40) {
                        mr = 0.95; mg = 0.95; mb = 0.95; // snow
                    } else if (y > 15) {
                        mr = 0.45; mg = 0.45; mb = 0.45; // rock
                    }
                    r_col = r_col * (1 - w) + mr * w;
                    g_col = g_col * (1 - w) + mg * w;
                    b_col = b_col * (1 - w) + mb * w;
                } else if (d_village2 < 180) {
                    const w = Math.min(1.0, (180 - d_village2) / 30);
                    // Blend to savanna golden-yellow (0.72, 0.62, 0.35)
                    r_col = r_col * (1 - w) + 0.72 * w;
                    g_col = g_col * (1 - w) + 0.62 * w;
                    b_col = b_col * (1 - w) + 0.35 * w;
                }
                
                // Ocean bed sand blend
                if (y < -0.5) {
                    const depthFactor = Math.min(1.0, (-0.5 - y) / 5.0);
                    r_col = r_col * (1 - depthFactor) + 0.25 * depthFactor;
                    g_col = g_col * (1 - depthFactor) + 0.22 * depthFactor;
                    b_col = b_col * (1 - depthFactor) + 0.18 * depthFactor;
                }
                
                colors.push(r_col, g_col, b_col);
            }
            terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            terrainGeometry.computeVertexNormals();

            const terrainMat = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.9,
                metalness: 0.1
            });
            const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMat);
            terrainMesh.receiveShadow = true;
            scene.add(terrainMesh);

            // Massive Ocean water plane
            const oceanGeo = new THREE.PlaneGeometry(1200, 1200);
            const oceanMat = new THREE.MeshStandardMaterial({
                color: 0x0f3060, // Deep ocean blue
                roughness: 0.15,
                metalness: 0.85,
                transparent: true,
                opacity: 0.7
            });
            const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
            oceanMesh.rotateX(-Math.PI / 2);
            oceanMesh.position.y = -0.5;
            scene.add(oceanMesh);

            // Spawn Environment Entities (Forest, Village, Plains details)
            spawnEnvironment();
            spawnGrass();

            // --- QUANTUM LANDS INITIALIZATION ---
            
            // 1. Quantum Lands Terrain Mesh (centered at x = 2000, z = 0)
            const quantumTerrainGeometry = new THREE.PlaneGeometry(1200, 1200, 240, 240);
            quantumTerrainGeometry.rotateX(-Math.PI / 2);
            quantumTerrainGeometry.translate(2000, 0, 0); // shift geometry center to (2000, 0)
            
            const qPositions = quantumTerrainGeometry.attributes.position.array;
            const qColors = [];
            for (let i = 0; i < qPositions.length; i += 3) {
                const x = qPositions[i];
                const z = qPositions[i+2];
                const y = getTerrainHeight(x, z);
                qPositions[i+1] = y;
                
                // Color vertices a mixture of dark netherrack red (0.22, 0.08, 0.08) and pulsing quantum green veins (0.08, 0.25, 0.08)
                const randColor = Math.random();
                let r_col, g_col, b_col;
                if (randColor < 0.20) {
                    // Quantum green vein
                    r_col = 0.08; g_col = 0.25; b_col = 0.08;
                } else {
                    // Dark netherrack red
                    r_col = 0.22; g_col = 0.08; b_col = 0.08;
                }
                qColors.push(r_col, g_col, b_col);
            }
            quantumTerrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(qColors, 3));
            quantumTerrainGeometry.computeVertexNormals();
            
            const quantumTerrainMat = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.95,
                metalness: 0.15
            });
            const quantumTerrainMesh = new THREE.Mesh(quantumTerrainGeometry, quantumTerrainMat);
            quantumTerrainMesh.receiveShadow = true;
            scene.add(quantumTerrainMesh);
            
            // 2. Translucent Green Quantum Pool (at y = -40, centered at x = 2000, z = 0)
            const qPoolGeo = new THREE.PlaneGeometry(1200, 1200);
            const qPoolMat = new THREE.MeshStandardMaterial({
                color: 0x00ff33, // Quantum green
                roughness: 0.1,
                metalness: 0.8,
                transparent: true,
                opacity: 0.65
            });
            const qPoolMesh = new THREE.Mesh(qPoolGeo, qPoolMat);
            qPoolMesh.rotateX(-Math.PI / 2);
            qPoolMesh.position.set(2000, -40, 0);
            scene.add(qPoolMesh);

            // --- QUANTUM CUBES (SLIMES) CREATION & SPAWN ---
            // Moved to global scope

            // 3. Portal Mesh Creator Function
            function createPortal(x, y, z) {
                const portalGroup = new THREE.Group();
                portalGroup.position.set(x, y, z);
                
                const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x50c878, roughness: 0.2, metalness: 0.8 }); // Emerald green
                const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 }); // Gold
                
                // Corners (emerald green)
                const cornerGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
                const cBL = new THREE.Mesh(cornerGeo, emeraldMat); cBL.position.set(-1.5, 0, 0); portalGroup.add(cBL);
                const cBR = new THREE.Mesh(cornerGeo, emeraldMat); cBR.position.set(1.5, 0, 0); portalGroup.add(cBR);
                const cTL = new THREE.Mesh(cornerGeo, emeraldMat); cTL.position.set(-1.5, 4, 0); portalGroup.add(cTL);
                const cTR = new THREE.Mesh(cornerGeo, emeraldMat); cTR.position.set(1.5, 4, 0); portalGroup.add(cTR);
                
                // Gold frame bars
                const hBarGeo = new THREE.BoxGeometry(2.65, 0.25, 0.25);
                const barBottom = new THREE.Mesh(hBarGeo, goldMat); barBottom.position.set(0, 0, 0); portalGroup.add(barBottom);
                const barTop = new THREE.Mesh(hBarGeo, goldMat); barTop.position.set(0, 4, 0); portalGroup.add(barTop);
                
                const vBarGeo = new THREE.BoxGeometry(0.25, 3.65, 0.25);
                const barLeft = new THREE.Mesh(vBarGeo, goldMat); barLeft.position.set(-1.5, 2, 0); portalGroup.add(barLeft);
                const barRight = new THREE.Mesh(vBarGeo, goldMat); barRight.position.set(1.5, 2, 0); portalGroup.add(barRight);
                
                // Swirling green translucent vortex
                const vortexGeo = new THREE.PlaneGeometry(2.8, 3.8);
                const vortexMat = new THREE.MeshBasicMaterial({
                    color: 0x39ff14,
                    transparent: true,
                    opacity: 0.55,
                    side: THREE.DoubleSide
                });
                const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
                vortexMesh.position.set(0, 2, 0);
                portalGroup.add(vortexMesh);
                
                portalVortices.push(vortexMesh);
                scene.add(portalGroup);
            }
            
            // 4. Spawn Portals & Quantum Cubes
            const baseY = getTerrainHeight(250, 350);
            createPortal(250, baseY, 350); // Overworld mountain top portal
            createPortal(2000, 20, 0);    // Quantum lands main island return portal
            spawnQuantumCubes();          // Spawn quantum cubes on the islands

            // Set up pointer lock interaction click on body to prevent focus loss
            document.body.addEventListener('click', (event) => {
                if (gameActive && !mapOpen && elLobby.style.display === 'none' && elGameOver.style.display !== 'flex') {
                    if (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'INPUT') {
                        requestPointerLock();
                    }
                }
            });
            initPointerLock();

            // Keyboard Listeners
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            window.addEventListener('resize', onWindowResize);

            // Create Fists/Bow First-Person view
            createFirstPersonArms();

            // Create Opponent Droid Mesh
            createOpponentMesh();

            // Set up Map Canvas
            mapCanvas = document.getElementById('map-canvas');
            mapCtx = mapCanvas.getContext('2d');
            initMapInputs();
            
            elCloseMapBtn.addEventListener('click', () => {
                toggleMapOverlay();
            });

            // Set up Chat Input key listener
            const elChatInput = document.getElementById('chat-input');
            if (elChatInput) {
                elChatInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        toggleChat();
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        sendChatMessage();
                    }
                });
            }
        }

        // --- QUANTUM CUBES (SLIMES) HELPERS ---

        function createQuantumCubeMesh() {
            const group = new THREE.Group();
            
            // Body: neon green cube
            const bodyGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x39ff14, // quantum/neon green
                roughness: 0.1,
                metalness: 0.1,
                emissive: 0x103010
            });
            const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            bodyMesh.position.y = 0.8; // bottom rests at y = 0
            bodyMesh.castShadow = true;
            bodyMesh.receiveShadow = true;
            group.add(bodyMesh);
            
            // Eyes: white boxes with black pupils on front face (Z+)
            const eyeWhiteGeo = new THREE.BoxGeometry(0.3, 0.3, 0.05);
            const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            
            const eyePupilGeo = new THREE.BoxGeometry(0.12, 0.12, 0.06);
            const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            
            // Left Eye
            const eyeLeft = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
            eyeLeft.position.set(-0.35, 1.0, 0.81);
            const pupilLeft = new THREE.Mesh(eyePupilGeo, eyePupilMat);
            pupilLeft.position.set(-0.35, 1.0, 0.82);
            group.add(eyeLeft);
            group.add(pupilLeft);
            
            // Right Eye
            const eyeRight = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
            eyeRight.position.set(0.35, 1.0, 0.81);
            const pupilRight = new THREE.Mesh(eyePupilGeo, eyePupilMat);
            pupilRight.position.set(0.35, 1.0, 0.82);
            group.add(eyeRight);
            group.add(pupilRight);
            
            return group;
        }
        
        function spawnQuantumCubes() {
            clearQuantumCubes();
            
            const spawnPoints = [
                { id: 'qc_1', x: 2000, z: 50 },   // Main Island
                { id: 'qc_2', x: 1950, z: -50 },  // Main Island
                { id: 'qc_3', x: 2050, z: 0 },    // Main Island
                { id: 'qc_4', x: 2000, z: -300 }, // Lower Island
                { id: 'qc_5', x: 1950, z: -280 }, // Lower Island
                { id: 'qc_6', x: 2000, z: 300 }   // Upper Island
            ];
            
            spawnPoints.forEach(pt => {
                const mesh = createQuantumCubeMesh();
                const y = getTerrainHeight(pt.x, pt.z);
                mesh.position.set(pt.x, y, pt.z);
                scene.add(mesh);
                
                quantumCubes.push({
                    id: pt.id,
                    mesh: mesh,
                    x: pt.x,
                    y: y,
                    z: pt.z,
                    vx: 0,
                    vy: 0,
                    vz: 0,
                    isGrounded: true,
                    rider: null,
                    bounceCooldown: 1.0 + Math.random() * 2.5
                });
            });
        }
        
        function clearQuantumCubes() {
            quantumCubes.forEach(c => {
                if (c.mesh) {
                    scene.remove(c.mesh);
                }
            });
            quantumCubes.length = 0;
        }

        function updateQuantumCubes(delta) {
            if (!gameActive) return;
            
            quantumCubes.forEach(c => {
                if (c.rider === 'local') {
                    // --- LOCAL RIDER PHYSICS (Steered by player) ---
                    // Snap player camera to cube
                    camera.position.set(c.mesh.position.x, c.mesh.position.y + 1.6, c.mesh.position.z);
                    
                    // Steer direction based on camera and WASD inputs
                    const terrainY = getTerrainHeight(c.mesh.position.x, c.mesh.position.z);
                    const onGround = c.mesh.position.y <= terrainY + 0.05;
                    
                    if (onGround) {
                        c.mesh.position.y = terrainY;
                        c.vy = 0;
                        c.isGrounded = true;
                        
                        // Check keyboard movement keys
                        const isMoving = moveForces.forward || moveForces.backward || moveForces.left || moveForces.right;
                        if (isMoving) {
                            // Find forward direction projected on X-Z
                            const camDir = new THREE.Vector3();
                            camera.getWorldDirection(camDir);
                            camDir.y = 0;
                            camDir.normalize();
                            
                            const moveVector = new THREE.Vector3(0, 0, 0);
                            if (moveForces.forward) moveVector.add(camDir);
                            if (moveForces.backward) moveVector.sub(camDir);
                            if (moveForces.left) {
                                const leftDir = new THREE.Vector3(-camDir.z, 0, camDir.x);
                                moveVector.add(leftDir);
                            }
                            if (moveForces.right) {
                                const rightDir = new THREE.Vector3(camDir.z, 0, -camDir.x);
                                moveVector.add(rightDir);
                            }
                            
                            if (moveVector.lengthSq() > 0) {
                                moveVector.normalize();
                                c.mesh.rotation.y = Math.atan2(moveVector.x, moveVector.z);
                                
                                // Jump!
                                c.vy = 12.0;
                                c.vx = moveVector.x * 16.0;
                                c.vz = moveVector.z * 16.0;
                                c.isGrounded = false;
                                
                                // Squash and stretch hop animation
                                c.mesh.scale.set(0.7, 1.5, 0.7);
                            }
                        } else {
                            // Decelerate when grounded and not steering
                            c.vx -= c.vx * 12.0 * delta;
                            c.vz -= c.vz * 12.0 * delta;
                        }
                    } else {
                        // Air physics: apply gravity and drag
                        c.vy -= 9.8 * 2.2 * delta;
                        c.vx -= c.vx * 1.5 * delta;
                        c.vz -= c.vz * 1.5 * delta;
                    }
                    
                    // Move cube mesh
                    c.mesh.position.x += c.vx * delta;
                    c.mesh.position.y += c.vy * delta;
                    c.mesh.position.z += c.vz * delta;
                    
                    // Clamp to Quantum boundary if inside Quantum Lands
                    const dx = c.mesh.position.x - 2000;
                    const dz = c.mesh.position.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist > 590) {
                        const angle = Math.atan2(dz, dx);
                        c.mesh.position.x = 2000 + Math.cos(angle) * 590;
                        c.mesh.position.z = Math.sin(angle) * 590;
                        c.vx = -c.vx * 0.5;
                        c.vz = -c.vz * 0.5;
                    }

                    // Reset if fell below pool
                    if (c.mesh.position.y <= -38) {
                        c.mesh.position.set(2000, 20.0, 0);
                        c.vx = 0; c.vy = 0; c.vz = 0;
                        c.isGrounded = true;
                        camera.position.set(2000, 20.0 + 1.6, 0);
                        c.rider = null;
                        ridingCube = null;
                        addChatMessage("Rode into the Quantum Pool and reset!", "system");
                    }
                    
                    // Recover scale towards 1.0 (squash & stretch recovery)
                    c.mesh.scale.x += (1.0 - c.mesh.scale.x) * 8.0 * delta;
                    c.mesh.scale.y += (1.0 - c.mesh.scale.y) * 8.0 * delta;
                    c.mesh.scale.z += (1.0 - c.mesh.scale.z) * 8.0 * delta;
                    
                    // Send coordinates to peer in multiplayer
                    if (isConnected) {
                        const now = Date.now();
                        if (now - lastQuantumCubesSyncTime > 50) { // throttle sync to 20fps
                            sendNetworkMessage({
                                type: 'quantum-cube-client-update',
                                id: c.id,
                                x: c.mesh.position.x,
                                y: c.mesh.position.y,
                                z: c.mesh.position.z,
                                ry: c.mesh.rotation.y,
                                rider: isHost ? 'host' : 'client'
                            });
                            lastQuantumCubesSyncTime = now;
                        }
                    }
                    
                } else if (isHost && !c.rider) {
                    // --- HOST WANDERING PHYSICS (Unridden cubes) ---
                    const terrainY = getTerrainHeight(c.mesh.position.x, c.mesh.position.z);
                    const onGround = c.mesh.position.y <= terrainY + 0.05;
                    
                    if (onGround) {
                        c.mesh.position.y = terrainY;
                        c.vy = 0;
                        c.vx = 0;
                        c.vz = 0;
                        c.isGrounded = true;
                        
                        c.bounceCooldown -= delta;
                        if (c.bounceCooldown <= 0) {
                            c.bounceCooldown = 1.5 + Math.random() * 2.5;
                            
                            // Jump in a random angle
                            const angle = Math.random() * Math.PI * 2;
                            c.mesh.rotation.y = angle;
                            c.vy = 6.0;
                            c.vx = Math.sin(angle) * 4.0;
                            c.vz = Math.cos(angle) * 4.0;
                            c.isGrounded = false;
                            
                            c.mesh.scale.set(0.8, 1.4, 0.8);
                        }
                    } else {
                        // Air physics
                        c.vy -= 9.8 * 2.2 * delta;
                    }
                    
                    c.mesh.position.x += c.vx * delta;
                    c.mesh.position.y += c.vy * delta;
                    c.mesh.position.z += c.vz * delta;
                    
                    // Boundary check: if fell below pool, respawn on island
                    if (c.mesh.position.y <= -38) {
                        c.mesh.position.set(2000, 20.0, 0);
                        c.vx = 0; c.vy = 0; c.vz = 0;
                        c.isGrounded = true;
                        c.bounceCooldown = 2.0;
                    }
                    
                    c.mesh.scale.x += (1.0 - c.mesh.scale.x) * 8.0 * delta;
                    c.mesh.scale.y += (1.0 - c.mesh.scale.y) * 8.0 * delta;
                    c.mesh.scale.z += (1.0 - c.mesh.scale.z) * 8.0 * delta;
                    
                } else {
                    // --- REMOTE CUBE ANIMATION AND RECOVERY ---
                    // Recover squash and stretch scale
                    c.mesh.scale.x += (1.0 - c.mesh.scale.x) * 8.0 * delta;
                    c.mesh.scale.y += (1.0 - c.mesh.scale.y) * 8.0 * delta;
                    c.mesh.scale.z += (1.0 - c.mesh.scale.z) * 8.0 * delta;
                }
            });
            
            // --- HOST MULTIPLAYER SYNC OF ALL CUBES ---
            if (isHost && isConnected) {
                const now = Date.now();
                if (now - lastZombieSyncTime > 150) {
                    sendNetworkMessage({
                        type: 'quantum-cubes-sync',
                        cubes: quantumCubes.map(c => ({
                            id: c.id,
                            x: c.mesh.position.x,
                            y: c.mesh.position.y,
                            z: c.mesh.position.z,
                            ry: c.mesh.rotation.y,
                            rider: c.rider
                        }))
                    });
                }
            }
        }

        function initMapInputs() {
            let isDragging = false;
            let startX, startY;
            
            mapCanvas.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // left click
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                } else if (e.button === 2) { // right click to reset
                    e.preventDefault();
                    mapOffsetX = 0;
                    mapOffsetZ = 0;
                    mapZoom = 1.0;
                }
            });
            
            mapCanvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            
            window.addEventListener('mousemove', (e) => {
                if (!isDragging || !mapOpen) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                const worldFactor = (200 / mapZoom) / 250;
                mapOffsetX -= dx * worldFactor;
                mapOffsetZ -= dy * worldFactor;
                
                startX = e.clientX;
                startY = e.clientY;
            });
            
            window.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            mapCanvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                const zoomFactor = 1.15;
                if (e.deltaY < 0) {
                    mapZoom = Math.min(6.0, mapZoom * zoomFactor);
                } else {
                    mapZoom = Math.max(0.15, mapZoom / zoomFactor);
                }
            }, { passive: false });
        }

        function createBeehiveMesh() {
            const group = new THREE.Group();
            const hiveMat = new THREE.MeshStandardMaterial({ color: 0xd5a153, roughness: 0.8 }); // Hive gold
            const bandMat = new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.8 }); // Dark brown band
            
            // Main body
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), hiveMat);
            body.castShadow = true;
            group.add(body);
            
            // Some stripes
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.08, 0.37), bandMat);
            band.position.y = 0.08;
            group.add(band);
            
            const band2 = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.08, 0.37), bandMat);
            band2.position.y = -0.08;
            group.add(band2);
            
            // Entry hole
            const hole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), new THREE.MeshBasicMaterial({ color: 0x111111 }));
            hole.position.set(0, -0.1, 0.176);
            group.add(hole);
            
            return group;
        }

        function spawnBeesForHive(hx, hy, hz) {
            for (let i = 0; i < 5; i++) {
                const id = Math.random().toString(36).substr(2, 6);
                const mesh = createBeeMesh();
                const startX = hx + (Math.random() - 0.5) * 2;
                const startY = hy - 0.5 - Math.random() * 0.5;
                const startZ = hz + (Math.random() - 0.5) * 2;
                mesh.position.set(startX, startY, startZ);
                scene.add(mesh);
                
                bees.push({
                    id: id,
                    mesh: mesh,
                    home: new THREE.Vector3(hx, hy, hz),
                    state: 'wander',
                    pos: new THREE.Vector3(startX, startY, startZ),
                    vel: new THREE.Vector3(),
                    targetFlower: null,
                    nectar: 0,
                    collectTimer: 0,
                    hp: 9,
                    angerTarget: null
                });
            }
        }

        // Spawn trees and houses procedurally
        function spawnEnvironment() {
            // 1. Spawning FOREST (around x: -80, z: 80)
            const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3.5, 8);
            const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
            const foliageMat = new THREE.MeshStandardMaterial({ color: 0x0f3b1e, roughness: 0.8 });
            
            for (let i = 0; i < 70; i++) {
                // Random locations in forest quadrant
                const tx = -130 + Math.random() * 95;
                const tz = 30 + Math.random() * 95;
                
                // Exclude lake crater area
                const distToLake = Math.sqrt(Math.pow(tx - LAKE_CENTER_X, 2) + Math.pow(tz - LAKE_CENTER_Z, 2));
                if (distToLake < CRATER_RADIUS) {
                    i--;
                    continue;
                }
                
                const ty = getTerrainHeight(tx, tz);
                
                const treeGroup = new THREE.Group();
                treeGroup.position.set(tx, ty, tz);

                // Trunk
                const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
                trunk.position.y = 1.75;
                trunk.castShadow = true;
                treeGroup.add(trunk);

                // Stacked cones leaves
                for (let j = 0; j < 3; j++) {
                    const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.6 - j * 0.4, 2.2, 8), foliageMat);
                    leaf.position.y = 3.0 + j * 1.3;
                    leaf.castShadow = true;
                    treeGroup.add(leaf);
                }

                scene.add(treeGroup);
            }

            // 2. Spawning VILLAGE Cottages (around x: -80, z: -80)
            const houseWallMat = new THREE.MeshStandardMaterial({ color: 0x4a322c, roughness: 0.8 });
            const houseRoofMat = new THREE.MeshStandardMaterial({ color: 0x5a1835, roughness: 0.7 });
            const windowMat = new THREE.MeshBasicMaterial({ color: 0x222222 }); // Start turned off

            const villageHouses = [
                { x: -85, z: -85, rot: 0.2 },
                { x: -65, z: -80, rot: -0.4 },
                { x: -75, z: -60, rot: 1.1 },
                { x: -95, z: -70, rot: -0.8 },
                { x: -90, z: -98, rot: 0.5 },
                { x: -70, z: -100, rot: 2.1 }
            ];

            villageHouses.forEach(h => {
                const hy = getTerrainHeight(h.x, h.z);
                const house = new THREE.Group();
                house.position.set(h.x, hy, h.z);
                house.rotation.y = h.rot;

                // Main structure box
                const body = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 4), houseWallMat);
                body.position.y = 1.75;
                body.castShadow = true;
                body.receiveShadow = true;
                house.add(body);

                // Roof pyramid
                const roof = new THREE.Mesh(new THREE.ConeGeometry(4, 2.5, 4), houseRoofMat);
                roof.rotation.y = Math.PI / 4;
                roof.position.y = 4.25;
                roof.castShadow = true;
                house.add(roof);

                // Emissive Windows (glow at night)
                const winGeom = new THREE.BoxGeometry(0.1, 0.8, 0.8);
                const w1 = new THREE.Mesh(winGeom, windowMat.clone());
                w1.position.set(2.51, 2.0, 0.9);
                house.add(w1);
                houseWindows.push(w1);

                const w2 = new THREE.Mesh(winGeom, windowMat.clone());
                w2.position.set(-2.51, 2.0, -0.9);
                house.add(w2);
                houseWindows.push(w2);

                scene.add(house);
            });

            // 3. PLAINS Details: sparse flower points
            const flowerCol = [0x00f0ff, 0xff007f, 0xffea00];
            for (let i = 0; i < 120; i++) {
                const fx = 20 + Math.random() * 120;
                const fz = -70 + Math.random() * 140;
                const fy = getTerrainHeight(fx, fz);
                
                const stem = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), new THREE.MeshBasicMaterial({ color: 0x1a4512 }));
                stem.position.set(fx, fy + 0.2, fz);
                
                const petal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 4), new THREE.MeshBasicMaterial({ color: flowerCol[i % 3] }));
                petal.position.set(fx, fy + 0.4, fz);
                
                scene.add(stem);
                scene.add(petal);
            }

            // 4. Spawning random trees everywhere (at least 55+ trees)
            for (let i = 0; i < 55; i++) {
                let tx = -170 + Math.random() * 340;
                let tz = -170 + Math.random() * 340;

                // Exclude player starts, village center, and lake crater
                const distToHostStart = Math.sqrt(Math.pow(tx - 60, 2) + Math.pow(tz - 28, 2));
                const distToClientStart = Math.sqrt(Math.pow(tx - 60, 2) + Math.pow(tz - 12, 2));
                const distToVillage = Math.sqrt(Math.pow(tx + 80, 2) + Math.pow(tz + 80, 2));
                const distToLake = Math.sqrt(Math.pow(tx - LAKE_CENTER_X, 2) + Math.pow(tz - LAKE_CENTER_Z, 2));

                if (distToHostStart < 12 || distToClientStart < 12 || distToVillage < 30 || distToLake < CRATER_RADIUS) {
                    i--;
                    continue;
                }

                const ty = getTerrainHeight(tx, tz);
                const treeGroup = new THREE.Group();
                treeGroup.position.set(tx, ty, tz);

                const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
                trunk.position.y = 1.75;
                trunk.castShadow = true;
                treeGroup.add(trunk);

                for (let j = 0; j < 3; j++) {
                    const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.6 - j * 0.4, 2.2, 8), foliageMat);
                    leaf.position.y = 3.0 + j * 1.3;
                    leaf.castShadow = true;
                    treeGroup.add(leaf);
                }

                scene.add(treeGroup);
            }

            // 5. Spawn Lake Water Plane
            const waterGeo = new THREE.CircleGeometry(LAKE_RADIUS, 32);
            const waterMat = new THREE.MeshStandardMaterial({
                color: 0x005577, // Beautiful deep blue/teal water
                roughness: 0.1,
                metalness: 0.9,
                transparent: true,
                opacity: 0.75
            });
            const waterMesh = new THREE.Mesh(waterGeo, waterMat);
            waterMesh.rotation.x = -Math.PI / 2;
            waterMesh.position.set(LAKE_CENTER_X, WATER_Y, LAKE_CENTER_Z);
            scene.add(waterMesh);

            // 6. Spawn Bushes
            bushes = [];
            BUSH_POSITIONS.forEach((pos, idx) => {
                const by = getTerrainHeight(pos.x, pos.z);
                const mesh = createBushMesh();
                mesh.position.set(pos.x, by, pos.z);
                scene.add(mesh);
                
                bushes.push({
                    id: 'bush_' + idx,
                    mesh: mesh,
                    x: pos.x,
                    y: by,
                    z: pos.z,
                    radius: 2.5
                });
            });

            // 7. Spawn Cacti in Desert (center x: 350, z: -350)
            const cactusGreenMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.9 });
            const cactusGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 6);
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 130;
                const cx = 350 + Math.cos(angle) * radius;
                const cz = -350 + Math.sin(angle) * radius;
                const cy = getTerrainHeight(cx, cz);
                if (cy <= WATER_Y) { i--; continue; } // Don't spawn in water
                
                const cactusGroup = new THREE.Group();
                cactusGroup.position.set(cx, cy, cz);
                
                // Main trunk
                const trunk = new THREE.Mesh(cactusGeo, cactusGreenMat);
                trunk.position.y = 1.25;
                trunk.castShadow = true;
                cactusGroup.add(trunk);
                
                // Arm 1
                const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 6), cactusGreenMat);
                arm1.rotation.z = Math.PI / 2;
                arm1.position.set(0.35, 1.3, 0);
                cactusGroup.add(arm1);
                
                const arm1Up = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6), cactusGreenMat);
                arm1Up.position.set(0.65, 1.55, 0);
                cactusGroup.add(arm1Up);
                
                // Arm 2 (60% chance)
                if (Math.random() < 0.6) {
                    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 6), cactusGreenMat);
                    arm2.rotation.z = -Math.PI / 2;
                    arm2.position.set(-0.35, 0.9, 0);
                    cactusGroup.add(arm2);
                    
                    const arm2Up = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6), cactusGreenMat);
                    arm2Up.position.set(-0.65, 1.15, 0);
                    cactusGroup.add(arm2Up);
                }
                
                scene.add(cactusGroup);
            }

            // 8. Spawn Cherry Trees (center x: -150, z: -350)
            const cherryTrunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 3.2, 8);
            const cherryTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4d2d18, roughness: 0.9 });
            const cherryFoliageMat = new THREE.MeshStandardMaterial({ color: 0xffa6c9, roughness: 0.8 }); // Cherry blossom pink
            
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 130;
                const tx = -150 + Math.cos(angle) * radius;
                const tz = -350 + Math.sin(angle) * radius;
                const ty = getTerrainHeight(tx, tz);
                if (ty <= WATER_Y) { i--; continue; } // Don't spawn in water
                
                const treeGroup = new THREE.Group();
                treeGroup.position.set(tx, ty, tz);
                
                // Trunk
                const trunk = new THREE.Mesh(cherryTrunkGeo, cherryTrunkMat);
                trunk.position.y = 1.6;
                trunk.castShadow = true;
                treeGroup.add(trunk);
                
                // Stacked leaves
                const f1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), cherryFoliageMat);
                f1.position.y = 3.3;
                f1.castShadow = true;
                treeGroup.add(f1);
                
                const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), cherryFoliageMat);
                f2.position.set(0.8, 3.5, 0.3);
                f2.castShadow = true;
                treeGroup.add(f2);
                
                const f3 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), cherryFoliageMat);
                f3.position.set(-0.8, 3.5, -0.3);
                f3.castShadow = true;
                treeGroup.add(f3);
                
                scene.add(treeGroup);
                
                // Beehive attachment (25% chance)
                if (Math.random() < 0.25) {
                    const hiveMesh = createBeehiveMesh();
                    const hx = tx - 0.6;
                    const hy = ty + 2.2;
                    const hz = tz - 0.2;
                    hiveMesh.position.set(hx, hy, hz);
                    scene.add(hiveMesh);
                    
                    beehives.push({
                        x: hx,
                        y: hy,
                        z: hz,
                        mesh: hiveMesh
                    });
                    
                    spawnBeesForHive(hx, hy, hz);
                }
            }

            // 9. Spawn Cherry Flowers (pink cherry biome flowers)
            cherryFlowers = [];
            const cherryFlowerMat = new THREE.MeshBasicMaterial({ color: 0xff77aa });
            const stemMat = new THREE.MeshBasicMaterial({ color: 0x1d4d1a });
            for (let i = 0; i < 80; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 130;
                const fx = -150 + Math.cos(angle) * radius;
                const fz = -350 + Math.sin(angle) * radius;
                const fy = getTerrainHeight(fx, fz);
                if (fy <= WATER_Y) { i--; continue; } // Don't spawn in water
                
                const stem = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), stemMat);
                stem.position.set(fx, fy + 0.15, fz);
                
                const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 4), cherryFlowerMat);
                petal.position.set(fx, fy + 0.3, fz);
                
                scene.add(stem);
                scene.add(petal);
                
                cherryFlowers.push(new THREE.Vector3(fx, fy + 0.3, fz));
            }

            // 10. Spawn Village 2 Houses (centered around x = -350, z = 250)
            const v2WallMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.85 }); // Mud clay
            const v2RoofMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.7 }); // Thatch roof
            const v2Houses = [
                { x: -360, z: 240, rot: 0.3 },
                { x: -340, z: 260, rot: -0.5 },
                { x: -370, z: 270, rot: 1.2 },
                { x: -330, z: 230, rot: -0.9 },
                { x: -350, z: 285, rot: 0.6 }
            ];

            // 10b. Spawn Savanna Acacia Trees (centered around x: -350, z: 250)
            const acaciaTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6e5040, roughness: 0.9 });
            const acaciaLeavesMat = new THREE.MeshStandardMaterial({ color: 0x8a9632, roughness: 0.8 });
            
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 120;
                const tx = -350 + Math.cos(angle) * radius;
                const tz = 250 + Math.sin(angle) * radius;
                
                // Exclude the village center houses so trees don't spawn right on top of them
                let tooCloseToHouse = false;
                for (const h of v2Houses) {
                    const distToHouse = Math.sqrt(Math.pow(tx - h.x, 2) + Math.pow(tz - h.z, 2));
                    if (distToHouse < 8) {
                        tooCloseToHouse = true;
                        break;
                    }
                }
                if (tooCloseToHouse) {
                    i--;
                    continue;
                }
                
                const ty = getTerrainHeight(tx, tz);
                if (ty <= WATER_Y) { i--; continue; } // Don't spawn in water
                
                const treeGroup = new THREE.Group();
                treeGroup.position.set(tx, ty, tz);
                
                // Main trunk (slightly bent/tilted)
                const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 3.5, 8);
                const trunk = new THREE.Mesh(trunkGeo, acaciaTrunkMat);
                trunk.position.y = 1.75;
                trunk.rotation.z = 0.15; // tilt slightly
                trunk.rotation.x = -0.1;
                trunk.castShadow = true;
                treeGroup.add(trunk);
                
                // Branch 1 (splitting to the left/up)
                const branch1Geo = new THREE.CylinderGeometry(0.15, 0.2, 2.0, 8);
                const branch1 = new THREE.Mesh(branch1Geo, acaciaTrunkMat);
                branch1.position.set(-0.7, 3.2, 0.2);
                branch1.rotation.z = 0.6; // branch outwards
                branch1.rotation.x = 0.2;
                branch1.castShadow = true;
                treeGroup.add(branch1);
                
                // Branch 2 (splitting to the right/up)
                const branch2Geo = new THREE.CylinderGeometry(0.15, 0.2, 2.0, 8);
                const branch2 = new THREE.Mesh(branch2Geo, acaciaTrunkMat);
                branch2.position.set(0.6, 3.3, -0.2);
                branch2.rotation.z = -0.6; // branch outwards
                branch2.rotation.x = -0.2;
                branch2.castShadow = true;
                treeGroup.add(branch2);
                
                // Flat-topped canopy over branch 1
                const canopy1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 3.2), acaciaLeavesMat);
                canopy1.position.set(-1.4, 4.0, 0.4);
                canopy1.castShadow = true;
                treeGroup.add(canopy1);
                
                // Flat-topped canopy over branch 2
                const canopy2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.7, 3.0), acaciaLeavesMat);
                canopy2.position.set(1.3, 4.1, -0.4);
                canopy2.castShadow = true;
                treeGroup.add(canopy2);
                
                // Main central canopy (higher, in center)
                const canopyMain = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.8, 3.8), acaciaLeavesMat);
                canopyMain.position.set(0, 4.5, 0);
                canopyMain.castShadow = true;
                treeGroup.add(canopyMain);
                
                scene.add(treeGroup);
            }
            
            v2Houses.forEach(h => {
                const hy = getTerrainHeight(h.x, h.z);
                const house = new THREE.Group();
                house.position.set(h.x, hy, h.z);
                house.rotation.y = h.rot;
                
                const body = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 4), v2WallMat);
                body.position.y = 1.75;
                body.castShadow = true;
                body.receiveShadow = true;
                house.add(body);
                
                const roof = new THREE.Mesh(new THREE.ConeGeometry(4, 2.5, 4), v2RoofMat);
                roof.rotation.y = Math.PI / 4;
                roof.position.y = 4.25;
                roof.castShadow = true;
                house.add(roof);
                
                // Emissive Windows (glow at night)
                const winGeom = new THREE.BoxGeometry(0.1, 0.8, 0.8);
                const w1 = new THREE.Mesh(winGeom, windowMat.clone());
                w1.position.set(2.51, 2.0, 0.9);
                house.add(w1);
                houseWindows.push(w1);
                
                const w2 = new THREE.Mesh(winGeom, windowMat.clone());
                w2.position.set(-2.51, 2.0, -0.9);
                house.add(w2);
                houseWindows.push(w2);
                
                scene.add(house);
            });
        }

        function createBushMesh() {
            const group = new THREE.Group();
            
            const foliageMat = new THREE.MeshStandardMaterial({
                color: 0x1d5822, // Rich dark forest green for bushes
                roughness: 0.9,
                metalness: 0.1
            });
            
            // Core sphere
            const core = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 8), foliageMat);
            core.position.y = 0.8;
            core.castShadow = true;
            core.receiveShadow = true;
            group.add(core);
            
            // Leafy fluffs around it
            for (let i = 0; i < 5; i++) {
                const fluff = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), foliageMat);
                const angle = (i / 5) * Math.PI * 2;
                fluff.position.set(
                    Math.cos(angle) * 0.8,
                    0.6 + Math.random() * 0.4,
                    Math.sin(angle) * 0.8
                );
                fluff.castShadow = true;
                group.add(fluff);
            }
            
            return group;
        }

        // Procedural Grass Generation
        function spawnGrass() {
            const grassGeom = new THREE.BufferGeometry();
            const w = 0.5;
            const h = 0.65;
            // 2 intersecting quads forming a cross
            const vertices = new Float32Array([
                -w/2, 0, 0,
                 w/2, 0, 0,
                -w/2, h, 0,
                 w/2, h, 0,
                0, 0, -w/2,
                0, 0,  w/2,
                0, h, -w/2,
                0, h,  w/2,
            ]);
            const indices = [
                0, 1, 2,  2, 1, 3,
                4, 5, 6,  6, 5, 7
            ];
            grassGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            grassGeom.setIndex(indices);
            grassGeom.computeVertexNormals();

            const grassMat = new THREE.MeshStandardMaterial({
                color: 0x1a4512, // deep forest green
                roughness: 0.95,
                metalness: 0.0,
                side: THREE.DoubleSide
            });

            // Spawn 350 clumps
            for (let i = 0; i < 350; i++) {
                let x = -185 + Math.random() * 370;
                let z = -185 + Math.random() * 370;

                const distToHostStart = Math.sqrt(Math.pow(x - 60, 2) + Math.pow(z - 28, 2));
                const distToClientStart = Math.sqrt(Math.pow(x - 60, 2) + Math.pow(z - 12, 2));
                const distToVillage = Math.sqrt(Math.pow(x + 80, 2) + Math.pow(z + 80, 2));
                const distToLake = Math.sqrt(Math.pow(x - LAKE_CENTER_X, 2) + Math.pow(z - LAKE_CENTER_Z, 2));

                if (distToHostStart < 8 || distToClientStart < 8 || distToVillage < 25 || distToLake < CRATER_RADIUS) {
                    continue;
                }

                const y = getTerrainHeight(x, z);
                const mesh = new THREE.Mesh(grassGeom, grassMat);
                mesh.position.set(x, y, z);
                mesh.rotation.y = Math.random() * Math.PI;
                const s = 0.7 + Math.random() * 0.6;
                mesh.scale.set(s, s, s);
                scene.add(mesh);
            }

            // Spawn 100 extra grass clumps in the cherry biome
            for (let i = 0; i < 100; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 150;
                const x = -150 + Math.cos(angle) * radius;
                const z = -350 + Math.sin(angle) * radius;

                const y = getTerrainHeight(x, z);
                if (y > -0.5) { // make sure it's not under water
                    const mesh = new THREE.Mesh(grassGeom, grassMat);
                    mesh.position.set(x, y, z);
                    mesh.rotation.y = Math.random() * Math.PI;
                    const s = 0.7 + Math.random() * 0.6;
                    mesh.scale.set(s, s, s);
                    scene.add(mesh);
                }
            }
        }

        // Create random synchronized trash cans
        function createTrashCans(coords) {
            // Clear existing trash can meshes
            trashCans.forEach(can => {
                scene.remove(can.mesh);
            });
            trashCans.length = 0;

            coords.forEach((coord, index) => {
                const group = new THREE.Group();
                const cy = getTerrainHeight(coord.x, coord.z);
                group.position.set(coord.x, cy, coord.z);

                // Main metallic cylinder
                const binGeom = new THREE.CylinderGeometry(1.2, 1.1, 2.2, 16);
                const binMat = new THREE.MeshStandardMaterial({
                    color: 0x484d5c,
                    metalness: 0.95,
                    roughness: 0.25
                });
                const bin = new THREE.Mesh(binGeom, binMat);
                bin.position.y = 1.1;
                bin.castShadow = true;
                bin.receiveShadow = true;
                group.add(bin);

                // Inner dark hollow
                const inner = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.1, 16), new THREE.MeshBasicMaterial({ color: 0x020305 }));
                inner.position.y = 2.2;
                group.add(inner);

                // Glowing rim
                const rimCol = index % 2 === 0 ? 0x39ff14 : 0xff0055;
                const canRim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 6, 24), new THREE.MeshBasicMaterial({
                    color: rimCol,
                    toneMapped: false
                }));
                canRim.rotation.x = Math.PI / 2;
                canRim.position.y = 2.21;
                group.add(canRim);

                // Emissive point light above the can
                const pLight = new THREE.PointLight(rimCol, 1.2, 6);
                pLight.position.y = 2.4;
                group.add(pLight);

                scene.add(group);
                
                trashCans.push({
                    mesh: group,
                    x: coord.x,
                    z: coord.z,
                    radius: 1.4
                });
            });
        }

        // Create sleek first-person fists and bow
        function createFirstPersonArms() {
            firstPersonHands = new THREE.Group();
            camera.add(firstPersonHands); // Attach to camera local coordinates

            const sleeveMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.shirt), roughness: 0.7 });
            const fistMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.skin), roughness: 0.8 });
            const legMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.pants), roughness: 0.8 });
            const cuffMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, toneMapped: false });

            // Right Fist
            const forearmR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.6), sleeveMat);
            forearmR.position.set(0.35, -0.3, -0.4);
            firstPersonHands.add(forearmR);

            rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), fistMat);
            rightHand.position.set(0.35, -0.3, -0.7);
            const cuffR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.02), cuffMat);
            cuffR.position.set(0, 0, 0.06);
            rightHand.add(cuffR);
            firstPersonHands.add(rightHand);

            // Left Fist
            const forearmL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.6), sleeveMat);
            forearmL.position.set(-0.35, -0.3, -0.4);
            firstPersonHands.add(forearmL);

            leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), fistMat);
            leftHand.position.set(-0.35, -0.3, -0.7);
            const cuffL = cuffR.clone();
            leftHand.add(cuffL);
            firstPersonHands.add(leftHand);

            // Kick Foot/Leg
            kickerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.9), legMat);
            kickerLeg.position.set(0, -1.2, -0.3);
            const legCuff = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.03), cuffMat);
            legCuff.position.set(0, 0, 0.4);
            kickerLeg.add(legCuff);
            firstPersonHands.add(kickerLeg);

            // First Person BOW Mesh Group
            bowGroup = new THREE.Group();
            bowGroup.position.set(0.2, -0.35, -0.45); // offset to lower right
            bowGroup.visible = false;

            const bowMat = new THREE.MeshStandardMaterial({ color: 0x12151f, roughness: 0.3, metalness: 0.9 });
            const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Curved limbs
            const limbT = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.45, 8), bowMat);
            limbT.position.set(0, 0.22, 0);
            limbT.rotation.z = -0.3;
            bowGroup.add(limbT);

            const limbB = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.45, 8), bowMat);
            limbB.position.set(0, -0.22, 0);
            limbB.rotation.z = 0.3;
            bowGroup.add(limbB);

            // Bow grip
            const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.15, 8), cuffMat);
            bowGroup.add(grip);

            // Bowstring cylinder line
            const bowstring = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.8, 4), stringMat);
            bowstring.position.set(-0.12, 0, 0);
            bowGroup.add(bowstring);

            // Visual loaded arrow
            const loadedArrow = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
            loadedArrow.rotation.x = Math.PI / 2;
            loadedArrow.position.set(-0.06, 0, -0.1);
            bowGroup.add(loadedArrow);

            firstPersonHands.add(bowGroup);
        }

        // Build visual Opponent
        function rebuildOpponentMesh() {
            if (!scene) return;
            if (opponentGroup) {
                scene.remove(opponentGroup);
            }
            createOpponentMesh();
        }

        function createOpponentMesh() {
            opponentGroup = new THREE.Group();
            opponentGroup.position.copy(targetOpponentPos);
            opponentGroup.position.y = getTerrainHeight(targetOpponentPos.x, targetOpponentPos.z);
            scene.add(opponentGroup);

            const skinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(opponentAppearance.skin), roughness: 0.8 });
            const shirtMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(opponentAppearance.shirt), roughness: 0.7 });
            const pantsMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(opponentAppearance.pants), roughness: 0.8 });
            const shoesMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.8 });
            const hairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(opponentAppearance.hair), roughness: 0.9 });
            const pupilMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(opponentAppearance.eye) });

            // Torso (split into shirt and pants/shorts - slender and short T-shirt style)
            const shirtTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.6, 12), shirtMat);
            shirtTorso.position.y = 1.3;
            shirtTorso.castShadow = true;
            shirtTorso.receiveShadow = true;
            opponentGroup.add(shirtTorso);
            opponentTorso = shirtTorso; // Keep reference for flashes

            const pantsTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.6, 12), pantsMat);
            pantsTorso.position.y = 0.7;
            pantsTorso.castShadow = true;
            pantsTorso.receiveShadow = true;
            opponentGroup.add(pantsTorso);

            // Head
            opponentHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
            opponentHead.position.y = 1.8;
            opponentHead.castShadow = true;
            opponentGroup.add(opponentHead);

            // Eyes (small dark pupils direct on face matching reference image)
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.02), pupilMat);
            eyeL.position.set(-0.075, 0.05, 0.262);
            opponentHead.add(eyeL);

            const eyeR = eyeL.clone();
            eyeR.position.x = 0.075;
            opponentHead.add(eyeR);

            // Nose
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.07), skinMat);
            nose.position.set(0, -0.02, 0.26);
            opponentHead.add(nose);

            // Hair (layered skullcap wrapping top, sides, and back matching reference image - no skin clipping)
            const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.40), hairMat);
            hairTop.position.set(0, 0.21, -0.06);
            opponentHead.add(hairTop);

            const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.10), hairMat);
            hairBack.position.set(0, 0.01, -0.21);
            opponentHead.add(hairBack);

            const hairL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.30), hairMat);
            hairL.position.set(-0.25, 0.05, -0.01);
            opponentHead.add(hairL);

            const hairR = hairL.clone();
            hairR.position.x = 0.25;
            opponentHead.add(hairR);

            // Left Arm (short sleeves + skin - attached to shoulder)
            opponentLArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), skinMat);
            opponentLArm.position.set(-0.30, 1.3, 0);
            opponentLArm.castShadow = true;
            opponentGroup.add(opponentLArm);

            const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), shirtMat);
            sleeveL.position.y = 0.18;
            opponentLArm.add(sleeveL);

            // Right Arm (attached to shoulder)
            opponentRArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), skinMat);
            opponentRArm.position.set(0.30, 1.3, 0);
            opponentRArm.castShadow = true;
            opponentGroup.add(opponentRArm);

            const sleeveR = sleeveL.clone();
            opponentRArm.add(sleeveR);

            // Left Leg (shorts + bare leg + shoes - attached to hips)
            opponentLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), skinMat);
            opponentLLeg.position.set(-0.11, 0.4, 0);
            opponentLLeg.castShadow = true;
            opponentGroup.add(opponentLLeg);

            const shortsL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.4, 0.17), pantsMat);
            shortsL.position.y = 0.2;
            opponentLLeg.add(shortsL);

            const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.12, 0.22), shoesMat);
            shoeL.position.set(0, -0.4, 0.03);
            opponentLLeg.add(shoeL);

            // Right Leg (attached to hips)
            opponentRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), skinMat);
            opponentRLeg.position.set(0.11, 0.4, 0);
            opponentRLeg.castShadow = true;
            opponentGroup.add(opponentRLeg);

            const shortsR = shortsL.clone();
            opponentRLeg.add(shortsR);

            const shoeR = shoeL.clone();
            opponentRLeg.add(shoeR);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Input Keyboard Listeners
        function onKeyDown(event) {
            AudioSynth.init();
            
            // Chat Screen Toggle
            if (event.code === 'KeyT') {
                if (document.activeElement === document.getElementById('chat-input')) {
                    return;
                }
                event.preventDefault();
                toggleChat();
                return;
            }

            if (chatOpen) {
                return;
            }

            if (inventoryOpen) {
                if (event.code === 'KeyE') {
                    toggleInventoryOverlay();
                }
                return;
            }
            
            // Map Screen toggle
            if (event.code === 'KeyM') {
                toggleMapOverlay();
                return;
            }
 
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    moveForces.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    moveForces.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    moveForces.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    moveForces.right = true;
                    break;
                case 'Space':
                    if (isGrounded && gameActive && myHealth > 0 && !mapOpen && !inventoryOpen) {
                        velocity.y = 6.2; // Jump impulse
                        isGrounded = false;
                        hunger = Math.max(0, hunger - 2); // Jump decays hunger!
                        updateMinecraftStatsUI();
                    }
                    break;
                case 'Digit1': selectHotbarSlot(0); break;
                case 'Digit2': selectHotbarSlot(1); break;
                case 'Digit3': selectHotbarSlot(2); break;
                case 'Digit4': selectHotbarSlot(3); break;
                case 'Digit5': selectHotbarSlot(4); break;
                case 'Digit6': selectHotbarSlot(5); break;
                case 'Digit7': selectHotbarSlot(6); break;
                case 'Digit8': selectHotbarSlot(7); break;
                case 'Digit9': selectHotbarSlot(8); break;
                case 'KeyR':
                    handleKeyPressR();
                    break;
                case 'KeyF':
                    handleKeyPressF();
                    break;
                case 'KeyE':
                    toggleInventoryOverlay();
                    break;
                case 'KeyI':
                    toggleControlsHelp();
                    break;
            }
        }

        function onKeyUp(event) {
            if (chatOpen) return;
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    moveForces.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    moveForces.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    moveForces.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    moveForces.right = false;
                    break;
            }
        }

        // Mouse click triggers active weapon when locked
        window.addEventListener('mousedown', (e) => {
            if (gameActive && myHealth > 0 && isLocked && !mapOpen && !chatOpen && !inventoryOpen) {
                const item = hotbarItems[selectedHotbarIndex];
                if (inTurret) {
                    triggerTurretShoot();
                } else if (item === 'bow') {
                    triggerBowShoot();
                } else if (item === 'kick') {
                    triggerKick();
                } else if (item === 'fists') {
                    triggerPunch();
                } else if (item && ['porkchop', 'beef', 'mutton', 'chicken'].includes(item)) {
                    triggerEatFood();
                }
            }
        });

        // Toggle Tactical Map
        function toggleMapOverlay() {
            if (!gameActive || myHealth <= 0) return;
            mapOpen = !mapOpen;
            
            const prompt = document.getElementById('click-lock-prompt');
            if (mapOpen) {
                exitPointerLock();
                elMapOverlay.style.display = 'flex';
                elCrosshair.style.display = 'none';
                if (prompt) prompt.style.display = 'none';
            } else {
                elMapOverlay.style.display = 'none';
                requestPointerLock();
                if (!isLocked && prompt) prompt.style.display = 'block';
            }
        }

        // Chat UI Toggle & Message Handling
        function toggleChat() {
            if (!gameActive || myHealth <= 0 || mapOpen) return;
            
            chatOpen = !chatOpen;
            const elChatInput = document.getElementById('chat-input');
            if (chatOpen) {
                elChatInput.style.display = 'block';
                elChatInput.value = '';
                
                // Clear active movement forces so player doesn't slide
                moveForces.forward = false;
                moveForces.backward = false;
                moveForces.left = false;
                moveForces.right = false;
                
                elChatInput.focus();
                // Release pointer lock so we can type
                exitPointerLock();
            } else {
                elChatInput.style.display = 'none';
                elChatInput.blur();
                // Re-request pointer lock
                requestPointerLock();
            }
        }

        function sendChatMessage() {
            const elChatInput = document.getElementById('chat-input');
            const text = elChatInput.value.trim();
            if (text.length > 0) {
                const parts = text.split(/\s+/);
                const command = parts[0].toLowerCase();
                if (command === '/night') {
                    triggerNightCommand();
                } else if (command === '/tp') {
                    const loc = parts[1] ? parts[1].toLowerCase() : '';
                    const targetCoords = {
                        dunes: { x: 350, z: -350 },
                        desert: { x: 350, z: -350 },
                        forest: { x: 0, z: 0 },
                        main: { x: 0, z: 0 },
                        plains: { x: 0, z: 0 },
                        cherry: { x: -150, z: -350 },
                        sakura: { x: -150, z: -350 },
                        mountain: { x: 250, z: 350 },
                        village2: { x: -350, z: 250 },
                        secondvillage: { x: -350, z: 250 },
                        savanna: { x: -350, z: 250 },
                        savannavillage: { x: -350, z: 250 },
                        quantum: { x: 2000, z: 0 }
                    };
                    const coords = targetCoords[loc];
                    if (coords) {
                        // Exit bush if inside
                        if (inBush) {
                            inBush = false;
                            activeBushId = null;
                            localPlayerInvisible = false;
                            sendNetworkMessage({ type: 'invisibility-state', invisible: false });
                            isGrounded = false;
                        }
                        // Exit turret if inside
                        if (inTurret) {
                            inTurret = false;
                            turretOccupant = null;
                            if (activeWeapon !== 'bow') {
                                const elCrosshair = document.getElementById('crosshair');
                                if (elCrosshair) elCrosshair.style.display = 'none';
                            }
                            sendNetworkMessage({ type: 'turret-vacate' });
                        }
                        
                        const tx = coords.x;
                        const tz = coords.z;
                        const ty = getTerrainHeight(tx, tz) + 1.6;
                        camera.position.set(tx, ty, tz);
                        velocity.set(0, 0, 0); // Reset speed
                        
                        // Immediately sync position
                        sendNetworkMessage({
                            type: 'pos-sync',
                            x: tx,
                            y: ty - 1.6,
                            z: tz,
                            ry: camera.rotation.y
                        });
                        
                        addChatMessage("Teleported to " + loc + " (" + tx + ", " + tz + ").", "system");
                    } else {
                        addChatMessage("Usage: /tp [dunes|forest|cherry|mountain|savanna|quantum]", "system");
                    }
                } else {
                    addChatMessage(text, 'local');
                    sendNetworkMessage({ type: 'chat-msg', text: text });
                }
            }
            toggleChat();
        }

        function triggerNightCommand() {
            const totalCycleMs = CYCLE_DURATION * 1000;
            const currentMs = Date.now() % totalCycleMs;
            const targetMs = 540000; // 540s start of night
            
            const diff = (targetMs - currentMs + totalCycleMs) % totalCycleMs;
            timeOffset += diff;
            
            sendNetworkMessage({ type: 'time-sync', offset: timeOffset });
            addChatMessage("Time set to night via command.", "system");
        }

        // Make addChatMessage globally available for network events
        function addChatMessage(text, type) {
            const elChatLog = document.getElementById('chat-log');
            if (!elChatLog) return;
            
            const msgEl = document.createElement('div');
            msgEl.className = `chat-msg ${type}`;
            
            let prefix = "";
            if (type === 'system') prefix = "[System] ";
            else if (type === 'local') prefix = "[You] ";
            else if (type === 'opponent') prefix = "[Opponent] ";
            
            msgEl.innerText = prefix + text;
            elChatLog.appendChild(msgEl);
            elChatLog.scrollTop = elChatLog.scrollHeight;
            
            setTimeout(() => {
                msgEl.style.opacity = '0';
                setTimeout(() => {
                    if (msgEl.parentNode) {
                        msgEl.parentNode.removeChild(msgEl);
                    }
                }, 2000);
            }, 6000);
        }

        function updateWeaponUI() {
            document.getElementById('active-weapon-name').innerText = activeWeapon.toUpperCase();
            
            // Adjust FP visible meshes
            if (activeWeapon === 'bow') {
                bowGroup.visible = true;
                rightHand.visible = false;
                leftHand.visible = false;
            } else {
                bowGroup.visible = false;
                rightHand.visible = true;
                leftHand.visible = true;
            }
        }

        // --- COMBAT PLAY MECHANICS ---

        function triggerPunch() {
            if (!gameActive || myHealth <= 0 || inTurret) return;
            if (localDrawingBow) return; // Block punch if drawing bow

            const now = Date.now();
            if (now - lastPunchTime < PUNCH_COOLDOWN) return;
            lastPunchTime = now;

            if (activeWeapon !== 'fists') {
                activeWeapon = 'fists';
                updateWeaponUI();
            }

            localPunching = true;
            localPunchTimer = 0;

            AudioSynth.playWhoosh();

            // Notify opponent of punch
            sendNetworkMessage({ type: 'punch-trigger' });

            // Check hit in horizontal plane XZ
            checkHit(3.8, 5, 10.0); // range = 3.8, damage = 5, knockback = 10
        }

        function triggerKick() {
            if (!gameActive || myHealth <= 0 || inTurret) return;
            if (localDrawingBow) return; // Block kick if drawing bow

            const now = Date.now();
            if (now - lastKickTime < KICK_COOLDOWN) return;
            lastKickTime = now;

            if (activeWeapon !== 'fists') {
                activeWeapon = 'fists';
                updateWeaponUI();
            }

            localKicking = true;
            localKickTimer = 0;

            AudioSynth.playWhoosh();

            // Notify opponent of kick
            sendNetworkMessage({ type: 'kick-trigger' });

            // Check hit in horizontal plane XZ
            checkHit(5.2, 10, 16.0); // range = 5.2, damage = 10, knockback = 16
        }

        function triggerBowShoot() {
            if (!gameActive || myHealth <= 0 || inTurret) return;
            if (localPunching || localKicking) return; // Block shooting while punching/kicking
            const now = Date.now();
            if (now - lastBowTime < BOW_COOLDOWN) return;
            lastBowTime = now;

            localDrawingBow = true;
            localBowTimer = 0;

            AudioSynth.playTwang();

            // Spawn local arrow projectile
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);

            // Starting position (camera eye plus forward offset)
            const arrowPos = camera.position.clone().addScaledVector(lookDir, 0.6);
            
            // Projectile velocity vector
            const arrowVel = lookDir.clone().multiplyScalar(45.0);

            // Projectile arrow mesh
            const arrowGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.7, 4);
            arrowGeo.rotateX(Math.PI / 2); // point forward
            const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
            const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
            arrowMesh.position.copy(arrowPos);
            scene.add(arrowMesh);

            const arrowId = Math.random().toString(36).substr(2, 6);
            localArrows.push({
                id: arrowId,
                mesh: arrowMesh,
                vel: arrowVel,
                pos: arrowPos
            });

            // Send fire-arrow message to sync visuals
            sendNetworkMessage({
                type: 'fire-arrow',
                id: arrowId,
                x: arrowPos.x,
                y: arrowPos.y,
                z: arrowPos.z,
                vx: arrowVel.x,
                vy: arrowVel.y,
                vz: arrowVel.z
            });
        }

        // 2D XZ Plane Horizontal hit check fixing close-combat angles
        function checkHit(range, damage, knockbackPower) {
            let opponentHit = false;
            const myX = camera.position.x;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            const lookDirXZ = new THREE.Vector2(lookDir.x, lookDir.z).normalize();

            if (opponentGroup) {
                const oppX = opponentGroup.position.x;
                const oppZ = opponentGroup.position.z;
                const dx = oppX - myX;
                const dz = oppZ - myZ;
                const distXZ = Math.sqrt(dx * dx + dz * dz);

                if (distXZ <= range) {
                    const toOppXZ = new THREE.Vector2(dx, dz).normalize();
                    const dotXZ = lookDirXZ.dot(toOppXZ);

                    if (dotXZ > 0.45 || distXZ < 1.6) {
                        opponentHit = true;
                        AudioSynth.playHit();
                        flashOpponentRed();

                        const kDir = new THREE.Vector2(dx, dz).normalize();
                        
                        // Apply visual recoil pushback to opponent model
                        opponentRecoilPos.set(kDir.x, 0.2, kDir.y).normalize().multiplyScalar(0.7);
                        applyOpponentRecoilRot(kDir.x, kDir.y, 0.45);

                        kDir.multiplyScalar(knockbackPower);

                        sendNetworkMessage({
                            type: 'hit',
                            damage: damage,
                            knockbackX: kDir.x,
                            knockbackZ: kDir.y
                        });

                        oppHealth = Math.max(0, oppHealth - damage);
                        updateHud();

                        if (oppHealth <= 0) {
                            declareWinner();
                        }
                    }
                }
            }

            // Check zombie hit if opponent wasn't hit
            if (!opponentHit) {
                if (isHost) {
                    for (let i = zombies.length - 1; i >= 0; i--) {
                        const z = zombies[i];
                        if (z.isDead) continue;
                        const zx = z.mesh.position.x;
                        const zz = z.mesh.position.z;
                        const distXZ = Math.sqrt((zx - myX) ** 2 + (zz - myZ) ** 2);
                        if (distXZ <= range) {
                            const toZXZ = new THREE.Vector2(zx - myX, zz - myZ).normalize();
                            const dotXZ = lookDirXZ.dot(toZXZ);
                            if (dotXZ > 0.45 || distXZ < 1.6) {
                                AudioSynth.playHit();
                                flashZombieRed(z.mesh);
                                const kDir = new THREE.Vector2(zx - myX, zz - myZ).normalize().multiplyScalar(knockbackPower);
                                
                                // Apply visual recoil to zombie mesh
                                zombieRecoilMap.set(z.mesh, {
                                    pos: new THREE.Vector3(zx - myX, 0.2, zz - myZ).normalize().multiplyScalar(0.6),
                                    rotX: 0.25
                                });

                                z.health = Math.max(0, z.health - damage);
                                z.kx = kDir.x;
                                z.kz = kDir.y;
                                if (z.health <= 0) {
                                    z.isDead = true;
                                    z.deathTime = 0;
                                }
                                opponentHit = true;
                                break; // hit one zombie per strike
                            }
                        }
                    }
                } else {
                    for (let [id, mesh] of clientZombies) {
                        const zx = mesh.position.x;
                        const zz = mesh.position.z;
                        const distXZ = Math.sqrt((zx - myX) ** 2 + (zz - myZ) ** 2);
                        if (distXZ <= range) {
                            const toZXZ = new THREE.Vector2(zx - myX, zz - myZ).normalize();
                            const dotXZ = lookDirXZ.dot(toZXZ);
                            if (dotXZ > 0.45 || distXZ < 1.6) {
                                AudioSynth.playHit();
                                flashZombieRed(mesh);
                                
                                // Apply visual recoil to zombie mesh
                                zombieRecoilMap.set(mesh, {
                                    pos: new THREE.Vector3(zx - myX, 0.2, zz - myZ).normalize().multiplyScalar(0.6),
                                    rotX: 0.25
                                });

                                const kDir = new THREE.Vector2(zx - myX, zz - myZ).normalize().multiplyScalar(knockbackPower);
                                sendNetworkMessage({
                                    type: 'damage-zombie',
                                    id: id,
                                    damage: damage,
                                    kx: kDir.x,
                                    kz: kDir.y
                                });
                                opponentHit = true;
                                break; // hit one zombie per strike
                            }
                        }
                    }
                }
            }

            // Check villager hit if opponent and zombies weren't hit
            if (!opponentHit) {
                for (let i = villagers.length - 1; i >= 0; i--) {
                    const v = villagers[i];
                    if (v.isDead) continue;
                    const vx = v.mesh.position.x;
                    const vz = v.mesh.position.z;
                    const distXZ = Math.sqrt((vx - myX) ** 2 + (vz - myZ) ** 2);
                    if (distXZ <= range) {
                        const toVXZ = new THREE.Vector2(vx - myX, vz - myZ).normalize();
                        const dotXZ = lookDirXZ.dot(toVXZ);
                        if (dotXZ > 0.45 || distXZ < 1.6) {
                            AudioSynth.playHit();
                            flashVillagerRed(v.mesh);
                            const kDir = new THREE.Vector2(vx - myX, vz - myZ).normalize().multiplyScalar(knockbackPower);
                            
                            v.health = Math.max(0, v.health - damage);
                            v.kx = kDir.x;
                            v.kz = kDir.y;
                            if (v.health <= 0) {
                                v.isDead = true;
                                v.deathTime = 0;
                            }
                            
                            sendNetworkMessage({
                                type: 'damage-villager',
                                id: v.id,
                                damage: damage,
                                kx: kDir.x,
                                kz: kDir.y
                            });
                            opponentHit = true;
                            break; // hit one villager per strike
                        }
                    }
                }
            }

            // Check animal hit if opponent, zombies, and villagers weren't hit
            if (!opponentHit) {
                for (let i = animals.length - 1; i >= 0; i--) {
                    const a = animals[i];
                    if (a.isDead) continue;
                    const ax = a.mesh.position.x;
                    const az = a.mesh.position.z;
                    const distXZ = Math.sqrt((ax - myX) ** 2 + (az - myZ) ** 2);
                    if (distXZ <= range) {
                        const toAXZ = new THREE.Vector2(ax - myX, az - myZ).normalize();
                        const dotXZ = lookDirXZ.dot(toAXZ);
                        if (dotXZ > 0.45 || distXZ < 1.6) {
                            AudioSynth.playHit();
                            flashAnimalRed(a.mesh);
                            const kDir = new THREE.Vector2(ax - myX, az - myZ).normalize().multiplyScalar(knockbackPower);
                            
                            a.health = Math.max(0, a.health - damage);
                            a.kx = kDir.x;
                            a.kz = kDir.y;
                            if (a.health <= 0) {
                                a.isDead = true;
                                a.deathTime = 0;
                                spawnDroppedFood(getFoodTypeForAnimal(a.type), a.mesh.position);
                            }
                            
                            if (isConnected) {
                                sendNetworkMessage({
                                    type: 'damage-animal',
                                    id: a.id,
                                    damage: damage,
                                    kx: kDir.x,
                                    kz: kDir.y
                                });
                            }
                            opponentHit = true;
                            break; // hit one animal per strike
                        }
                    }
                }
            }

            // Check bee hit if opponent, zombies, and villagers weren't hit
            if (!opponentHit) {
                if (isHost) {
                    for (let i = bees.length - 1; i >= 0; i--) {
                        const b = bees[i];
                        if (b.hp <= 0) continue;
                        const bx = b.pos.x;
                        const bz = b.pos.z;
                        const distXZ = Math.sqrt((bx - myX) ** 2 + (bz - myZ) ** 2);
                        if (distXZ <= range + 1.0) {
                            const toBXZ = new THREE.Vector2(bx - myX, bz - myZ).normalize();
                            const dotXZ = lookDirXZ.dot(toBXZ);
                            if (dotXZ > 0.40 || distXZ < 1.8) {
                                AudioSynth.playHit();
                                flashBeeRed(b.mesh);
                                b.hp = Math.max(0, b.hp - damage);
                                
                                beesAngryAt = 'host';
                                beesAngerStartTime = Date.now();
                                
                                if (b.hp <= 0) {
                                    b.mesh.rotation.x = Math.PI;
                                }
                                opponentHit = true;
                                break;
                            }
                        }
                    }
                } else {
                    for (let [id, mesh] of clientBees) {
                        const bx = mesh.position.x;
                        const bz = mesh.position.z;
                        const distXZ = Math.sqrt((bx - myX) ** 2 + (bz - myZ) ** 2);
                        if (distXZ <= range + 1.0) {
                            const toBXZ = new THREE.Vector2(bx - myX, bz - myZ).normalize();
                            const dotXZ = lookDirXZ.dot(toBXZ);
                            if (dotXZ > 0.40 || distXZ < 1.8) {
                                AudioSynth.playHit();
                                flashBeeRed(mesh);
                                
                                sendNetworkMessage({
                                    type: 'damage-bee',
                                    id: id,
                                    damage: damage
                                });
                                opponentHit = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        function flashOpponentRed() {
            if (!opponentGroup) return;
            isOpponentDamaged = true;
            opponentDamageTimer = 0.15;
            opponentGroup.traverse((node) => {
                if (node.isMesh && node.material && node.material.color) {
                    if (node.userData.originalColor === undefined) {
                        node.userData.originalColor = node.material.color.getHex();
                        node.material = node.material.clone();
                    }
                    node.material.color.setHex(0xff0000);
                }
            });
        }

        function resetOpponentColor() {
            if (!opponentGroup) return;
            opponentGroup.traverse((node) => {
                if (node.isMesh && node.material && node.material.color && node.userData.originalColor !== undefined) {
                    node.material.color.setHex(node.userData.originalColor);
                }
            });
        }

        function applyOpponentRecoilRot(fx, fz, magnitude) {
            if (!opponentGroup) return;
            const rotY = opponentGroup.rotation.y;
            const fLocalZ = fx * Math.sin(rotY) + fz * Math.cos(rotY);
            const fLocalX = fx * Math.cos(rotY) - fz * Math.sin(rotY);
            opponentRecoilRotX = -magnitude * fLocalZ;
            opponentRecoilRotZ = -magnitude * fLocalX;
        }

        function flashZombieRed(mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material && node.material.color) {
                    if (node.userData.originalColor === undefined) {
                        node.userData.originalColor = node.material.color.getHex();
                        node.material = node.material.clone();
                    }
                    node.material.color.setHex(0xff0000);
                }
            });
            setTimeout(() => {
                mesh.traverse((node) => {
                    if (node.isMesh && node.material && node.material.color && node.userData.originalColor !== undefined) {
                        node.material.color.setHex(node.userData.originalColor);
                    }
                });
            }, 150);
        }

        function flashBeeRed(mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material && node.material.color) {
                    if (node.userData.originalColor === undefined) {
                        node.userData.originalColor = node.material.color.getHex();
                        node.material = node.material.clone();
                    }
                    node.material.color.setHex(0xff0000);
                }
            });
            setTimeout(() => {
                mesh.traverse((node) => {
                    if (node.isMesh && node.material && node.material.color && node.userData.originalColor !== undefined) {
                        node.material.color.setHex(node.userData.originalColor);
                    }
                });
            }, 150);
        }

        // Apply Damage Locally
        function takeDamage(damage, kx, kz, reason = "Killed by Opponent!") {
            if (myHealth <= 0) return;

            myHealth = Math.max(0, myHealth - damage);
            updateHud();

            const vignette = document.getElementById('damage-vignette');
            vignette.classList.add('active');
            setTimeout(() => vignette.classList.remove('active'), 150);

            AudioSynth.playHit();

            // Apply velocities & camera shake recoil bounce
            knockbackVel.set(kx, 0, kz);
            velocity.x += kx;
            velocity.z += kz;
            velocity.y += 2.0; // pop up
            isGrounded = false;

            const kLen = Math.sqrt(kx * kx + kz * kz);
            if (kLen > 0.01) {
                camHitRecoil.set(-kx / kLen * 0.45, 0.2, -kz / kLen * 0.45);
                camHitTilt = 0.15;
            } else {
                camHitRecoil.set(0, 0.2, 0.35);
                camHitTilt = 0.12;
            }

            sendNetworkMessage({
                type: 'health-sync',
                health: myHealth
            });

            if (myHealth <= 0) {
                declareLoser(reason);
            }
        }

        // Trash Can Hazard Check
        function checkTrashCans() {
            if (!gameActive || myHealth <= 0) return;

            const px = camera.position.x;
            const pz = camera.position.z;

            for (let i = 0; i < trashCans.length; i++) {
                const can = trashCans[i];
                const dx = px - can.x;
                const dz = pz - can.z;
                const distXZ = Math.sqrt(dx * dx + dz * dz);

                const terrainY = getTerrainHeight(px, pz);

                // If player is close horizontally and near ground height
                if (distXZ < can.radius && camera.position.y < terrainY + 2.0) {
                    AudioSynth.playClang();

                    myHealth = 0;
                    updateHud();

                    sendNetworkMessage({
                        type: 'trashed',
                        canIndex: i
                    });

                    declareLoser("You were thrown into the trash!");
                    
                    // Fall animation
                    velocity.set(0, 0, 0);
                    knockbackVel.set(0, 0, 0);
                    
                    const fallInterval = setInterval(() => {
                        if (camera.position.y > terrainY + 0.1) {
                            camera.position.y -= 0.1;
                            camera.rotation.z += 0.05;
                            camera.rotation.x += 0.05;
                        } else {
                            clearInterval(fallInterval);
                        }
                    }, 20);

                    break;
                }
            }
        }

        function getVictorySubtitle(oppReason) {
            if (oppReason === "Killed by Zombie!") {
                return "Your opponent was killed by a zombie!";
            }
            if (oppReason === "Killed by Explosion!") {
                return "Your opponent was blown up by an explosion!";
            }
            if (oppReason === "You were thrown into the trash!") {
                return "You threw the opponent into the trash bin!";
            }
            return "You defeated your opponent!";
        }

        function declareWinner(reason) {
            if (!gameActive) return;
            gameActive = false;
            exitPointerLock();
            AudioSynth.playWin();

            elGameOverTitle.innerText = "VICTORY";
            elGameOverTitle.className = "title-win";
            elGameOverSubtitle.innerText = reason || "You threw the opponent into the trash bin!";
            elGameOver.style.display = 'flex';
            elCrosshair.style.display = 'none';

            if (inTurret) {
                inTurret = false;
                turretOccupant = null;
                sendNetworkMessage({ type: 'turret-vacate' });
            }

            sendNetworkMessage({ type: 'win-state' });
        }

        function declareLoser(reason) {
            if (!gameActive) return;
            gameActive = false;
            exitPointerLock();
            AudioSynth.playLose();

            elGameOverTitle.innerText = "WASTED";
            elGameOverTitle.className = "title-lose";
            elGameOverSubtitle.innerText = reason;
            elGameOver.style.display = 'flex';
            elCrosshair.style.display = 'none';

            if (inTurret) {
                inTurret = false;
                turretOccupant = null;
                sendNetworkMessage({ type: 'turret-vacate' });
            }

            sendNetworkMessage({
                type: 'opponent-died',
                reason: reason
            });
        }

        function updateHud() {
            document.getElementById('player-health-fill').style.width = myHealth + '%';
            document.getElementById('player-health-text').innerText = myHealth + ' HP';

            document.getElementById('opponent-health-fill').style.width = oppHealth + '%';
            document.getElementById('opponent-health-text').innerText = oppHealth + ' HP';

            updateMinecraftStatsUI();
            updateHotbarUI();
        }

        // Rematches
        let rematchRequestSent = false;
        let rematchRequestReceived = false;

        elBtnRematch.addEventListener('click', () => {
            rematchRequestSent = true;
            elBtnRematch.disabled = true;
            if (!isConnected) {
                resetMatch();
                return;
            }
            elRematchStatus.innerText = "Waiting for Opponent...";
            sendNetworkMessage({ type: 'rematch-request' });
            checkRematchTrigger();
        });

        function checkRematchTrigger() {
            if (!isConnected) {
                resetMatch();
                return;
            }
            if (rematchRequestSent && rematchRequestReceived) {
                resetMatch();
            }
        }

        function resetMatch() {
            myHealth = 100;
            oppHealth = 100;
            updateHud();
            
            hunger = 100;
            updateMinecraftStatsUI();
            hotbarItems = ['fists', 'kick', 'bow', null, null, null, null, null, null];
            hotbarCounts = [1, 1, 1, 0, 0, 0, 0, 0, 0];
            inventoryItems = new Array(27).fill(null);
            inventoryCounts = new Array(27).fill(0);
            selectedHotbarIndex = 0;
            updateHotbarUI();
            updateInventoryUI();
            clearAnimals();
            clearDroppedFoods();
            
            rematchRequestSent = false;
            rematchRequestReceived = false;
            elBtnRematch.disabled = false;
            elBtnRematch.innerText = "Request Rematch";
            elRematchStatus.innerText = "";
            elGameOver.style.display = 'none';

            // Reset movement keys
            moveForces.forward = false;
            moveForces.backward = false;
            moveForces.left = false;
            moveForces.right = false;

            // Clear flying arrows & turret shells
            if (typeof localArrows !== 'undefined') {
                localArrows.forEach(arrow => scene.remove(arrow.mesh));
                localArrows.length = 0;
            }
            if (typeof peerArrows !== 'undefined') {
                peerArrows.forEach(arrow => scene.remove(arrow.mesh));
                peerArrows.length = 0;
            }
            if (typeof skeletonArrows !== 'undefined') {
                skeletonArrows.forEach(arrow => scene.remove(arrow.mesh));
                skeletonArrows.length = 0;
            }
            if (typeof turretShells !== 'undefined') {
                turretShells.forEach(shell => scene.remove(shell.mesh));
                turretShells.length = 0;
            }
            if (typeof peerShells !== 'undefined') {
                peerShells.forEach(shell => scene.remove(shell.mesh));
                peerShells.length = 0;
            }

            // Reset spawns inside open plains
            const spawnZ = isHost ? 28 : 12;
            const spawnY = getTerrainHeight(60, spawnZ) + 1.6;
            camera.position.set(60, spawnY, spawnZ);
            camera.rotation.set(0, isHost ? 0 : Math.PI, 0);
            
            velocity.set(0, 0, 0);
            knockbackVel.set(0, 0, 0);
            isGrounded = true;

            // Reset Opponent mesh
            if (opponentGroup) {
                targetOpponentPos.set(60, 0, isHost ? 12 : 28);
                opponentGroup.position.copy(targetOpponentPos);
                opponentGroup.position.y = getTerrainHeight(targetOpponentPos.x, targetOpponentPos.z);
                targetOpponentRotY = isHost ? 0 : Math.PI;
                opponentGroup.rotation.y = targetOpponentRotY;
                resetOpponentColor();
            }

            activeWeapon = 'fists';
            updateWeaponUI();

            // Reset Turret / Zombie states
            inTurret = false;
            turretOccupant = null;
            if (turretHeadGroup) turretHeadGroup.rotation.set(0, 0, 0);
            clearZombies();
            ridingCube = null;
            spawnQuantumCubes();
            hasSpawnedZombiesThisNight = false;
            
            if (isHost) {
                const villagerData = [];
                const villageCenter = { x: -78, z: -78 };
                for (let i = 0; i < 5; i++) {
                    const id = Math.random().toString(36).substr(2, 6);
                    const vx = villageCenter.x + (Math.random() - 0.5) * 25;
                    const vz = villageCenter.z + (Math.random() - 0.5) * 25;
                    villagerData.push({ id, x: vx, z: vz });
                }
                spawnVillagers(villagerData);
                spawnInitialAnimals();
                
                if (isConnected) {
                    sendNetworkMessage({
                        type: 'sync-villagers',
                        villagers: villagerData
                    });
                }
            } else {
                clearVillagers();
            }

            gameActive = true;
            
            // Release keyboard focus
            document.activeElement.blur();
            window.focus();
            
            // Make sure player is visible on reset
            localPlayerInvisible = false;
            opponentInvisible = false;
            inBush = false;
            activeBushId = null;
            if (opponentGroup) opponentGroup.visible = isConnected;
            
            const oppCard = document.querySelector('.opponent-card');
            if (oppCard) oppCard.style.display = isConnected ? 'flex' : 'none';
            
            requestPointerLock();
        }

        function resetGameScene() {
            myHealth = 100;
            oppHealth = 100;
            updateHud();
            
            hunger = 100;
            updateMinecraftStatsUI();
            hotbarItems = ['fists', 'kick', 'bow', null, null, null, null, null, null];
            hotbarCounts = [1, 1, 1, 0, 0, 0, 0, 0, 0];
            inventoryItems = new Array(27).fill(null);
            inventoryCounts = new Array(27).fill(0);
            selectedHotbarIndex = 0;
            updateHotbarUI();
            updateInventoryUI();
            clearAnimals();
            clearDroppedFoods();

            rematchRequestSent = false;
            rematchRequestReceived = false;
            elBtnRematch.disabled = false;
            elRematchStatus.innerText = "";
            activeWeapon = 'fists';
            updateWeaponUI();
            
            // Reset Turret / Zombie states
            inTurret = false;
            turretOccupant = null;
            if (turretHeadGroup) turretHeadGroup.rotation.set(0, 0, 0);
            clearZombies();
            hasSpawnedZombiesThisNight = false;
            
            // Reset local/opponent invisibility
            localPlayerInvisible = false;
            opponentInvisible = false;
            inBush = false;
            activeBushId = null;
            if (opponentGroup) opponentGroup.visible = isConnected;
            
            const oppCard = document.querySelector('.opponent-card');
            if (oppCard) oppCard.style.display = isConnected ? 'flex' : 'none';

            const villagerData = [];
            const villageCenter = { x: -78, z: -78 };
            for (let i = 0; i < 5; i++) {
                const id = Math.random().toString(36).substr(2, 6);
                const vx = villageCenter.x + (Math.random() - 0.5) * 25;
                const vz = villageCenter.z + (Math.random() - 0.5) * 25;
                villagerData.push({ id, x: vx, z: vz });
            }
            spawnVillagers(villagerData);
            spawnInitialAnimals();
        }

        // --- NETWORKING DATA SYNC ---

        function sendNetworkMessage(msg) {
            if (conn && conn.open) {
                conn.send(JSON.stringify(msg));
            }
        }

        function handleNetworkMessage(data) {
            let msg;
            try {
                msg = JSON.parse(data);
            } catch(e) {
                console.error("Invalid packet", e);
                return;
            }

            switch(msg.type) {
                case 'init-map':
                    // Spawn synced random trash cans
                    trashCanCoords.length = 0;
                    trashCanCoords.push(...msg.trashCans);
                    createTrashCans(trashCanCoords);
                    
                    // Spawn synced turret
                    if (msg.turretX !== undefined && msg.turretZ !== undefined) {
                        spawnTurretMesh(msg.turretX, msg.turretZ);
                    }

                    // Spawn synced villagers
                    if (msg.villagers) {
                        spawnVillagers(msg.villagers);
                    }
                    break;
                case 'quantum-cubes-sync':
                    if (typeof msg.cubes !== 'undefined') {
                        msg.cubes.forEach(syncData => {
                            const cube = quantumCubes.find(c => c.id === syncData.id);
                            if (cube) {
                                if (!ridingCube || ridingCube.id !== cube.id) {
                                    cube.mesh.position.set(syncData.x, syncData.y, syncData.z);
                                    cube.mesh.rotation.y = syncData.ry;
                                    cube.rider = syncData.rider;
                                }
                            }
                        });
                    }
                    break;
                case 'quantum-cube-client-update':
                    const clientCube = quantumCubes.find(c => c.id === msg.id);
                    if (clientCube) {
                        clientCube.mesh.position.set(msg.x, msg.y, msg.z);
                        clientCube.mesh.rotation.y = msg.ry;
                        clientCube.rider = msg.rider;
                    }
                    break;
                case 'pos-sync':
                    targetOpponentPos.set(msg.x, msg.y, msg.z);
                    targetOpponentRotY = msg.ry + Math.PI;
                    break;
                case 'punch-trigger':
                    isOpponentPunching = true;
                    opponentPunchTimer = 0;
                    break;
                case 'kick-trigger':
                    isOpponentKicking = true;
                    opponentKickTimer = 0;
                    break;
                case 'fire-arrow':
                    // Spawn visual flying arrow from peer
                    const arrowGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.7, 4);
                    arrowGeo.rotateX(Math.PI / 2);
                    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
                    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
                    arrowMesh.position.set(msg.x, msg.y, msg.z);
                    scene.add(arrowMesh);
                    
                    peerArrows.push({
                        id: msg.id,
                        mesh: arrowMesh,
                        vel: new THREE.Vector3(msg.vx, msg.vy, msg.vz),
                        pos: new THREE.Vector3(msg.x, msg.y, msg.z)
                    });
                    break;
                case 'hit':
                    takeDamage(msg.damage, msg.knockbackX, msg.knockbackZ, "Killed by Opponent!");
                    break;
                case 'health-sync':
                    if (msg.health < oppHealth) {
                        flashOpponentRed();
                    }
                    oppHealth = msg.health;
                    updateHud();
                    break;
                case 'fire-state':
                    isOpponentBurning = msg.burning;
                    break;
                case 'appearance':
                    opponentAppearance = {
                        skin: msg.skin,
                        hair: msg.hair,
                        eye: msg.eye,
                        shirt: msg.shirt,
                        pants: msg.pants
                    };
                    rebuildOpponentMesh();
                    break;
                case 'trashed':
                    oppHealth = 0;
                    updateHud();
                    declareWinner("You threw the opponent into the trash bin!");
                    break;
                case 'win-state':
                    declareLoser("Defeated by Opponent!");
                    break;
                case 'opponent-died':
                    oppHealth = 0;
                    updateHud();
                    declareWinner(getVictorySubtitle(msg.reason));
                    break;
                case 'rematch-request':
                    rematchRequestReceived = true;
                    elRematchStatus.innerText = "Opponent wants a Rematch!";
                    checkRematchTrigger();
                    break;
                case 'turret-rotation':
                    if (turretHeadGroup) {
                        turretHeadGroup.rotation.y = msg.ry;
                        turretHeadGroup.rotation.x = msg.rx;
                    }
                    break;
                case 'turret-occupy':
                    turretOccupant = 'peer';
                    break;
                case 'turret-vacate':
                    turretOccupant = null;
                    if (turretHeadGroup) turretHeadGroup.rotation.set(0, 0, 0);
                    break;
                case 'fire-explosive':
                    // Spawn visual flying shell from peer
                    const peerShellGeo = new THREE.SphereGeometry(0.25, 8, 8);
                    const peerShellMat = new THREE.MeshBasicMaterial({ color: 0xff4500, toneMapped: false });
                    const peerShellMesh = new THREE.Mesh(peerShellGeo, peerShellMat);
                    peerShellMesh.position.set(msg.x, msg.y, msg.z);
                    
                    const peerShellLight = new THREE.PointLight(0xff4500, 1.5, 6);
                    peerShellMesh.add(peerShellLight);
                    
                    scene.add(peerShellMesh);
                    
                    peerShells.push({
                        id: msg.id,
                        mesh: peerShellMesh,
                        vel: new THREE.Vector3(msg.vx, msg.vy, msg.vz),
                        pos: new THREE.Vector3(msg.x, msg.y, msg.z)
                    });
                    break;
                case 'zombies-sync':
                    const activeIds = new Set();
                    msg.zombies.forEach(zd => {
                        activeIds.add(zd.id);
                        let mesh = clientZombies.get(zd.id);
                        if (!mesh) {
                            mesh = zd.type === 'creeper' ? createCreeperMesh() : (zd.type === 'skeleton' ? createSkeletonMesh() : createZombieMesh());
                            mesh.zombieType = zd.type || 'zombie';
                            scene.add(mesh);
                            clientZombies.set(zd.id, mesh);
                        }
                        
                        mesh.position.set(zd.x, zd.y, zd.z);
                        mesh.rotation.y = zd.ry;
                        
                        if (zd.isDead) {
                            const slumpProgress = Math.min(1.0, zd.deathTime / 0.8);
                            mesh.rotation.x = slumpProgress * (-Math.PI / 2);
                            mesh.position.y = zd.y + 0.15 * (1 - slumpProgress);
                            if (mesh.zombieType === 'creeper') {
                                mesh.children[2].rotation.x = slumpProgress * Math.PI / 2;
                                mesh.children[3].rotation.x = slumpProgress * Math.PI / 2;
                            } else if (mesh.zombieType === 'skeleton') {
                                mesh.children[2].rotation.x = -Math.PI / 2.1 + slumpProgress * Math.PI / 2;
                                mesh.children[3].rotation.x = -Math.PI / 1.8 + slumpProgress * Math.PI / 2;
                            } else {
                                mesh.children[2].rotation.x = -Math.PI / 2.2 + slumpProgress * Math.PI / 2;
                                mesh.children[3].rotation.x = -Math.PI / 2.2 + slumpProgress * Math.PI / 2;
                            }
                        } else {
                            mesh.rotation.x = 0;
                            
                            if (zd.isHissing) {
                                if (!mesh.isHissing) {
                                    mesh.isHissing = true;
                                    mesh.hissStartTime = Date.now();
                                    AudioSynth.playHiss();
                                }
                                const elapsed = (Date.now() - mesh.hissStartTime) / 1000;
                                const swell = 1.0 + Math.min(1.0, elapsed / 2.0) * 0.35;
                                mesh.scale.set(swell, swell, swell);
                                
                                if (mesh.zombieType === 'creeper') {
                                    mesh.children[2].rotation.x = 0;
                                    mesh.children[3].rotation.x = 0;
                                    mesh.children[4].rotation.x = 0;
                                    mesh.children[5].rotation.x = 0;
                                }
                            } else {
                                mesh.isHissing = false;
                                mesh.scale.set(1, 1, 1);
                                
                                const walkSpeed = 10;
                                if (mesh.zombieType === 'creeper') {
                                    const angle = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.4;
                                    mesh.children[2].rotation.x = angle;
                                    mesh.children[5].rotation.x = angle;
                                    mesh.children[3].rotation.x = -angle;
                                    mesh.children[4].rotation.x = -angle;
                                } else if (mesh.zombieType === 'skeleton') {
                                    mesh.children[4].rotation.x = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.4;
                                    mesh.children[5].rotation.x = -Math.sin(Date.now() * 0.01 * walkSpeed) * 0.4;
                                } else {
                                    mesh.children[4].rotation.x = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.4;
                                    mesh.children[5].rotation.x = -Math.sin(Date.now() * 0.01 * walkSpeed) * 0.4;
                                    
                                    if (zd.isAttacking) {
                                        const angle = -Math.PI / 2.2 - 0.6;
                                        mesh.children[2].rotation.x = angle;
                                        mesh.children[3].rotation.x = angle;
                                    } else {
                                        mesh.children[2].rotation.x = -Math.PI / 2.2;
                                        mesh.children[3].rotation.x = -Math.PI / 2.2;
                                    }
                                }
                            }
    
                            if (zd.isBurning) {
                                spawnFireParticles(mesh.position, 1);
                            }
                        }
                    });
                    
                    clientZombies.forEach((mesh, id) => {
                        if (!activeIds.has(id)) {
                            scene.remove(mesh);
                            clientZombies.delete(id);
                        }
                    });
                    break;
                case 'zombies-clear':
                    clientZombies.forEach(mesh => {
                        scene.remove(mesh);
                    });
                    clientZombies.clear();
                    break;
                case 'zombie-hit':
                    takeDamage(msg.damage, msg.kx, msg.kz, "Killed by Zombie!");
                    break;
                case 'bee-hit':
                    takeDamage(msg.damage, msg.kx, msg.kz, "Stung to death by Bees!");
                    break;
                case 'damage-bee':
                    if (isHost) {
                        const b = bees.find(x => x.id === msg.id);
                        if (b && b.hp > 0) {
                            b.hp = Math.max(0, b.hp - msg.damage);
                            flashBeeRed(b.mesh);
                            beesAngryAt = 'client';
                            beesAngerStartTime = Date.now();
                            if (b.hp <= 0) {
                                b.mesh.rotation.x = Math.PI;
                            }
                        }
                    }
                    break;
                case 'bees-sync':
                    const activeBeeIds = new Set();
                    msg.bees.forEach(bd => {
                        activeBeeIds.add(bd.id);
                        let mesh = clientBees.get(bd.id);
                        if (!mesh) {
                            mesh = createBeeMesh();
                            scene.add(mesh);
                            clientBees.set(bd.id, mesh);
                        }
                        mesh.position.set(bd.x, bd.y, bd.z);
                        mesh.rotation.y = bd.ry;
                        
                        if (bd.hp <= 0) {
                            mesh.rotation.x = Math.PI; // Upside down
                        } else {
                            mesh.rotation.x = 0;
                            if (mesh.children[1] && mesh.children[2]) {
                                mesh.children[1].rotation.z = Math.sin(Date.now() * 0.08) * 0.6;
                                mesh.children[2].rotation.z = -Math.sin(Date.now() * 0.08) * 0.6;
                            }
                        }
                    });
                    clientBees.forEach((mesh, id) => {
                        if (!activeBeeIds.has(id)) {
                            scene.remove(mesh);
                            clientBees.delete(id);
                        }
                    });
                    break;
                case 'damage-zombie':
                    if (isHost) {
                        const z = zombies.find(x => x.id === msg.id);
                        if (z && !z.isDead) {
                            z.health = Math.max(0, z.health - msg.damage);
                            z.kx = msg.kx;
                            z.kz = msg.kz;
                            flashZombieRed(z.mesh);
                            if (z.health <= 0) {
                                z.isDead = true;
                                z.deathTime = 0;
                            }
                        }
                    }
                    break;
                case 'sync-villagers':
                    if (msg.villagers) {
                        spawnVillagers(msg.villagers);
                    }
                    break;
                case 'damage-villager':
                    const v = villagers.find(x => x.id === msg.id);
                    if (v && !v.isDead) {
                        v.health = Math.max(0, v.health - msg.damage);
                        v.kx = msg.kx;
                        v.kz = msg.kz;
                        flashVillagerRed(v.mesh);
                        if (v.health <= 0) {
                            v.isDead = true;
                            v.deathTime = 0;
                        }
                    }
                    break;
                case 'invisibility-state':
                    opponentInvisible = msg.invisible;
                    if (opponentGroup) {
                        opponentGroup.visible = !msg.invisible;
                    }
                    break;
                case 'chat-msg':
                    addChatMessage(msg.text, 'opponent');
                    break;
                case 'time-sync':
                    timeOffset = msg.offset;
                    addChatMessage("Opponent set time to night.", "system");
                    break;
                case 'creeper-explode':
                    createExplosionEffect(msg.x, msg.y, msg.z, 4.5, 10, false);
                    break;
            }
        }

        // Start Arena
        function startGame() {
            elLobby.style.display = 'none';
            elHud.style.display = 'flex';
            gameActive = true;

            // Release keyboard focus from Peer ID input box
            document.activeElement.blur();
            window.focus();

            // Initialize ThreeJS
            if (!scene) {
                init3D();
                
                // Host generates random coordinates for trash cans and sends to Client
                if (isHost) {
                    const coords = [];
                    for (let i = 0; i < 8; i++) {
                        let x, z;
                        if (i % 2 === 0) { // Plains area
                            x = 15 + Math.random() * 110;
                            z = -60 + Math.random() * 120;
                        } else { // Forest/village valleys
                            x = -130 + Math.random() * 100;
                            z = -130 + Math.random() * 100;
                        }
                        coords.push({ x, z });
                    }
                    trashCanCoords.push(...coords);
                    createTrashCans(trashCanCoords);
                    
                    // Host generates the turret position in the village valley center
                    let turretX = -78;
                    let turretZ = -78;

                    // Host generates villagers
                    const villagerData = [];
                    const villageCenter = { x: -78, z: -78 };
                    for (let i = 0; i < 5; i++) {
                        const id = Math.random().toString(36).substr(2, 6);
                        const vx = villageCenter.x + (Math.random() - 0.5) * 25;
                        const vz = villageCenter.z + (Math.random() - 0.5) * 25;
                        villagerData.push({ id, x: vx, z: vz });
                    }
                    
                    setTimeout(() => {
                        sendNetworkMessage({
                            type: 'init-map',
                            trashCans: trashCanCoords,
                            turretX: turretX,
                            turretZ: turretZ,
                            villagers: villagerData
                        });
                    }, 400);
                    
                    spawnTurretMesh(turretX, turretZ);
                    spawnVillagers(villagerData);
                    spawnInitialAnimals();
                    animate();
                } else {
                    animate();
                }
            } else {
                resetMatch();
            }
            
            const oppCard = document.querySelector('.opponent-card');
            if (oppCard) oppCard.style.display = isConnected ? 'flex' : 'none';

            updateHud();

            addChatMessage("Press [T] to chat. Type /night to set to night.", "system");
            requestPointerLock();

            // Show canvas capture prompt if auto pointer lock was denied
            if (!isLocked) {
                const prompt = document.getElementById('click-lock-prompt');
                if (prompt) prompt.style.display = 'block';
            }
        }

        // Toggle controls tip in HUD
        function toggleControlsHelp() {
            const hudHelp = document.getElementById('hud-controls-tip');
            if (hudHelp) {
                const isHidden = hudHelp.style.display === 'none';
                hudHelp.style.display = isHidden ? 'flex' : 'none';
                
                const hudPrompt = document.getElementById('hud-instructions-prompt');
                if (hudPrompt) {
                    hudPrompt.style.display = isHidden ? 'none' : 'block';
                }
            }
        }

        // Movement Helpers
        function moveForward(distance) {
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            direction.y = 0; // lock flat
            direction.normalize();
            camera.position.addScaledVector(direction, distance);
        }

        function moveRight(distance) {
            const direction = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            direction.y = 0;
            direction.normalize();
            camera.position.addScaledVector(direction, distance);
        }

        // --- ANIMATION LOOP & PHYSICS UPDATES ---

        function animate() {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            // Animate portals
            if (typeof portalVortices !== 'undefined') {
                portalVortices.forEach(vortex => {
                    vortex.material.opacity = 0.45 + Math.sin(time * 5.0) * 0.1;
                    const s = 1.0 + Math.sin(time * 3.0) * 0.02;
                    vortex.scale.set(s, s, 1.0);
                });
            }

            // Run Day-Night Cycle Updates
            updateDayNightCycle();
            
            // Update Quantum Cubes
            updateQuantumCubes(delta);

            // Host updates zombies and bees
            if (isHost && gameActive) {
                updateZombies(delta);
                updateBees(delta);
            }

            // Periodic Ambient Sounds (clacking, moaning, hrrming, buzzing)
            if (gameActive) {
                if (isHost) {
                    zombies.forEach(z => {
                        if (z.isDead) return;
                        if (Math.random() < 0.0015) {
                            if (z.type === 'skeleton') {
                                AudioSynth.playClack(z.mesh.position);
                            } else {
                                AudioSynth.playMoan(z.mesh.position);
                            }
                        }
                    });
                    bees.forEach(b => {
                        if (b.hp > 0 && Math.random() < 0.015) {
                            AudioSynth.playBuzz(b.pos);
                        }
                    });
                } else {
                    clientZombies.forEach((mesh) => {
                        if (Math.random() < 0.0015) {
                            if (mesh.zombieType === 'skeleton') {
                                AudioSynth.playClack(mesh.position);
                            } else {
                                AudioSynth.playMoan(mesh.position);
                            }
                        }
                    });
                    clientBees.forEach((mesh) => {
                        if (Math.random() < 0.015) {
                            AudioSynth.playBuzz(mesh.position);
                        }
                    });
                }
                
                villagers.forEach(v => {
                    if (v.isDead) return;
                    if (Math.random() < 0.0015) {
                        AudioSynth.playHrrm(v.mesh.position);
                    }
                });
                animals.forEach(a => {
                    if (a.isDead) return;
                    if (Math.random() < 0.0015) {
                        AudioSynth.playAnimalSound(a.type, a.mesh.position);
                    }
                });
            }

            if (gameActive && myHealth > 0) {
                updatePlayerPhysics(delta);
                updateFirstPersonAnimations(delta);
                checkTrashCans();
                
                // Turret Proximity HUD prompt & Camera lock updates
                updateTurretState(delta);

                updatePlayerBurning(delta);
            }

            if (gameActive) {
                updateVillagers(delta);
                updateProjectiles(delta);
                updateAnimals(delta);
                updateDroppedFoods(delta);
                updateHunger(delta);
            }

            if (isConnected) {
                updateOpponentAnimations(delta, time);
                syncPlayerPosition();
                
                if (inTurret) {
                    syncTurretRotation();
                }

                if (opponentGroup && isOpponentBurning) {
                    spawnFireParticles(opponentGroup.position, 1);
                }
            }

            updateFireParticles(delta);

            if (mapOpen) {
                drawRadarMap();
            }

            // Decay camera recoil
            camHitRecoil.lerp(new THREE.Vector3(), 0.15);
            camHitTilt = THREE.MathUtils.lerp(camHitTilt, 0, 0.15);

            // Apply visual offsets to camera and zombies before rendering
            camera.position.add(camHitRecoil);
            camera.rotation.x += camHitTilt;

            for (let [mesh, r] of zombieRecoilMap) {
                r.pos.lerp(new THREE.Vector3(), 0.15);
                r.rotX = THREE.MathUtils.lerp(r.rotX, 0, 0.15);
                mesh.position.add(r.pos);
                mesh.rotation.x = r.rotX;
            }

            renderer.render(scene, camera);

            // Reset visual offsets immediately after rendering to keep physics clean
            camera.position.sub(camHitRecoil);
            camera.rotation.x -= camHitTilt;

            for (let [mesh, r] of zombieRecoilMap) {
                mesh.position.sub(r.pos);
                mesh.rotation.x = 0;
                
                if (r.pos.lengthSq() < 0.0001 && Math.abs(r.rotX) < 0.005) {
                    zombieRecoilMap.delete(mesh);
                }
            }
        }

        // Turret proximity checks and local player updates
        function updateTurretState(delta) {
            if (myHealth <= 0) return;
            
            const elTurretPrompt = document.getElementById('turret-prompt');
            if (!elTurretPrompt) return;

            // 0. If riding a quantum cube
            if (typeof ridingCube !== 'undefined' && ridingCube) {
                elTurretPrompt.innerText = "PRESS [R] TO DISMOUNT QUANTUM CUBE";
                elTurretPrompt.style.display = "block";
                elTurretPrompt.style.borderColor = "var(--cyan)";
                elTurretPrompt.style.color = "var(--cyan)";
                elTurretPrompt.style.textShadow = "0 0 8px rgba(0, 240, 255, 0.6)";
                return;
            }

            // 1. If inside a bush
            if (inBush) {
                elTurretPrompt.innerText = "PRESS [F] TO EXIT BUSH";
                elTurretPrompt.style.display = "block";
                elTurretPrompt.style.borderColor = "var(--cyan)";
                elTurretPrompt.style.color = "var(--cyan)";
                elTurretPrompt.style.textShadow = "0 0 8px rgba(0, 240, 255, 0.6)";
                return;
            }

            // 2. If inside the turret
            if (inTurret) {
                // Sync rotation of local turret head model to camera look angles
                if (turretHeadGroup) {
                    turretHeadGroup.rotation.y = camera.rotation.y;
                    turretHeadGroup.rotation.x = camera.rotation.x;
                }
                
                // Show exit prompt, but decay after 3 seconds
                const elapsed = Date.now() - turretEnterTime;
                if (elapsed < 3000) {
                    elTurretPrompt.innerText = "PRESS [F] TO EXIT TURRET";
                    elTurretPrompt.style.display = "block";
                    elTurretPrompt.style.borderColor = "var(--magenta)";
                    elTurretPrompt.style.color = "var(--magenta)";
                    elTurretPrompt.style.textShadow = "0 0 8px rgba(255, 0, 127, 0.6)";
                } else {
                    elTurretPrompt.style.display = "none";
                }
                return;
            }

            // 2b. Check if near any quantum cube to ride
            let closestCube = null;
            let minCubeDist = Infinity;
            quantumCubes.forEach(c => {
                if (c.rider) return;
                const dx = camera.position.x - c.mesh.position.x;
                const dz = camera.position.z - c.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < minCubeDist) {
                    minCubeDist = dist;
                    closestCube = c;
                }
            });
            
            if (closestCube && minCubeDist < 4.0) {
                elTurretPrompt.innerText = "PRESS [R] TO RIDE QUANTUM CUBE";
                elTurretPrompt.style.display = "block";
                elTurretPrompt.style.borderColor = "var(--yellow)";
                elTurretPrompt.style.color = "var(--yellow)";
                elTurretPrompt.style.textShadow = "0 0 8px rgba(255, 234, 0, 0.6)";
                return;
            }

            // 3. Check if near a bush to enter
            let closestBush = null;
            let minBushDist = Infinity;
            bushes.forEach(b => {
                const dist = Math.sqrt((camera.position.x - b.x) ** 2 + (camera.position.z - b.z) ** 2);
                if (dist < minBushDist) {
                    minBushDist = dist;
                    closestBush = b;
                }
            });

            if (closestBush && minBushDist < 3.0) {
                elTurretPrompt.innerText = "PRESS [F] TO HIDE IN BUSH";
                elTurretPrompt.style.display = "block";
                elTurretPrompt.style.borderColor = "var(--green)";
                elTurretPrompt.style.color = "#32cd32";
                elTurretPrompt.style.textShadow = "0 0 8px rgba(50, 205, 50, 0.6)";
                return;
            }

            // 4. Check if near the turret
            if (turretActive) {
                const dx = camera.position.x - turretPos.x;
                const dz = camera.position.z - turretPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < 4.0) {
                    if (turretOccupant) {
                        elTurretPrompt.innerText = "TURRET OCCUPIED";
                        elTurretPrompt.style.borderColor = "rgba(255,255,255,0.2)";
                        elTurretPrompt.style.color = "#8a90a0";
                        elTurretPrompt.style.textShadow = "none";
                    } else {
                        elTurretPrompt.innerText = "PRESS [F] TO ENTER TURRET";
                        elTurretPrompt.style.borderColor = "var(--yellow)";
                        elTurretPrompt.style.color = "var(--yellow)";
                        elTurretPrompt.style.textShadow = "0 0 8px rgba(255, 234, 0, 0.6)";
                    }
                    elTurretPrompt.style.display = "block";
                    return;
                }
            }

            // Otherwise, hide the prompt
            if (elTurretPrompt.style.display === "block") {
                elTurretPrompt.style.display = "none";
            }
        }

        // Day-Night Cycle Handler (Day: 8 min = 480s, Midday: 30s, Night: 5min = 300s)
        function updateDayNightCycle() {
            const totalCycleMs = CYCLE_DURATION * 1000;
            const cycleTime = ((Date.now() + timeOffset) % totalCycleMs) / 1000; // time in seconds (0 to 810)

            let phaseName = "DAYTIME";
            let skyColor = new THREE.Color();
            let sunIntensity = 0;
            let moonIntensity = 0;
            let starOpacity = 0;
            let windowIntensity = 0;

            // Sun / Moon angle sweeps
            let sunAngle = 0;
            let moonAngle = 0;

            if (cycleTime < 30) {
                // Dawn transition (30s)
                phaseName = "DAWN";
                const alpha = cycleTime / 30;
                skyColor.setHex(0x0d1124).lerp(new THREE.Color(0xff5e36), alpha); // indigo to orange
                sunIntensity = 0.5 * alpha;
                starOpacity = 1.0 - alpha;
                windowIntensity = 1.0 - alpha;
                sunAngle = (cycleTime / 540) * Math.PI; // sun rises
            } 
            else if (cycleTime < 450) {
                // Morning / Day (420s = 7 mins)
                phaseName = "DAYTIME";
                const alpha = (cycleTime - 30) / 420;
                skyColor.setHex(0xff5e36).lerp(new THREE.Color(0x00a2ff), Math.min(1.0, alpha * 4.0)); // blend orange to bright sky blue quickly
                sunIntensity = 1.2;
                sunAngle = (cycleTime / 540) * Math.PI;
            } 
            else if (cycleTime < 480) {
                // Midday Zenith (30s)
                phaseName = "MIDDAY";
                skyColor.setHex(0x00a2ff); // Identical to daytime sky color
                sunIntensity = 1.2; // Identical daytime brightness
                sunAngle = Math.PI / 2; // directly above
            } 
            else if (cycleTime < 510) {
                // Afternoon / Dusk entry (30s)
                phaseName = "DAYTIME";
                skyColor.setHex(0x00a2ff);
                sunIntensity = 1.2;
                sunAngle = (cycleTime / 540) * Math.PI;
            } 
            else if (cycleTime < 540) {
                // Dusk/Sunset transition (30s)
                phaseName = "DUSK";
                const alpha = (cycleTime - 510) / 30;
                skyColor.setHex(0x00a2ff).lerp(new THREE.Color(0x4a0e4e), alpha); // blue to purple
                sunIntensity = 1.2 * (1.0 - alpha);
                starOpacity = alpha;
                windowIntensity = alpha;
                sunAngle = (cycleTime / 540) * Math.PI; // sun sinks
            } 
            else {
                // Night (300s = 5 mins)
                phaseName = "NIGHTTIME";
                const nightTime = cycleTime - 540; // 0 to 270s
                skyColor.setHex(0x0d1124); // Soft indigo night sky
                moonIntensity = 0.65; // High-visibility moonlight
                starOpacity = 1.0;
                windowIntensity = 1.0;
                
                // Moon sweeps the sky
                moonAngle = (nightTime / 270) * Math.PI;
            }

            // Apply lighting variables
            skyMat.color.copy(skyColor);
            scene.fog.color.copy(skyColor);
            renderer.setClearColor(skyColor);

            // Set ambient light intensity dynamically to prevent night pitch-black
            if (ambientLight) {
                if (cycleTime < 540) {
                    ambientLight.intensity = 0.4; // Daytime ambient
                } else {
                    ambientLight.intensity = 0.35; // Nighttime ambient (soft indigo moonlight fill)
                }
            }

            // Position celestial body spheres
            if (cycleTime < 540) {
                sunLight.intensity = sunIntensity;
                sunLight.position.set(Math.cos(sunAngle) * 150, Math.sin(sunAngle) * 150, 0);
                sunSphere.position.copy(sunLight.position);
                sunSphere.visible = true;
                
                moonLight.intensity = 0;
                moonSphere.visible = false;
            } else {
                sunLight.intensity = 0;
                sunSphere.visible = false;
                
                moonLight.intensity = moonIntensity;
                moonLight.position.set(Math.cos(moonAngle) * 150, Math.sin(moonAngle) * 150, 0);
                moonSphere.position.copy(moonLight.position);
                moonSphere.visible = true;
            }

            // Update starfield opacity
            starField.material.opacity = starOpacity;

            // Update village house windows glow
            houseWindows.forEach(w => {
                if (windowIntensity > 0.05) {
                    w.material.color.setHex(0xffea00); // Glowing yellow
                } else {
                    w.material.color.setHex(0x222222); // Turned off grey
                }
            });

            isDayTime = (cycleTime < 540);

            // Zombie Spawn and Dawn cleanup triggers
            if (!isDayTime) {
                if (isHost && !hasSpawnedZombiesThisNight && gameActive) {
                    clearZombies(); // Clear old dead bodies
                    spawnInitialZombies(); // Spawn 8 zombies
                    hasSpawnedZombiesThisNight = true;
                    lastNightSpawnTime = Date.now();
                }
                
                // Periodic wave spawning at night
                if (isHost && gameActive && hasSpawnedZombiesThisNight) {
                    const now = Date.now();
                    if (now - lastNightSpawnTime > 15000) { // every 15 seconds
                        const aliveCount = zombies.filter(z => !z.isDead).length;
                        if (aliveCount < 15) {
                            spawnMoreZombies(3); // Spawn 3 more
                        }
                        lastNightSpawnTime = now;
                    }
                }
            } else {
                if (hasSpawnedZombiesThisNight) {
                    hasSpawnedZombiesThisNight = false;
                }
            }

            // Display time HUD
            const min = Math.floor(cycleTime / 60);
            const sec = Math.floor(cycleTime % 60);
            document.getElementById('time-cycle-phase').innerText = phaseName;
            document.getElementById('time-cycle-timer').innerText = 
                (min < 10 ? '0' + min : min) + ":" + (sec < 10 ? '0' + sec : sec);

            // Quantum Lands Atmosphere Override
            const inQuantumLands = (camera.position.x > 1400);
            if (inQuantumLands) {
                // Eerie dark quantum green sky
                const qSkyColor = new THREE.Color(0x051e08); 
                skyMat.color.copy(qSkyColor);
                scene.fog.color.copy(qSkyColor);
                renderer.setClearColor(qSkyColor);
                
                // Dense fog
                scene.fog.density = 0.022; // denser fog
                
                if (ambientLight) {
                    ambientLight.intensity = 0.25;
                    ambientLight.color.setHex(0x00ff33); // green ambient glow
                }
                if (sunLight) sunLight.intensity = 0;
                if (moonLight) {
                    moonLight.intensity = 0.15; // faint green glow
                    moonLight.color.setHex(0x00ff33);
                }
                if (typeof starField !== 'undefined' && starField.material) {
                    starField.material.opacity = 0.2; // faint stars
                }
            } else {
                // Restore default fog density (default is 0.007)
                scene.fog.density = 0.007;
                if (ambientLight) {
                    ambientLight.color.setHex(0xffffff); // restore normal color
                }
                if (moonLight) {
                    moonLight.color.setHex(0xffffff);
                }
            }
        }

        // Draw tactical radar mini-map overlay (Key M)
        function drawRadarMap() {
            if (!mapCtx) return;

            // Clear radar (deep ocean background)
            mapCtx.fillStyle = '#0a1a2f';
            mapCtx.fillRect(0, 0, 500, 500);

            const mapCenterX = camera.position.x + mapOffsetX;
            const mapCenterZ = camera.position.z + mapOffsetZ;

            const mapX = (worldX) => 250 + ((worldX - mapCenterX) / (200 / mapZoom)) * 250;
            const mapZ = (worldZ) => 250 + ((worldZ - mapCenterZ) / (200 / mapZoom)) * 250;

            // Draw dynamic grid lines
            mapCtx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            mapCtx.lineWidth = 1;
            const startGridX = Math.floor((mapCenterX - 250 * (200 / mapZoom) / 250) / 100) * 100;
            const endGridX = Math.ceil((mapCenterX + 250 * (200 / mapZoom) / 250) / 100) * 100;
            for (let gx = startGridX; gx <= endGridX; gx += 100) {
                mapCtx.beginPath();
                mapCtx.moveTo(mapX(gx), 0);
                mapCtx.lineTo(mapX(gx), 500);
                mapCtx.stroke();
            }
            const startGridZ = Math.floor((mapCenterZ - 250 * (200 / mapZoom) / 250) / 100) * 100;
            const endGridZ = Math.ceil((mapCenterZ + 250 * (200 / mapZoom) / 250) / 100) * 100;
            for (let gz = startGridZ; gz <= endGridZ; gz += 100) {
                mapCtx.beginPath();
                mapCtx.moveTo(0, mapZ(gz));
                mapCtx.lineTo(500, mapZ(gz));
                mapCtx.stroke();
            }

            // Draw Biome Islands
            const scaleR = (r) => (r / 200) * 250 * mapZoom;

            // 1. Main Island land mass (center 0,0, radius 210)
            mapCtx.fillStyle = 'rgba(46, 125, 50, 0.2)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(0), mapZ(0), scaleR(210), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(46, 125, 50, 0.3)';
            mapCtx.stroke();

            // Forest Hills sub-region (center -80, 80, radius 70)
            mapCtx.fillStyle = 'rgba(15, 60, 30, 0.25)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(-80), mapZ(80), scaleR(70), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(30, 100, 50, 0.3)';
            mapCtx.stroke();
            
            mapCtx.fillStyle = 'rgba(50, 220, 100, 0.45)';
            mapCtx.font = '900 11px Orbitron';
            mapCtx.textAlign = 'center';
            mapCtx.fillText("FOREST HILLS", mapX(-80), mapZ(80));

            // Village Vale sub-region (center -80, -80, radius 50)
            mapCtx.fillStyle = 'rgba(90, 55, 25, 0.25)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(-80), mapZ(-80), scaleR(50), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(120, 80, 40, 0.3)';
            mapCtx.stroke();

            mapCtx.fillStyle = 'rgba(210, 140, 80, 0.45)';
            mapCtx.font = '900 11px Orbitron';
            mapCtx.textAlign = 'center';
            mapCtx.fillText("VILLAGE VALE", mapX(-80), mapZ(-90));

            // Draw Village 1 houses
            const villageHouses = [
                { x: -85, z: -85 },
                { x: -65, z: -80 },
                { x: -75, z: -60 },
                { x: -95, z: -70 },
                { x: -90, z: -98 },
                { x: -70, z: -100 }
            ];
            mapCtx.fillStyle = '#8c5830';
            villageHouses.forEach(h => {
                mapCtx.fillRect(mapX(h.x) - 4 * mapZoom, mapZ(h.z) - 4 * mapZoom, 8 * mapZoom, 8 * mapZoom);
            });

            // Open Plains sub-region (center 60, 20, radius 80)
            mapCtx.fillStyle = 'rgba(150, 130, 30, 0.05)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(60), mapZ(20), scaleR(80), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(180, 160, 40, 0.15)';
            mapCtx.stroke();

            mapCtx.fillStyle = 'rgba(240, 210, 80, 0.4)';
            mapCtx.font = '900 11px Orbitron';
            mapCtx.textAlign = 'center';
            mapCtx.fillText("OPEN PLAINS", mapX(60), mapZ(20));

            // 2. Desert Island (center 350, -350, radius 180)
            mapCtx.fillStyle = 'rgba(215, 190, 120, 0.22)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(350), mapZ(-350), scaleR(180), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(235, 210, 140, 0.3)';
            mapCtx.stroke();

            mapCtx.fillStyle = 'rgba(235, 210, 140, 0.55)';
            mapCtx.font = '900 11px Orbitron';
            mapCtx.textAlign = 'center';
            mapCtx.fillText("DESERT DUNES", mapX(350), mapZ(-350));

            // 3. Cherry Island (center -150, -350, radius 180)
            mapCtx.fillStyle = 'rgba(255, 175, 190, 0.22)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(-150), mapZ(-350), scaleR(180), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(255, 195, 210, 0.3)';
            mapCtx.stroke();

            mapCtx.fillStyle = 'rgba(255, 175, 190, 0.55)';
            mapCtx.font = '900 11px Orbitron';
            mapCtx.textAlign = 'center';
            mapCtx.fillText("CHERRY ISLE", mapX(-150), mapZ(-350));

            // 4. Tall Mountain Island (center 250, 350, radius 180)
            mapCtx.fillStyle = 'rgba(120, 120, 120, 0.22)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(250), mapZ(350), scaleR(180), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
            mapCtx.stroke();
            
            // Peak snowcap circle
            mapCtx.fillStyle = 'rgba(240, 240, 240, 0.3)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(250), mapZ(350), scaleR(65), 0, 2 * Math.PI);
            mapCtx.fill();

            mapCtx.fillStyle = 'rgba(220, 220, 220, 0.55)';
            mapCtx.font = '900 11px Orbitron';
            mapCtx.textAlign = 'center';
            mapCtx.fillText("MOUNTAIN PEAK", mapX(250), mapZ(350));

            // 5. Second Village Island (center -350, 250, radius 180) - Savanna
            mapCtx.fillStyle = 'rgba(180, 160, 90, 0.22)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(-350), mapZ(250), scaleR(180), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(200, 180, 100, 0.3)';
            mapCtx.stroke();

            mapCtx.fillStyle = 'rgba(210, 175, 90, 0.65)';
            mapCtx.font = '900 11px Orbitron';
            mapCtx.textAlign = 'center';
            mapCtx.fillText("SAVANNA VILLAGE", mapX(-350), mapZ(250));

            // Draw Second Village houses
            const v2Houses = [
                { x: -360, z: 240 },
                { x: -340, z: 260 },
                { x: -370, z: 270 },
                { x: -330, z: 230 },
                { x: -350, z: 285 }
            ];
            mapCtx.fillStyle = '#6e4526';
            v2Houses.forEach(h => {
                mapCtx.fillRect(mapX(h.x) - 4 * mapZoom, mapZ(h.z) - 4 * mapZoom, 8 * mapZoom, 8 * mapZoom);
            });

            // Draw static radar rings overlay centered on screen
            mapCtx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
            mapCtx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
                mapCtx.beginPath();
                mapCtx.arc(250, 250, 78.125 * i, 0, 2 * Math.PI);
                mapCtx.stroke();
            }

            // Draw Trash cans (small red glowing dots)
            trashCans.forEach(can => {
                const cx = mapX(can.x);
                const cy = mapZ(can.z);
                mapCtx.fillStyle = '#ff0055';
                mapCtx.beginPath();
                mapCtx.arc(cx, cy, 6, 0, 2 * Math.PI);
                mapCtx.fill();
                
                mapCtx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
                mapCtx.lineWidth = 1.5;
                mapCtx.beginPath();
                mapCtx.arc(cx, cy, 11, 0, 2 * Math.PI);
                mapCtx.stroke();
            });

            // Draw Turret (yellow star/circle)
            if (turretActive) {
                const tx = mapX(turretPos.x);
                const tz = mapZ(turretPos.z);
                mapCtx.fillStyle = '#ffea00';
                mapCtx.beginPath();
                mapCtx.arc(tx, tz, 7, 0, 2 * Math.PI);
                mapCtx.fill();
                mapCtx.strokeStyle = 'rgba(255, 234, 0, 0.4)';
                mapCtx.lineWidth = 1.5;
                mapCtx.beginPath();
                mapCtx.arc(tx, tz, 12, 0, 2 * Math.PI);
                mapCtx.stroke();
                
                mapCtx.fillStyle = 'rgba(255, 234, 0, 0.8)';
                mapCtx.font = '10px Orbitron';
                mapCtx.textAlign = 'center';
                mapCtx.fillText("TURRET", tx, tz - 15);
            }

            // Draw Mobs (zombies, creepers, skeletons as green/red dots)
            if (isHost) {
                zombies.forEach(z => {
                    const zx = mapX(z.mesh.position.x);
                    const zz = mapZ(z.mesh.position.z);
                    mapCtx.fillStyle = z.type === 'creeper' ? '#ff3300' : (z.type === 'skeleton' ? '#e6e6e6' : '#39ff14');
                    mapCtx.beginPath();
                    mapCtx.arc(zx, zz, 4.5, 0, 2 * Math.PI);
                    mapCtx.fill();
                });
            } else {
                clientZombies.forEach(mesh => {
                    const zx = mapX(mesh.position.x);
                    const zz = mapZ(mesh.position.z);
                    mapCtx.fillStyle = mesh.zombieType === 'creeper' ? '#ff3300' : (mesh.zombieType === 'skeleton' ? '#e6e6e6' : '#39ff14');
                    mapCtx.beginPath();
                    mapCtx.arc(zx, zz, 4.5, 0, 2 * Math.PI);
                    mapCtx.fill();
                });
            }

            // Draw Bees (small yellow dots)
            if (isHost) {
                bees.forEach(b => {
                    if (b.hp <= 0) return;
                    const bx = mapX(b.pos.x);
                    const bz = mapZ(b.pos.z);
                    mapCtx.fillStyle = '#ffea00';
                    mapCtx.beginPath();
                    mapCtx.arc(bx, bz, 2.5, 0, 2 * Math.PI);
                    mapCtx.fill();
                });
            } else {
                clientBees.forEach(mesh => {
                    const bx = mapX(mesh.position.x);
                    const bz = mapZ(mesh.position.z);
                    mapCtx.fillStyle = '#ffea00';
                    mapCtx.beginPath();
                    mapCtx.arc(bx, bz, 2.5, 0, 2 * Math.PI);
                    mapCtx.fill();
                });
            }

            // Draw Opponent marker (magenta circle + look indicator)
            if (opponentGroup && turretOccupant !== 'peer' && !opponentInvisible) {
                const ox = mapX(opponentGroup.position.x);
                const oz = mapZ(opponentGroup.position.z);
                const oppAngle = -opponentGroup.rotation.y + Math.PI;
                const fovRad = 35 * Math.PI / 180;
                
                mapCtx.fillStyle = 'rgba(255, 0, 127, 0.08)';
                mapCtx.beginPath();
                mapCtx.moveTo(ox, oz);
                mapCtx.arc(ox, oz, 55 * mapZoom, oppAngle - fovRad, oppAngle + fovRad);
                mapCtx.closePath();
                mapCtx.fill();

                mapCtx.fillStyle = '#ff007f';
                mapCtx.beginPath();
                mapCtx.arc(ox, oz, 9, 0, 2 * Math.PI);
                mapCtx.fill();
                
                mapCtx.strokeStyle = '#ff007f';
                mapCtx.lineWidth = 2.5;
                mapCtx.beginPath();
                mapCtx.moveTo(ox, oz);
                mapCtx.lineTo(ox + Math.sin(oppAngle) * 22, oz + Math.cos(oppAngle) * 22);
                mapCtx.stroke();
            }

            // Draw Player marker (cyan circle + look indicator)
            if (!inTurret) {
                const px = mapX(camera.position.x);
                const pz = mapZ(camera.position.z);
                const lookDir = new THREE.Vector3();
                camera.getWorldDirection(lookDir);
                const yawAngle = Math.atan2(lookDir.x, lookDir.z);
                const fovRad = 35 * Math.PI / 180;
                
                mapCtx.fillStyle = 'rgba(0, 240, 255, 0.08)';
                mapCtx.beginPath();
                mapCtx.moveTo(px, pz);
                mapCtx.arc(px, pz, 55 * mapZoom, yawAngle - fovRad, yawAngle + fovRad);
                mapCtx.closePath();
                mapCtx.fill();

                mapCtx.fillStyle = '#00f0ff';
                mapCtx.beginPath();
                mapCtx.arc(px, pz, 9, 0, 2 * Math.PI);
                mapCtx.fill();

                mapCtx.strokeStyle = '#00f0ff';
                mapCtx.lineWidth = 2.5;
                mapCtx.beginPath();
                mapCtx.moveTo(px, pz);
                mapCtx.lineTo(px + Math.sin(yawAngle) * 22, pz + Math.cos(yawAngle) * 22);
                mapCtx.stroke();
            }

            // Draw Panning & Zoom Info HUD overlay
            mapCtx.fillStyle = 'rgba(0, 240, 255, 0.7)';
            mapCtx.font = '900 10px Orbitron';
            mapCtx.textAlign = 'left';
            mapCtx.fillText("DRAG: PAN  |  SCROLL: ZOOM  |  R-CLICK: RESET CENTER", 15, 25);
            mapCtx.fillText(`ZOOM: ${mapZoom.toFixed(2)}x`, 15, 40);
        }

        // Sync player state
        let lastSyncTime = 0;
        function syncPlayerPosition() {
            const now = Date.now();
            if (now - lastSyncTime > 16) {
                sendNetworkMessage({
                    type: 'pos-sync',
                    x: camera.position.x,
                    y: camera.position.y - 1.6, // send ground height Y
                    z: camera.position.z,
                    ry: camera.rotation.y
                });
                lastSyncTime = now;
            }
        }

        function syncTurretRotation() {
            if (!inTurret) return;
            const now = Date.now();
            if (now - lastTurretSyncTime > 40) { // Sync at ~25Hz
                sendNetworkMessage({
                    type: 'turret-rotation',
                    ry: camera.rotation.y,
                    rx: camera.rotation.x
                });
                lastTurretSyncTime = now;
            }
        }

        // Physics WASD movement updates
        function updatePlayerPhysics(delta) {
            // Lock position if in turret, bush, or riding a quantum cube
            if (inTurret || inBush || (typeof ridingCube !== 'undefined' && ridingCube)) {
                if (inBush) {
                    const bush = bushes.find(b => b.id === activeBushId);
                    if (bush) {
                        camera.position.set(bush.x, bush.y + 1.2, bush.z);
                    }
                } else if (inTurret) {
                    camera.position.set(turretPos.x, turretPos.y + 1.8, turretPos.z);
                } else if (ridingCube) {
                    camera.position.set(ridingCube.mesh.position.x, ridingCube.mesh.position.y + 1.6, ridingCube.mesh.position.z);
                    velocity.set(0, 0, 0);
                    knockbackVel.set(0, 0, 0);
                }
                return;
            }

            // Apply friction decelerations
            velocity.x -= velocity.x * 8.5 * delta;
            velocity.z -= velocity.z * 8.5 * delta;
            
            knockbackVel.x -= knockbackVel.x * 4.5 * delta;
            knockbackVel.z -= knockbackVel.z * 4.5 * delta;

            // Gravity
            velocity.y -= 9.8 * 2.2 * delta;

            direction.z = Number(moveForces.forward) - Number(moveForces.backward);
            direction.x = Number(moveForces.right) - Number(moveForces.left);
            direction.normalize();

            // WASD movement works anytime game is active (not locked to mouse pointer lock)
            const speed = 40.0;
            if (moveForces.forward || moveForces.backward) velocity.z -= direction.z * speed * delta;
            if (moveForces.left || moveForces.right) velocity.x -= direction.x * speed * delta;

            // Calculate total velocities
            const totalVX = velocity.x + knockbackVel.x;
            const totalVZ = velocity.z + knockbackVel.z;

            moveRight(-totalVX * delta);
            moveForward(-totalVZ * delta);

            camera.position.y += velocity.y * delta;

            // Snap Y coordinate to heightmapped terrain Y
            const terrainY = getTerrainHeight(camera.position.x, camera.position.z);
            if (camera.position.y < terrainY + 1.6) {
                velocity.y = 0;
                camera.position.y = terrainY + 1.6;
                isGrounded = true;
            }

            // Boundary mountain colliders (keep players within 1200x1200m)
            const inQuantum = (camera.position.x > 1400);
            if (inQuantum) {
                // Quantum Lands boundary clamping: 590m radius centered at (2000, 0)
                const dx = camera.position.x - 2000;
                const dz = camera.position.z;
                const qDist = Math.sqrt(dx * dx + dz * dz);
                if (qDist > 590) {
                    const angle = Math.atan2(dz, dx);
                    camera.position.x = 2000 + Math.cos(angle) * 590;
                    camera.position.z = Math.sin(angle) * 590;
                    velocity.x = -velocity.x * 0.5;
                    velocity.z = -velocity.z * 0.5;
                }

                // Quantum Pool Damage (at y <= -38, 40 damage per second)
                if (camera.position.y <= -38.4) {
                    const now = Date.now();
                    if (now - lastQuantumDamageTime > 1000) {
                        takeDamage(40, 0, 0, "Dissolved in Quantum Pool!");
                        lastQuantumDamageTime = now;
                    }
                }
            } else {
                // Overworld boundary clamping: 590m radius centered at (0, 0)
                const distFromCenter = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
                if (distFromCenter > 590) {
                    const angle = Math.atan2(camera.position.z, camera.position.x);
                    camera.position.x = Math.cos(angle) * 590;
                    camera.position.z = Math.sin(angle) * 590;
                    velocity.x = -velocity.x * 0.5;
                    velocity.z = -velocity.z * 0.5;
                }
            }

            // Portal warp checks
            const pX = camera.position.x;
            const pY = camera.position.y;
            const pZ = camera.position.z;
            
            if (!inQuantum) {
                // Check Overworld Base Portal (spawn position: x = 250, z = 350)
                const baseY = getTerrainHeight(250, 350);
                const dx = pX - 250;
                const dy = pY - (baseY + 1.6);
                const dz = pZ - 350;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                if (dist < 2.5) {
                    // Warp to Quantum Lands (main island center, with offset & bounce)
                    camera.position.set(2000, 20 + 1.6, 3);
                    velocity.set(0, 8, 0);
                    knockbackVel.set(0, 0, 0);
                    AudioSynth.playBoom();
                    addChatMessage("Warped to the Quantum Lands!", "system");
                    
                    inBush = false;
                    activeBushId = null;
                    inTurret = false;
                    turretOccupant = null;
                    if (typeof ridingCube !== 'undefined' && ridingCube) {
                        ridingCube.rider = null;
                        ridingCube = null;
                    }
                }
            } else {
                // Check Quantum Return Portal (spawn position: x = 2000, z = 0, y = 20)
                const dx = pX - 2000;
                const dy = pY - (20 + 1.6);
                const dz = pZ;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                if (dist < 2.5) {
                    // Warp to Overworld Mountain Top
                    const baseY = getTerrainHeight(250, 350);
                    camera.position.set(250, baseY + 1.6, 353);
                    velocity.set(0, 8, 0);
                    knockbackVel.set(0, 0, 0);
                    AudioSynth.playBoom();
                    addChatMessage("Returned to the Overworld!", "system");
                    
                    inBush = false;
                    activeBushId = null;
                    inTurret = false;
                    turretOccupant = null;
                    if (typeof ridingCube !== 'undefined' && ridingCube) {
                        ridingCube.rider = null;
                        ridingCube = null;
                    }
                }
            }

            // Check if player is in the lake or ocean
            const pdx = camera.position.x - LAKE_CENTER_X;
            const pdz = camera.position.z - LAKE_CENTER_Z;
            const pDistToLake = Math.sqrt(pdx * pdx + pdz * pdz);
            const isPlayerInWater = (pDistToLake < LAKE_RADIUS || terrainY <= WATER_Y) && camera.position.y < WATER_Y + 1.8;
            if (isPlayerInWater) {
                if (myBurnTime > 0) {
                    myBurnTime = 0;
                    localPlayerWasBurning = false;
                    const elFireVignette = document.getElementById('fire-vignette');
                    if (elFireVignette) elFireVignette.style.display = 'none';
                    sendNetworkMessage({ type: 'fire-state', burning: false });
                }
            }
        }

        // Update flying arrows & turret shells
        function updateProjectiles(delta) {
            // 1. Local arrows
            for (let i = localArrows.length - 1; i >= 0; i--) {
                const arrow = localArrows[i];
                arrow.pos.addScaledVector(arrow.vel, delta);
                arrow.mesh.position.copy(arrow.pos);
                
                // Gravity arch
                arrow.vel.y -= 9.8 * 1.5 * delta;

                // Check terrain collision
                const terrainY = getTerrainHeight(arrow.pos.x, arrow.pos.z);
                if (arrow.pos.y < terrainY) {
                    scene.remove(arrow.mesh);
                    localArrows.splice(i, 1);
                    continue;
                }

                // Check zombie hit!
                let zombieHit = false;
                if (isHost) {
                    for (let j = zombies.length - 1; j >= 0; j--) {
                        const z = zombies[j];
                        if (z.isDead) continue;
                        const zChestPos = z.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
                        const zDist = arrow.pos.distanceTo(zChestPos);
                        if (zDist < 1.6) {
                            zombieHit = true;
                            AudioSynth.playHit();
                            flashZombieRed(z.mesh);
                            const kVel = arrow.vel.clone().normalize();
                            
                            // Apply visual recoil to zombie mesh
                            zombieRecoilMap.set(z.mesh, {
                                pos: new THREE.Vector3(kVel.x, 0.2, kVel.z).normalize().multiplyScalar(0.6),
                                rotX: 0.25
                             });

                            z.health = Math.max(0, z.health - 15);
                            z.kx = kVel.x * 12.0;
                            z.kz = kVel.z * 12.0;
                            if (z.health <= 0) {
                                z.isDead = true;
                                z.deathTime = 0;
                            }
                            scene.remove(arrow.mesh);
                            localArrows.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (let [id, mesh] of clientZombies) {
                        const zChestPos = mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
                        const zDist = arrow.pos.distanceTo(zChestPos);
                        if (zDist < 1.6) {
                            zombieHit = true;
                            AudioSynth.playHit();
                            flashZombieRed(mesh);
                            const kVel = arrow.vel.clone().normalize();
                            
                            // Apply visual recoil to zombie mesh
                            zombieRecoilMap.set(mesh, {
                                pos: new THREE.Vector3(kVel.x, 0.2, kVel.z).normalize().multiplyScalar(0.6),
                                rotX: 0.25
                            });

                            sendNetworkMessage({
                                type: 'damage-zombie',
                                id: id,
                                damage: 15,
                                kx: kVel.x * 12.0,
                                kz: kVel.z * 12.0
                            });
                            scene.remove(arrow.mesh);
                            localArrows.splice(i, 1);
                            break;
                        }
                    }
                }

                if (zombieHit) continue;

                // Check villager hit!
                let villagerHit = false;
                for (let j = villagers.length - 1; j >= 0; j--) {
                    const v = villagers[j];
                    if (v.isDead) continue;
                    const vChestPos = v.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
                    const vDist = arrow.pos.distanceTo(vChestPos);
                    if (vDist < 1.6) {
                        villagerHit = true;
                        AudioSynth.playHit();
                        flashVillagerRed(v.mesh);
                        const kVel = arrow.vel.clone().normalize();
                        
                        v.health = Math.max(0, v.health - 15);
                        v.kx = kVel.x * 12.0;
                        v.kz = kVel.z * 12.0;
                        if (v.health <= 0) {
                            v.isDead = true;
                            v.deathTime = 0;
                        }
                        
                        sendNetworkMessage({
                            type: 'damage-villager',
                            id: v.id,
                            damage: 15,
                            kx: kVel.x * 12.0,
                            kz: kVel.z * 12.0
                        });
                        scene.remove(arrow.mesh);
                        localArrows.splice(i, 1);
                        break;
                    }
                }

                if (villagerHit) continue;

                // Check animal hit!
                let animalHit = false;
                for (let j = animals.length - 1; j >= 0; j--) {
                    const a = animals[j];
                    if (a.isDead) continue;
                    const aChestPos = a.mesh.position.clone().add(new THREE.Vector3(0, 0.5, 0));
                    const aDist = arrow.pos.distanceTo(aChestPos);
                    if (aDist < 1.5) {
                        animalHit = true;
                        AudioSynth.playHit();
                        flashAnimalRed(a.mesh);
                        const kVel = arrow.vel.clone().normalize();
                        
                        a.health = Math.max(0, a.health - 15);
                        a.kx = kVel.x * 12.0;
                        a.kz = kVel.z * 12.0;
                        if (a.health <= 0) {
                            a.isDead = true;
                            a.deathTime = 0;
                            spawnDroppedFood(getFoodTypeForAnimal(a.type), a.mesh.position);
                        }
                        
                        if (isConnected) {
                            sendNetworkMessage({
                                type: 'damage-animal',
                                id: a.id,
                                damage: 15,
                                kx: kVel.x * 12.0,
                                kz: kVel.z * 12.0
                            });
                        }
                        scene.remove(arrow.mesh);
                        localArrows.splice(i, 1);
                        break;
                    }
                }
                if (animalHit) continue;

                // Check bee hit!
                let beeHit = false;
                if (isHost) {
                    for (let j = bees.length - 1; j >= 0; j--) {
                        const b = bees[j];
                        if (b.hp <= 0) continue;
                        const distToBee = arrow.pos.distanceTo(b.pos);
                        if (distToBee < 1.3) {
                            beeHit = true;
                            AudioSynth.playHit();
                            flashBeeRed(b.mesh);
                            b.hp = Math.max(0, b.hp - 15);
                            
                            beesAngryAt = 'host';
                            beesAngerStartTime = Date.now();
                            
                            if (b.hp <= 0) {
                                b.mesh.rotation.x = Math.PI;
                            }
                            
                            scene.remove(arrow.mesh);
                            localArrows.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (let [id, mesh] of clientBees) {
                        const distToBee = arrow.pos.distanceTo(mesh.position);
                        if (distToBee < 1.3) {
                            beeHit = true;
                            AudioSynth.playHit();
                            flashBeeRed(mesh);
                            
                            sendNetworkMessage({
                                type: 'damage-bee',
                                id: id,
                                damage: 15
                            });
                            
                            scene.remove(arrow.mesh);
                            localArrows.splice(i, 1);
                            break;
                        }
                    }
                }
                
                if (beeHit) continue;

                // Check opponent hit (approx chest Y is +1.0)
                if (opponentGroup) {
                    const oppChestPos = opponentGroup.position.clone().add(new THREE.Vector3(0, 1.0, 0));
                    const dist = arrow.pos.distanceTo(oppChestPos);

                    if (dist < 1.6) {
                        AudioSynth.playHit();
                        flashOpponentRed();

                        // Calculate knockback direction
                        const kVel = arrow.vel.clone().normalize();
                        
                        // Apply visual recoil pushback to opponent model
                        opponentRecoilPos.set(kVel.x, 0.2, kVel.z).normalize().multiplyScalar(0.7);
                        applyOpponentRecoilRot(kVel.x, kVel.z, 0.45);

                        kVel.multiplyScalar(12.0);

                        // Send hit
                        sendNetworkMessage({
                            type: 'hit',
                            damage: 15,
                            knockbackX: kVel.x,
                            knockbackZ: kVel.z
                        });

                        oppHealth = Math.max(0, oppHealth - 15);
                        updateHud();

                        if (oppHealth <= 0) declareWinner();

                        scene.remove(arrow.mesh);
                        localArrows.splice(i, 1);
                    }
                }
            }

            // 2. Peer arrows (Visuals only, no damage calculations)
            for (let i = peerArrows.length - 1; i >= 0; i--) {
                const arrow = peerArrows[i];
                arrow.pos.addScaledVector(arrow.vel, delta);
                arrow.mesh.position.copy(arrow.pos);
                arrow.vel.y -= 9.8 * 1.5 * delta;

                const terrainY = getTerrainHeight(arrow.pos.x, arrow.pos.z);
                if (arrow.pos.y < terrainY) {
                    scene.remove(arrow.mesh);
                    peerArrows.splice(i, 1);
                }
            }

            // 3. Local Turret Shells
            for (let i = turretShells.length - 1; i >= 0; i--) {
                const shell = turretShells[i];
                shell.pos.addScaledVector(shell.vel, delta);
                shell.mesh.position.copy(shell.pos);
                
                // Gravity arch
                shell.vel.y -= 9.8 * 1.2 * delta;
                
                const terrainY = getTerrainHeight(shell.pos.x, shell.pos.z);
                if (shell.pos.y < terrainY || shell.pos.y < -5) {
                    createExplosionEffect(shell.pos.x, terrainY, shell.pos.z);
                    scene.remove(shell.mesh);
                    turretShells.splice(i, 1);
                }
            }
            
            // 4. Peer Turret Shells (visuals only)
            for (let i = peerShells.length - 1; i >= 0; i--) {
                const shell = peerShells[i];
                shell.pos.addScaledVector(shell.vel, delta);
                shell.mesh.position.copy(shell.pos);
                
                // Gravity arch
                shell.vel.y -= 9.8 * 1.2 * delta;
                
                const terrainY = getTerrainHeight(shell.pos.x, shell.pos.z);
                if (shell.pos.y < terrainY || shell.pos.y < -5) {
                    createExplosionEffect(shell.pos.x, terrainY, shell.pos.z);
                    scene.remove(shell.mesh);
                    peerShells.splice(i, 1);
                }
            }
            // 5. Host-side Skeleton Arrows (physics and damage)
            if (isHost) {
                for (let i = skeletonArrows.length - 1; i >= 0; i--) {
                    const arrow = skeletonArrows[i];
                    arrow.pos.addScaledVector(arrow.vel, delta);
                    arrow.mesh.position.copy(arrow.pos);
                    arrow.vel.y -= 9.8 * 1.5 * delta;
                    
                    const terrainY = getTerrainHeight(arrow.pos.x, arrow.pos.z);
                    if (arrow.pos.y < terrainY) {
                        scene.remove(arrow.mesh);
                        skeletonArrows.splice(i, 1);
                        continue;
                    }
                    
                    // Check hit against local player (host)
                    const px = camera.position.x;
                    const py = camera.position.y;
                    const pz = camera.position.z;
                    const distToHost = arrow.pos.distanceTo(new THREE.Vector3(px, py - 0.5, pz));
                    if (distToHost < 1.6) {
                        const kVel = arrow.vel.clone().normalize().multiplyScalar(10.0);
                        takeDamage(12, kVel.x, kVel.z, "Shot by Skeleton!");
                        scene.remove(arrow.mesh);
                        skeletonArrows.splice(i, 1);
                        continue;
                    }
                    
                    // Check hit against client player (opponent)
                    if (opponentGroup && oppHealth > 0 && isConnected) {
                        const ox = opponentGroup.position.x;
                        const oy = opponentGroup.position.y;
                        const oz = opponentGroup.position.z;
                        const distToClient = arrow.pos.distanceTo(new THREE.Vector3(ox, oy + 1.0, oz));
                        if (distToClient < 1.6) {
                            const kVel = arrow.vel.clone().normalize().multiplyScalar(10.0);
                            sendNetworkMessage({
                                type: 'zombie-hit',
                                damage: 12,
                                kx: kVel.x,
                                kz: kVel.z
                            });
                            scene.remove(arrow.mesh);
                            skeletonArrows.splice(i, 1);
                            continue;
                        }
                    }
                    
                    // Check hit against villagers
                    let villagerHit = false;
                    for (let j = villagers.length - 1; j >= 0; j--) {
                        const v = villagers[j];
                        if (v.isDead) continue;
                        const vChestPos = v.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
                        const distToVillager = arrow.pos.distanceTo(vChestPos);
                        if (distToVillager < 1.6) {
                            villagerHit = true;
                            const kVel = arrow.vel.clone().normalize().multiplyScalar(10.0);
                            v.health = Math.max(0, v.health - 12);
                            v.kx = kVel.x;
                            v.kz = kVel.z;
                            flashVillagerRed(v.mesh);
                            if (v.health <= 0) {
                                v.isDead = true;
                                v.deathTime = 0;
                            }
                            
                            sendNetworkMessage({
                                type: 'damage-villager',
                                id: v.id,
                                damage: 12,
                                kx: kVel.x,
                                kz: kVel.z
                            });
                            scene.remove(arrow.mesh);
                            skeletonArrows.splice(i, 1);
                            break;
                        }
                    }
                    if (villagerHit) continue;
                }
            }
        }

        // Local FP hands and weapons animations
        function updateFirstPersonAnimations(delta) {
            const t = clock.getElapsedTime();
            firstPersonHands.position.y = Math.sin(t * 2.5) * 0.01;
            firstPersonHands.position.x = Math.cos(t * 1.25) * 0.005;

            // Punch Fists Animation
            if (localPunching) {
                localPunchTimer += delta * 7;
                if (localPunchTimer >= 1.0) {
                    localPunching = false;
                    rightHand.position.set(0.35, -0.3, -0.7);
                } else {
                    const pZ = -0.7 - Math.sin(localPunchTimer * Math.PI) * 0.6;
                    const pY = -0.3 + Math.sin(localPunchTimer * Math.PI) * 0.1;
                    rightHand.position.set(0.35, pY, pZ);
                }
            } else {
                rightHand.position.set(0.35, -0.3, -0.7);
            }

            // Kick Leg Animation
            if (localKicking) {
                localKickTimer += delta * 4;
                if (localKickTimer >= 1.0) {
                    localKicking = false;
                    kickerLeg.position.set(0, -1.2, -0.3);
                } else {
                    const lY = -1.2 + Math.sin(localKickTimer * Math.PI) * 0.9;
                    const lZ = -0.3 - Math.sin(localKickTimer * Math.PI) * 0.9;
                    kickerLeg.position.set(0, lY, lZ);
                    kickerLeg.rotation.x = -Math.sin(localKickTimer * Math.PI) * 0.3;
                }
            } else {
                kickerLeg.position.set(0, -1.2, -0.3);
                kickerLeg.rotation.x = 0;
            }

            // Drawing Bow animation
            if (localDrawingBow) {
                localBowTimer += delta * 5;
                if (localBowTimer >= 1.0) {
                    localDrawingBow = false;
                    bowGroup.position.set(0.2, -0.35, -0.45);
                } else {
                    // Slight pull-back recoil
                    const bZ = -0.45 + Math.sin(localBowTimer * Math.PI) * 0.12;
                    bowGroup.position.set(0.2, -0.35, bZ);
                }
            } else {
                bowGroup.position.set(0.2, -0.35, -0.45);
            }
        }

        // Animate opponent model limbs
        function updateOpponentAnimations(delta, time) {
            if (!opponentGroup) return;

            if (!isConnected || turretOccupant === 'peer') {
                opponentGroup.visible = false;
                return;
            } else {
                opponentGroup.visible = !opponentInvisible;
            }

            // Decay recoil values
            opponentRecoilPos.lerp(new THREE.Vector3(), 0.12);
            opponentRecoilRotX = THREE.MathUtils.lerp(opponentRecoilRotX, 0, 0.12);
            opponentRecoilRotZ = THREE.MathUtils.lerp(opponentRecoilRotZ, 0, 0.12);

            // Interpolate coordinates
            opponentGroup.position.x = THREE.MathUtils.lerp(opponentGroup.position.x, targetOpponentPos.x, 0.25);
            opponentGroup.position.y = THREE.MathUtils.lerp(opponentGroup.position.y, targetOpponentPos.y, 0.25);
            opponentGroup.position.z = THREE.MathUtils.lerp(opponentGroup.position.z, targetOpponentPos.z, 0.25);

            // Apply recoil to visual rendering position
            opponentGroup.position.x += opponentRecoilPos.x;
            opponentGroup.position.y += opponentRecoilPos.y;
            opponentGroup.position.z += opponentRecoilPos.z;
            
            // Lerp rotation
            let diffRot = targetOpponentRotY - opponentGroup.rotation.y;
            diffRot = Math.atan2(Math.sin(diffRot), Math.cos(diffRot));
            opponentGroup.rotation.y += diffRot * 0.25;

            // Apply recoil to visual rotation
            opponentGroup.rotation.x = opponentRecoilRotX;
            opponentGroup.rotation.z = opponentRecoilRotZ;

            // Check if walking
            const isMoving = opponentGroup.position.distanceTo(targetOpponentPos) > 0.05;
            let targetHeadTilt = 0;
            
            if (isMoving && !isOpponentKicking) {
                const walkSpeed = 12;
                opponentLLeg.rotation.x = Math.sin(time * walkSpeed) * 0.5;
                opponentRLeg.rotation.x = -Math.sin(time * walkSpeed) * 0.5;
                
                opponentLArm.rotation.x = -Math.sin(time * walkSpeed) * 0.4;
                opponentRArm.rotation.x = Math.sin(time * walkSpeed) * 0.4;

                // Head Tilt/Lean in direction of motion (relative to body facing direction)
                const moveX = targetOpponentPos.x - opponentGroup.position.x;
                const moveZ = targetOpponentPos.z - opponentGroup.position.z;
                // Facing direction unit vector (eyes face +Z)
                const dot = moveX * Math.sin(opponentGroup.rotation.y) + moveZ * Math.cos(opponentGroup.rotation.y);
                
                if (dot > 0.02) {
                    targetHeadTilt = 0.25; // Walking forward: lean eyes forward/down
                } else if (dot < -0.02) {
                    targetHeadTilt = -0.25; // Walking backward: lean back of head forward/down (eyes look up)
                }
            } else {
                opponentLLeg.rotation.x = THREE.MathUtils.lerp(opponentLLeg.rotation.x, 0, 0.15);
                opponentRLeg.rotation.x = THREE.MathUtils.lerp(opponentRLeg.rotation.x, 0, 0.15);
                opponentLArm.rotation.x = THREE.MathUtils.lerp(opponentLArm.rotation.x, 0, 0.15);
                opponentRArm.rotation.x = THREE.MathUtils.lerp(opponentRArm.rotation.x, 0, 0.15);
            }

            if (opponentHead) {
                opponentHead.rotation.x = THREE.MathUtils.lerp(opponentHead.rotation.x, targetHeadTilt, 0.1);
            }

            // Punch limb action
            if (isOpponentPunching) {
                opponentPunchTimer += delta * 6;
                if (opponentPunchTimer >= 1.0) {
                    isOpponentPunching = false;
                    opponentRArm.rotation.x = 0;
                    opponentRArm.position.set(0.30, 1.3, 0);
                } else {
                    opponentRArm.rotation.x = -Math.PI / 2;
                    opponentRArm.position.set(0.30, 1.3, Math.sin(opponentPunchTimer * Math.PI) * 0.35);
                }
            }

            // Kick limb action
            if (isOpponentKicking) {
                opponentKickTimer += delta * 4;
                if (opponentKickTimer >= 1.0) {
                    isOpponentKicking = false;
                    opponentRLeg.rotation.x = 0;
                    opponentRLeg.position.set(0.11, 0.4, 0);
                } else {
                    opponentRLeg.rotation.x = -Math.PI / 2.5;
                    opponentRLeg.position.set(0.11, 0.4 + Math.sin(opponentKickTimer * Math.PI) * 0.2, Math.sin(opponentKickTimer * Math.PI) * 0.4);
                }
            }

            // Damage color reset
            if (isOpponentDamaged) {
                opponentDamageTimer -= delta;
                if (opponentDamageTimer <= 0) {
                    isOpponentDamaged = false;
                    resetOpponentColor();
                }
            }
        }

        // --- NEW FEATURES: TURRET & ZOMBIES LOGIC ---

        function spawnTurretMesh(x, z) {
            if (turretGroup) {
                scene.remove(turretGroup);
            }
            
            turretPos.set(x, getTerrainHeight(x, z), z);
            turretActive = true;
            inTurret = false;
            turretOccupant = null;
            
            turretGroup = new THREE.Group();
            turretGroup.position.copy(turretPos);
            
            const metalMat = new THREE.MeshStandardMaterial({
                color: 0x2d323f,
                metalness: 0.9,
                roughness: 0.2
            });
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                toneMapped: false
            });
            
            const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16);
            const baseMesh = new THREE.Mesh(baseGeo, metalMat);
            baseMesh.position.y = 0.4;
            baseMesh.castShadow = true;
            baseMesh.receiveShadow = true;
            turretGroup.add(baseMesh);
            
            turretHeadGroup = new THREE.Group();
            turretHeadGroup.position.y = 0.8;
            
            const headGeo = new THREE.SphereGeometry(0.8, 16, 16);
            const headMesh = new THREE.Mesh(headGeo, metalMat);
            headMesh.castShadow = true;
            turretHeadGroup.add(headMesh);
            
            const visorGeo = new THREE.BoxGeometry(0.1, 0.15, 0.6);
            const visorMesh = new THREE.Mesh(visorGeo, glowMat);
            visorMesh.position.set(0, 0.2, -0.65);
            turretHeadGroup.add(visorMesh);
            
            const barrelGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.0, 12);
            barrelGeo.rotateX(Math.PI / 2);
            barrelGeo.translate(0, 0, -1.0);
            
            turretBarrel = new THREE.Mesh(barrelGeo, metalMat);
            turretBarrel.castShadow = true;
            turretBarrel.position.set(0, 0.1, -0.4);
            turretHeadGroup.add(turretBarrel);
            
            const tipGlowGeo = new THREE.TorusGeometry(0.18, 0.04, 6, 12);
            const tipGlow = new THREE.Mesh(tipGlowGeo, glowMat);
            tipGlow.position.set(0, 0.1, -2.4);
            turretHeadGroup.add(tipGlow);
            
            turretGroup.add(turretHeadGroup);
            scene.add(turretGroup);
        }

        function triggerTurretEnterExit() {
            if (!turretActive || myHealth <= 0 || !gameActive || mapOpen) return;
            
            const dx = camera.position.x - turretPos.x;
            const dz = camera.position.z - turretPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (inTurret) {
                // Exit Turret
                inTurret = false;
                turretOccupant = null;
                
                // Exit behind
                camera.position.set(turretPos.x - 2.5, turretPos.y + 1.6, turretPos.z - 2.5);
                velocity.set(0, 0, 0);
                
                if (activeWeapon !== 'bow') {
                    elCrosshair.style.display = 'none';
                }
                
                sendNetworkMessage({ type: 'turret-vacate' });
            } else if (dist < 4.0 && !turretOccupant) {
                // Enter Turret
                inTurret = true;
                turretOccupant = 'local';
                turretEnterTime = Date.now();
                
                moveForces.forward = false;
                moveForces.backward = false;
                moveForces.left = false;
                moveForces.right = false;
                
                elCrosshair.style.display = 'flex';
                
                sendNetworkMessage({ type: 'turret-occupy' });
            }
        }

        function handleKeyPressR() {
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen || inventoryOpen) return;
            
            // If riding a quantum cube, dismount it
            if (typeof ridingCube !== 'undefined' && ridingCube) {
                const cube = ridingCube;
                ridingCube = null;
                cube.rider = null;
                
                camera.position.y += 0.5;
                velocity.set(0, 6, 0);
                isGrounded = false;
                
                if (!isHost && isConnected) {
                    sendNetworkMessage({
                        type: 'quantum-cube-client-update',
                        id: cube.id,
                        x: cube.mesh.position.x,
                        y: cube.mesh.position.y,
                        z: cube.mesh.position.z,
                        ry: cube.mesh.rotation.y,
                        rider: null
                    });
                }
                return;
            }
            
            // Check if near any quantum cube to ride
            let closestCube = null;
            let minCubeDist = Infinity;
            quantumCubes.forEach(c => {
                if (c.rider) return;
                const dx = camera.position.x - c.mesh.position.x;
                const dz = camera.position.z - c.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < minCubeDist) {
                    minCubeDist = dist;
                    closestCube = c;
                }
            });
            
            if (closestCube && minCubeDist < 4.0) {
                ridingCube = closestCube;
                closestCube.rider = 'local';
                
                moveForces.forward = false;
                moveForces.backward = false;
                moveForces.left = false;
                moveForces.right = false;
                
                if (!isHost && isConnected) {
                    sendNetworkMessage({
                        type: 'quantum-cube-client-update',
                        id: closestCube.id,
                        x: closestCube.mesh.position.x,
                        y: closestCube.mesh.position.y,
                        z: closestCube.mesh.position.z,
                        ry: closestCube.mesh.rotation.y,
                        rider: 'client'
                    });
                }
                return;
            }
        }

        function handleKeyPressF() {
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen || inventoryOpen) return;
            
            // If in a bush, exit it
            if (inBush) {
                inBush = false;
                activeBushId = null;
                localPlayerInvisible = false;
                sendNetworkMessage({ type: 'invisibility-state', invisible: false });
                isGrounded = false;
                return;
            }
            
            // If in a turret, exit it
            if (inTurret) {
                triggerTurretEnterExit();
                return;
            }
            
            // Check if near any bush to enter
            let closestBush = null;
            let minBushDist = Infinity;
            bushes.forEach(b => {
                const dist = Math.sqrt((camera.position.x - b.x) ** 2 + (camera.position.z - b.z) ** 2);
                if (dist < minBushDist) {
                    minBushDist = dist;
                    closestBush = b;
                }
            });
            
            if (closestBush && minBushDist < 3.0) {
                inBush = true;
                activeBushId = closestBush.id;
                localPlayerInvisible = true;
                
                velocity.set(0, 0, 0);
                moveForces.forward = false;
                moveForces.backward = false;
                moveForces.left = false;
                moveForces.right = false;
                
                camera.position.set(closestBush.x, closestBush.y + 1.2, closestBush.z);
                sendNetworkMessage({ type: 'invisibility-state', invisible: true });
                return;
            }
            
            // Check if near the turret to enter
            if (turretActive && !turretOccupant) {
                const dx = camera.position.x - turretPos.x;
                const dz = camera.position.z - turretPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < 4.0) {
                    triggerTurretEnterExit();
                    return;
                }
            }
        }

        function toggleInventoryOverlay() {
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen) return;
            
            inventoryOpen = !inventoryOpen;
            const overlay = document.getElementById('large-inventory-overlay');
            
            if (inventoryOpen) {
                overlay.style.display = 'flex';
                exitPointerLock();
                moveForces.forward = false;
                moveForces.backward = false;
                moveForces.left = false;
                moveForces.right = false;
                updateInventoryUI();
            } else {
                overlay.style.display = 'none';
                if (heldItem) {
                    returnHeldItemToInventory();
                }
                requestPointerLock();
            }
        }

        function returnHeldItemToInventory() {
            if (!heldItem) return;
            const type = heldItem.type;
            const count = heldItem.count;
            heldItem = null;
            
            for (let i = 0; i < count; i++) {
                addFoodToInventory(type);
            }
            updateHotbarUI();
            updateInventoryUI();
            updateFloatingItemUI();
        }

        function onInventorySlotClick(slotType, index) {
            if (slotType === 'hotbar' && (index === 0 || index === 1 || index === 2)) {
                addChatMessage("Weapon slots are permanent!", "system");
                return;
            }
            
            if (heldItem) {
                if (slotType === 'hotbar') {
                    const tempType = hotbarItems[index];
                    const tempCount = hotbarCounts[index];
                    
                    hotbarItems[index] = heldItem.type;
                    hotbarCounts[index] = heldItem.count;
                    
                    if (tempType) {
                        heldItem = { type: tempType, count: tempCount };
                    } else {
                        heldItem = null;
                    }
                } else {
                    const tempType = inventoryItems[index];
                    const tempCount = inventoryCounts[index];
                    
                    inventoryItems[index] = heldItem.type;
                    inventoryCounts[index] = heldItem.count;
                    
                    if (tempType) {
                        heldItem = { type: tempType, count: tempCount };
                    } else {
                        heldItem = null;
                    }
                }
            } else {
                if (slotType === 'hotbar') {
                    if (hotbarItems[index]) {
                        heldItem = { type: hotbarItems[index], count: hotbarCounts[index] };
                        hotbarItems[index] = null;
                        hotbarCounts[index] = 0;
                    }
                } else {
                    if (inventoryItems[index]) {
                        heldItem = { type: inventoryItems[index], count: inventoryCounts[index] };
                        inventoryItems[index] = null;
                        inventoryCounts[index] = 0;
                    }
                }
            }
            
            selectHotbarSlot(selectedHotbarIndex);
            updateHotbarUI();
            updateInventoryUI();
            updateFloatingItemUI();
        }

        function triggerEatFood() {
            if (hunger >= 100) {
                addChatMessage("Your hunger bar is already full!", "system");
                return;
            }
            const item = hotbarItems[selectedHotbarIndex];
            if (!item) return;

            let hungerRestored = 0;
            if (item === 'porkchop') hungerRestored = 20;
            else if (item === 'beef') hungerRestored = 30;
            else if (item === 'mutton') hungerRestored = 15;
            else if (item === 'chicken') hungerRestored = 10;

            if (hungerRestored > 0) {
                hunger = Math.min(100, hunger + hungerRestored);
                AudioSynth.playEating();
                
                hotbarCounts[selectedHotbarIndex]--;
                if (hotbarCounts[selectedHotbarIndex] <= 0) {
                    hotbarItems[selectedHotbarIndex] = null;
                    hotbarCounts[selectedHotbarIndex] = 0;
                    activeWeapon = 'fists';
                    updateWeaponUI();
                }
                
                updateMinecraftStatsUI();
                updateHotbarUI();
                addChatMessage(`Ate ${item.toUpperCase()}! Hunger: ${hunger}/100`, "system");
            }
        }

        function selectHotbarSlot(idx) {
            if (idx < 0 || idx > 8) return;
            selectedHotbarIndex = idx;
            
            updateHotbarUI();
            
            const item = hotbarItems[idx];
            if (item === 'fists' || item === 'kick' || item === 'bow') {
                activeWeapon = item;
            } else {
                activeWeapon = 'fists';
            }
            updateWeaponUI();
        }

        function updateHunger(delta) {
            if (!gameActive || myHealth <= 0) return;
            
            const now = Date.now();
            let drainRate = 1.0; 
            
            const isMoving = moveForces.forward || moveForces.backward || moveForces.left || moveForces.right;
            if (isMoving) {
                drainRate = 2.0; 
            }
            
            if (now - lastHungerTickTime > 6000 / drainRate) {
                hunger = Math.max(0, hunger - 1);
                lastHungerTickTime = now;
                updateMinecraftStatsUI();
            }
            
            if (hunger <= 0) {
                if (now - lastStarveTime > 2000) {
                    takeDamage(5, 0, 0, "Starved to death!");
                    lastStarveTime = now;
                }
            }
            
            if (hunger >= 80 && myHealth < 100) {
                if (now - lastRegenTime > 4000) {
                    myHealth = Math.min(100, myHealth + 5);
                    updateHud();
                    updateMinecraftStatsUI();
                    lastRegenTime = now;
                }
            }
        }

        function updateMinecraftStatsUI() {
            const healthContainer = document.getElementById('minecraft-health');
            const hungerContainer = document.getElementById('minecraft-hunger');
            if (!healthContainer || !hungerContainer) return;
            
            let healthHTML = '';
            const numHearts = Math.ceil(myHealth / 10);
            for (let i = 0; i < 10; i++) {
                if (i < numHearts) {
                    healthHTML += '❤️';
                } else {
                    healthHTML += '🖤';
                }
            }
            healthContainer.innerHTML = healthHTML;
            
            let hungerHTML = '';
            const numDrumsticks = Math.ceil(hunger / 10);
            for (let i = 0; i < 10; i++) {
                if (i < numDrumsticks) {
                    hungerHTML += '🍗';
                } else {
                    hungerHTML += '🦴';
                }
            }
            hungerContainer.innerHTML = hungerHTML;
        }

        const ITEM_ICONS = {
            fists: '✊',
            kick: '🦶',
            bow: '🏹',
            porkchop: '🥩',
            beef: '🍖',
            mutton: '🥓',
            chicken: '🍗'
        };
        
        const ITEM_NAMES = {
            fists: 'Fists',
            kick: 'Kick',
            bow: 'Bow',
            porkchop: 'Raw Porkchop',
            beef: 'Raw Beef',
            mutton: 'Raw Mutton',
            chicken: 'Raw Chicken'
        };

        function updateHotbarUI() {
            const container = document.getElementById('minecraft-hotbar');
            if (!container) return;
            
            let html = '';
            for (let i = 0; i < 9; i++) {
                const item = hotbarItems[i];
                const count = hotbarCounts[i];
                const isSelected = i === selectedHotbarIndex;
                const icon = item ? ITEM_ICONS[item] || '' : '';
                const name = item ? ITEM_NAMES[item] || '' : '';
                const countStr = (count > 1) ? count : '';
                
                html += `
                    <div class="hotbar-slot ${isSelected ? 'selected' : ''}" onclick="selectHotbarSlot(${i})" title="${name}">
                        ${icon ? `<span class="slot-icon">${icon}</span>` : ''}
                        ${countStr ? `<span class="slot-count">${countStr}</span>` : ''}
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        function updateInventoryUI() {
            const gridContainer = document.getElementById('inventory-grid');
            const hotbarRowContainer = document.getElementById('inventory-hotbar-row');
            if (!gridContainer || !hotbarRowContainer) return;
            
            let gridHTML = '';
            for (let i = 0; i < 27; i++) {
                const item = inventoryItems[i];
                const count = inventoryCounts[i];
                const icon = item ? ITEM_ICONS[item] || '' : '';
                const name = item ? ITEM_NAMES[item] || '' : '';
                const countStr = (count > 1) ? count : '';
                gridHTML += `
                    <div class="hotbar-slot" onclick="onInventorySlotClick('inventory', ${i})" title="${name}">
                        ${icon ? `<span class="slot-icon">${icon}</span>` : ''}
                        ${countStr ? `<span class="slot-count">${countStr}</span>` : ''}
                    </div>
                `;
            }
            gridContainer.innerHTML = gridHTML;
            
            let hotbarHTML = '';
            for (let i = 0; i < 9; i++) {
                const item = hotbarItems[i];
                const count = hotbarCounts[i];
                const icon = item ? ITEM_ICONS[item] || '' : '';
                const name = item ? ITEM_NAMES[item] || '' : '';
                const countStr = (count > 1) ? count : '';
                const isLocked = i < 3;
                hotbarHTML += `
                    <div class="hotbar-slot ${isLocked ? 'locked-slot' : ''}" onclick="onInventorySlotClick('hotbar', ${i})" title="${name}">
                        ${icon ? `<span class="slot-icon">${icon}</span>` : ''}
                        ${countStr ? `<span class="slot-count">${countStr}</span>` : ''}
                    </div>
                `;
            }
            hotbarRowContainer.innerHTML = hotbarHTML;
        }

        function updateFloatingItemUI() {
            const floatingDiv = document.getElementById('held-item-floating');
            if (!floatingDiv) return;
            
            if (heldItem) {
                document.getElementById('held-item-icon').innerText = ITEM_ICONS[heldItem.type] || '';
                document.getElementById('held-item-count').innerText = heldItem.count > 1 ? heldItem.count : '';
                floatingDiv.style.display = 'block';
            } else {
                floatingDiv.style.display = 'none';
            }
        }

        function triggerTurretShoot() {
            const now = Date.now();
            if (now - lastTurretShootTime < TURRET_COOLDOWN) return;
            lastTurretShootTime = now;
            
            AudioSynth.playBoom();
            
            const startPos = new THREE.Vector3();
            const localTip = new THREE.Vector3(0, 0.1, -2.4);
            if (turretHeadGroup) {
                localTip.applyMatrix4(turretHeadGroup.matrixWorld);
            } else {
                localTip.add(turretPos);
            }
            startPos.copy(localTip);
            
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            const shellVel = lookDir.clone().multiplyScalar(35.0);
            
            const shellGeo = new THREE.SphereGeometry(0.25, 8, 8);
            const shellMat = new THREE.MeshBasicMaterial({ color: 0xff4500, toneMapped: false });
            const shellMesh = new THREE.Mesh(shellGeo, shellMat);
            shellMesh.position.copy(startPos);
            
            const shellLight = new THREE.PointLight(0xff4500, 1.5, 6);
            shellMesh.add(shellLight);
            
            scene.add(shellMesh);
            
            const shellId = Math.random().toString(36).substr(2, 6);
            
            turretShells.push({
                id: shellId,
                mesh: shellMesh,
                vel: shellVel,
                pos: startPos
            });
            
            sendNetworkMessage({
                type: 'fire-explosive',
                id: shellId,
                x: startPos.x,
                y: startPos.y,
                z: startPos.z,
                vx: shellVel.x,
                vy: shellVel.y,
                vz: shellVel.z
            });
        }

        function createExplosionEffect(ex, ey, ez, maxRadius = 6.5, maxDamage = 32, setFire = true) {
            AudioSynth.playBoom();
            
            const blastGeo = new THREE.SphereGeometry(0.1, 16, 16);
            const blastMat = new THREE.MeshBasicMaterial({
                color: 0xff5500,
                transparent: true,
                opacity: 0.9,
                toneMapped: false
            });
            const blastMesh = new THREE.Mesh(blastGeo, blastMat);
            blastMesh.position.set(ex, ey, ez);
            scene.add(blastMesh);
            
            const expLight = new THREE.PointLight(0xffea00, 3.0, 15);
            expLight.position.set(ex, ey + 0.5, ez);
            scene.add(expLight);
            
            let t = 0;
            const duration = 0.45;
            
            const expInterval = setInterval(() => {
                t += 0.03;
                if (t >= duration) {
                    clearInterval(expInterval);
                    scene.remove(blastMesh);
                    scene.remove(expLight);
                } else {
                    const scale = (t / duration) * maxRadius * 10;
                    blastMesh.scale.set(scale, scale, scale);
                    blastMat.opacity = 0.9 * (1.0 - t / duration);
                    expLight.intensity = 3.0 * (1.0 - t / duration);
                }
            }, 30);
            
            if (myHealth > 0 && gameActive) {
                const px = camera.position.x;
                const pz = camera.position.z;
                
                const dx = px - ex;
                const dz = pz - ez;
                const distXZ = Math.sqrt(dx * dx + dz * dz);
                
                if (distXZ < maxRadius) {
                    const dmg = Math.round(maxDamage * (1.0 - distXZ / maxRadius));
                    if (dmg > 0) {
                        const kDir = new THREE.Vector2(dx, dz).normalize();
                        const knockbackPower = 25.0 * (1.0 - distXZ / maxRadius);
                        
                        // Set local player on fire
                        if (setFire) {
                            myBurnTime = 10;
                            sendNetworkMessage({ type: 'fire-state', burning: true });
                        }
                        
                        takeDamage(dmg, kDir.x * knockbackPower, kDir.y * knockbackPower, "Killed by Explosion!");
                    }
                }
            }

            // Apply visual recoil to opponent if they are near the blast
            if (opponentGroup && gameActive) {
                const ox = opponentGroup.position.x;
                const oz = opponentGroup.position.z;
                const odx = ox - ex;
                const odz = oz - ez;
                const odistXZ = Math.sqrt(odx * odx + odz * odz);
                if (odistXZ < maxRadius) {
                    const power = 1.4 * (1.0 - odistXZ / maxRadius);
                    const kDir = new THREE.Vector3(odx, 0.2 * odistXZ, odz).normalize();
                    opponentRecoilPos.addScaledVector(kDir, power);
                    applyOpponentRecoilRot(kDir.x, kDir.z, 0.55 * (1.0 - odistXZ / maxRadius));
                }
            }

            if (isHost && gameActive) {
                zombies.forEach(z => {
                    if (z.isDead) return;
                    const zx = z.mesh.position.x;
                    const zz = z.mesh.position.z;
                    const zdx = zx - ex;
                    const zdz = zz - ez;
                    const zdistXZ = Math.sqrt(zdx * zdx + zdz * zdz);
                    if (zdistXZ < maxRadius) {
                        const zdmg = Math.round(maxDamage * (1.0 - zdistXZ / maxRadius));
                        if (zdmg > 0) {
                            z.health = Math.max(0, z.health - zdmg);
                            if (setFire) {
                                z.burnTime = 10; // set on fire
                            }
                            
                            // Apply knockback to zombie
                            const zkDir = new THREE.Vector2(zdx, zdz).normalize();
                            const zKnockback = 18.0 * (1.0 - zdistXZ / maxRadius);
                            z.kx = zkDir.x * zKnockback;
                            z.kz = zkDir.y * zKnockback;
                            
                            // Visual recoil
                            zombieRecoilMap.set(z.mesh, {
                                pos: new THREE.Vector3(zdx, 0.2, zdz).normalize().multiplyScalar(0.8),
                                rotX: 0.3
                            });

                            flashZombieRed(z.mesh);
                            
                            if (z.health <= 0) {
                                z.isDead = true;
                                z.deathTime = 0;
                            }
                        }
                    }
                });

                // Explosion damage to villagers
                villagers.forEach(v => {
                    if (v.isDead) return;
                    const vx = v.mesh.position.x;
                    const vz = v.mesh.position.z;
                    const vdx = vx - ex;
                    const vdz = vz - ez;
                    const vdistXZ = Math.sqrt(vdx * vdx + vdz * vdz);
                    if (vdistXZ < maxRadius) {
                        const vdmg = Math.round(maxDamage * (1.0 - vdistXZ / maxRadius));
                        if (vdmg > 0) {
                            v.health = Math.max(0, v.health - vdmg);
                            const vkDir = new THREE.Vector2(vdx, vdz).normalize();
                            const vKnockback = 18.0 * (1.0 - vdistXZ / maxRadius);
                            v.kx = vkDir.x * vKnockback;
                            v.kz = vkDir.y * vKnockback;
                            if (v.health <= 0) {
                                v.isDead = true;
                                v.deathTime = 0;
                            }
                            flashVillagerRed(v.mesh);
                            
                            sendNetworkMessage({
                                type: 'damage-villager',
                                id: v.id,
                                damage: vdmg,
                                kx: vkDir.x * vKnockback,
                                kz: vkDir.y * vKnockback
                            });
                        }
                    }
                });
            } else if (!isHost && gameActive) {
                // Client zombie recoil from local explosions
                for (let [id, mesh] of clientZombies) {
                    const zx = mesh.position.x;
                    const zz = mesh.position.z;
                    const zdx = zx - ex;
                    const zdz = zz - ez;
                    const zdistXZ = Math.sqrt(zdx * zdx + zdz * zdz);
                    if (zdistXZ < maxRadius) {
                        zombieRecoilMap.set(mesh, {
                            pos: new THREE.Vector3(zdx, 0.2, zdz).normalize().multiplyScalar(0.8),
                            rotX: 0.3
                        });
                    }
                }
            }
        }

        // --- ZOMBIES SECTION ---

        function createZombieMesh() {
            const group = new THREE.Group();
            
            const skinMat = new THREE.MeshStandardMaterial({ color: 0x4a6f44, roughness: 0.8 }); // Decayed green skin
            const shirtMat = new THREE.MeshStandardMaterial({ color: 0x4b2d5c, roughness: 0.9 }); // Torn purple shirt
            const pantsMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 }); // Torn grey pants
            const detailMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a }); // Mouth/hair details
            const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
            const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // glowing red pupils!

            // Torso (index 0)
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 1.2, 10), shirtMat);
            torso.position.y = 1.0;
            torso.castShadow = true;
            group.add(torso);

            // Add tattered details to shirt torso
            const rip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.05), skinMat);
            rip.position.set(0.1, 0.1, 0.3);
            torso.add(rip);
            
            // Head (index 1)
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), skinMat);
            head.position.y = 1.75;
            head.castShadow = true;
            group.add(head);

            // Face details on head
            // Dead eyes
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.03), eyeWhiteMat);
            eyeL.position.set(-0.08, 0.06, 0.22);
            head.add(eyeL);
            
            const pupilL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), eyePupilMat);
            pupilL.position.set(0, 0, 0.015);
            eyeL.add(pupilL);

            const eyeR = eyeL.clone();
            eyeR.position.x = 0.08;
            head.add(eyeR);

            // Nose
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.06), skinMat);
            nose.position.set(0, -0.02, 0.24);
            head.add(nose);

            // Open mouth
            const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.02), detailMat);
            mouth.position.set(0, -0.1, 0.23);
            head.add(mouth);

            // Tattered hair
            const hair = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.28), detailMat);
            hair.position.set(0, 0.14, 0);
            head.add(hair);

            // Left Arm (reaching forward, index 2)
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.12), skinMat);
            armL.position.set(-0.38, 1.2, 0.25);
            armL.rotation.x = -Math.PI / 2.2;
            armL.castShadow = true;
            group.add(armL);

            // Sleeve details on arm
            const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), shirtMat);
            sleeveL.position.y = 0.18;
            armL.add(sleeveL);

            // Right Arm (index 3)
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.12), skinMat);
            armR.position.set(0.38, 1.2, 0.25);
            armR.rotation.x = -Math.PI / 2.2;
            armR.castShadow = true;
            group.add(armR);

            const sleeveR = sleeveL.clone();
            armR.add(sleeveR);

            // Left Leg (index 4)
            const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.14), pantsMat);
            legL.position.set(-0.2, 0.38, 0);
            legL.castShadow = true;
            group.add(legL);

            // Right Leg (index 5)
            const legR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.14), pantsMat);
            legR.position.set(0.2, 0.38, 0);
            legR.castShadow = true;
            group.add(legR);
            
            return group;
        }

        function createCreeperMesh() {
            const group = new THREE.Group();
            
            const skinMat = new THREE.MeshStandardMaterial({ color: 0x4a6f44, roughness: 0.8 }); // Decayed green skin
            const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2e5c46, roughness: 0.9 }); // Torn green shirt
            const pantsMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }); // Torn black pants
            
            // Torso (index 0)
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 1.2, 10), shirtMat);
            torso.position.y = 1.0;
            torso.castShadow = true;
            group.add(torso);
            
            // TNT Head (index 1)
            const headGroup = new THREE.Group();
            headGroup.position.y = 1.75;
            
            // Red TNT Block
            const redMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.9 });
            const tntBox = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), redMat);
            tntBox.castShadow = true;
            headGroup.add(tntBox);
            
            // White Band wrapping
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.12, 0.39), whiteMat);
            headGroup.add(band);
            
            // Black "TNT" text details
            const labelMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
            // Front label block
            const labelFront = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.395), labelMat);
            headGroup.add(labelFront);
            
            group.add(headGroup);
            
            // Left Arm (reaching forward, index 2)
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.12), skinMat);
            armL.position.set(-0.38, 1.2, 0.25);
            armL.rotation.x = -Math.PI / 2.2;
            armL.castShadow = true;
            group.add(armL);
            
            // Right Arm (index 3)
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.12), skinMat);
            armR.position.set(0.38, 1.2, 0.25);
            armR.rotation.x = -Math.PI / 2.2;
            armR.castShadow = true;
            group.add(armR);
            
            // Left Leg (index 4)
            const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.14), pantsMat);
            legL.position.set(-0.2, 0.38, 0);
            legL.castShadow = true;
            group.add(legL);
            
            // Right Leg (index 5)
            const legR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.14), pantsMat);
            legR.position.set(0.2, 0.38, 0);
            legR.castShadow = true;
            group.add(legR);
            
            return group;
        }

        function createSkeletonMesh() {
            const group = new THREE.Group();
            const boneMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.9 });
            const darkMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
            const bowMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }); // Dark brown
            
            // Torso (index 0)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, 0.12), boneMat);
            torso.position.y = 1.0;
            torso.castShadow = true;
            group.add(torso);
            
            // Ribs details
            for (let i = 0; i < 3; i++) {
                const rib = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.14), boneMat);
                rib.position.y = 0.25 - i * 0.22;
                torso.add(rib);
            }
            
            // Head (index 1)
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), boneMat);
            head.position.y = 1.70;
            head.castShadow = true;
            group.add(head);
            
            // Eye sockets
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), darkMat);
            eyeL.position.set(-0.06, 0.03, 0.131);
            head.add(eyeL);
            
            const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), darkMat);
            eyeR.position.set(0.06, 0.03, 0.131);
            head.add(eyeR);
            
            // Left Arm (holding bow, index 2)
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.65, 0.07), boneMat);
            armL.position.set(-0.25, 1.2, 0.25);
            armL.rotation.x = -Math.PI / 2.1;
            armL.rotation.y = 0.2;
            armL.castShadow = true;
            group.add(armL);
            
            // Bow attached to left arm
            const bow = new THREE.Group();
            bow.position.set(0, -0.2, 0.05);
            bow.rotation.z = Math.PI / 2;
            const bowGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 6);
            const bowMesh = new THREE.Mesh(bowGeo, bowMat);
            bow.add(bowMesh);
            
            // Bow string line
            const stringGeo = new THREE.BoxGeometry(0.005, 0.75, 0.005);
            const stringMesh = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: 0xcccccc }));
            stringMesh.position.z = -0.06;
            bow.add(stringMesh);
            armL.add(bow);
            
            // Right Arm (drawing, index 3)
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.65, 0.07), boneMat);
            armR.position.set(0.25, 1.2, 0.2);
            armR.rotation.x = -Math.PI / 1.8;
            armR.rotation.y = -0.4;
            armR.castShadow = true;
            group.add(armR);
            
            // Left Leg (index 4)
            const legL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), boneMat);
            legL.position.set(-0.14, 0.38, 0);
            legL.castShadow = true;
            group.add(legL);
            
            // Right Leg (index 5)
            const legR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), boneMat);
            legR.position.set(0.14, 0.38, 0);
            legR.castShadow = true;
            group.add(legR);
            
            return group;
        }

        function createBeeMesh() {
            const group = new THREE.Group();
            
            const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 0.5 });
            const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
            const wingMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.6 });
            
            // Torso (yellow block, index 0)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.26), yellowMat);
            torso.castShadow = true;
            group.add(torso);
            
            // Black stripes on torso
            const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.15, 0.04), blackMat);
            stripe1.position.z = 0.04;
            torso.add(stripe1);
            
            const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.15, 0.04), blackMat);
            stripe2.position.z = -0.06;
            torso.add(stripe2);
            
            // Left wing (index 2)
            const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.14), wingMat);
            wingL.position.set(-0.1, 0.08, 0.02);
            group.add(wingL);
            
            // Right wing (index 3)
            const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.14), wingMat);
            wingR.position.set(0.1, 0.08, 0.02);
            group.add(wingR);
            
            // Eyes
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), blackMat);
            eyeL.position.set(-0.06, 0.02, 0.131);
            torso.add(eyeL);
            
            const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), blackMat);
            eyeR.position.set(0.06, 0.02, 0.131);
            torso.add(eyeR);
            
            return group;
        }

        function spawnInitialZombies() {
            clearZombies();
            spawnMoreZombies(8);
        }

        function spawnMoreZombies(count) {
            for (let i = 0; i < count; i++) {
                const id = Math.random().toString(36).substr(2, 6);
                let zx, zz;
                
                // Spawn in different quadrants
                const rand = Math.random();
                if (rand < 0.25) {
                    zx = 20 + Math.random() * 80;
                    zz = -40 + Math.random() * 80;
                } else if (rand < 0.5) {
                    zx = -100 + Math.random() * 70;
                    zz = 20 + Math.random() * 80;
                } else if (rand < 0.75) {
                    zx = -90 + Math.random() * 50;
                    zz = -90 + Math.random() * 50;
                } else {
                    zx = 40 + Math.random() * 60;
                    zz = 40 + Math.random() * 60;
                }
                const zy = getTerrainHeight(zx, zz);
                
                const randType = Math.random();
                let type, health, mesh;
                if (randType < 0.30) {
                    type = 'skeleton';
                    health = 45;
                    mesh = createSkeletonMesh();
                } else if (randType < 0.60) {
                    type = 'creeper';
                    health = 38;
                    mesh = createCreeperMesh();
                } else {
                    type = 'zombie';
                    health = 40;
                    mesh = createZombieMesh();
                }
                mesh.position.set(zx, zy, zz);
                scene.add(mesh);
                
                zombies.push({
                    id: id,
                    mesh: mesh,
                    type: type,
                    x: zx,
                    y: zy,
                    z: zz,
                    ry: 0,
                    lastAttackTime: 0,
                    isAttacking: false,
                    attackAnimTime: 0,
                    health: health,
                    burnTime: 0,
                    kx: 0,
                    kz: 0,
                    isDead: false,
                    deathTime: 0,
                    isHissing: false,
                    hissStartTime: 0
                });
            }
        }

        function spawnZombies() {
            spawnInitialZombies();
        }

        function clearZombies() {
            zombies.forEach(z => {
                scene.remove(z.mesh);
            });
            zombies.length = 0;
            
            clientZombies.forEach(mesh => {
                scene.remove(mesh);
            });
            clientZombies.clear();
            
            if (isHost && isConnected) {
                sendNetworkMessage({ type: 'zombies-clear' });
            }
        }

        function updateZombies(delta) {
            if (!isHost || !gameActive || myHealth <= 0) return;
            
            const now = Date.now();
            
            for (let i = zombies.length - 1; i >= 0; i--) {
                const z = zombies[i];
                
                // 1. Handle death and slumping
                if (z.isDead) {
                    if (z.deathTime === undefined) z.deathTime = 0;
                    z.deathTime += delta;
                    
                    const slumpProgress = Math.min(1.0, z.deathTime / 0.8);
                    z.mesh.rotation.x = slumpProgress * (-Math.PI / 2);
                    z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z) + 0.15 * (1 - slumpProgress);
                    z.mesh.children[2].rotation.x = -Math.PI / 2.2 + slumpProgress * Math.PI / 2;
                    z.mesh.children[3].rotation.x = -Math.PI / 2.2 + slumpProgress * Math.PI / 2;
                    continue;
                }

                // Check if zombie enters the lake
                const zdx_lake = z.mesh.position.x - LAKE_CENTER_X;
                const zdz_lake = z.mesh.position.z - LAKE_CENTER_Z;
                const zDistToLake = Math.sqrt(zdx_lake * zdx_lake + zdz_lake * zdz_lake);
                const isZombieInLake = (zDistToLake < LAKE_RADIUS && z.mesh.position.y < WATER_Y + 0.5) || (z.mesh.position.y <= WATER_Y);

                if (isZombieInLake) {
                    z.burnTime = 0;
                }

                // 2. Daytime burning (Zombies and Skeletons burn in daylight; Creepers do not)
                if (isDayTime && !isZombieInLake && (z.type === 'zombie' || z.type === 'skeleton')) {
                    if (z.burnTime <= 0) z.burnTime = 1;
                    z.health -= 6.0 * delta;
                    spawnFireParticles(z.mesh.position, 1);
                    
                    if (z.health <= 0) {
                        z.isDead = true;
                        z.deathTime = 0;
                        continue;
                    }
                }
                
                // 3. Normal fire burning
                if (z.burnTime > 0 && !isZombieInLake) {
                    z.burnTime -= delta;
                    z.health -= 2.0 * delta;
                    spawnFireParticles(z.mesh.position, 1);
                    
                    if (z.health <= 0) {
                        z.isDead = true;
                        z.deathTime = 0;
                        continue;
                    }
                }
                
                // Apply knockback velocities
                if (z.kx || z.kz) {
                    z.mesh.position.x += z.kx * delta;
                    z.mesh.position.z += z.kz * delta;
                    z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z);
                    
                    z.kx -= z.kx * 4.5 * delta;
                    z.kz -= z.kz * 4.5 * delta;
                    if (Math.abs(z.kx) < 0.05) z.kx = 0;
                    if (Math.abs(z.kz) < 0.05) z.kz = 0;
                }
                
                const px = camera.position.x;
                const pz = camera.position.z;
                
                // Target Selection (nearest of Host, Opponent, or Villager)
                let targetX = px;
                let targetZ = pz;
                let targetType = 'host';
                let minDist = Infinity;
                
                if (myHealth > 0 && !inBush) {
                    minDist = Math.sqrt(Math.pow(z.mesh.position.x - px, 2) + Math.pow(z.mesh.position.z - pz, 2));
                }
                
                if (opponentGroup && oppHealth > 0 && isConnected && !opponentInvisible) {
                    const ox = opponentGroup.position.x;
                    const oz = opponentGroup.position.z;
                    const distToClient = Math.sqrt(Math.pow(z.mesh.position.x - ox, 2) + Math.pow(z.mesh.position.z - oz, 2));
                    if (distToClient < minDist) {
                        minDist = distToClient;
                        targetX = ox;
                        targetZ = oz;
                        targetType = 'client';
                    }
                }

                // Check villagers
                villagers.forEach(v => {
                    if (v.isDead) return;
                    const distToVillager = Math.sqrt(Math.pow(z.mesh.position.x - v.mesh.position.x, 2) + Math.pow(z.mesh.position.z - v.mesh.position.z, 2));
                    if (distToVillager < minDist) {
                        minDist = distToVillager;
                        targetX = v.mesh.position.x;
                        targetZ = v.mesh.position.z;
                        targetType = v;
                    }
                });
                
                // Creeper Hissing & Explosion logic
                if (z.type === 'creeper') {
                    if (minDist < 3.2 && !z.isHissing) {
                        z.isHissing = true;
                        z.hissStartTime = now;
                        AudioSynth.playHiss();
                    }
                    
                    if (z.isHissing) {
                        const elapsed = (now - z.hissStartTime) / 1000;
                        const swell = 1.0 + Math.min(1.0, elapsed / 2.0) * 0.35;
                        z.mesh.scale.set(swell, swell, swell);
                        
                        if (elapsed >= 2.0) {
                            // Explode!
                            createExplosionEffect(z.mesh.position.x, z.mesh.position.y, z.mesh.position.z, 4.5, 10, false);
                            
                            // Sync explosion to client
                            sendNetworkMessage({
                                type: 'creeper-explode',
                                x: z.mesh.position.x,
                                y: z.mesh.position.y,
                                z: z.mesh.position.z
                            });
                            
                            scene.remove(z.mesh);
                            zombies.splice(i, 1);
                            continue;
                        }
                    }
                }
                
                const dx = targetX - z.mesh.position.x;
                const dz = targetZ - z.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (minDist === Infinity) {
                    // Mindless Wandering when players are dead or invisible
                    if (z.wanderTimer === undefined) {
                        z.wanderTimer = 0;
                        z.wanderAngle = Math.random() * Math.PI * 2;
                    }
                    
                    z.wanderTimer -= delta;
                    if (z.wanderTimer <= 0) {
                        z.wanderAngle = Math.random() * Math.PI * 2;
                        z.wanderTimer = 2.0 + Math.random() * 3.0;
                    }
                    
                    const shuffleSpeed = 1.2;
                    const vx = Math.sin(z.wanderAngle) * shuffleSpeed;
                    const vz = Math.cos(z.wanderAngle) * shuffleSpeed;
                    
                    z.mesh.position.x += vx * delta;
                    z.mesh.position.z += vz * delta;
                    z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z);
                    
                    z.ry = z.wanderAngle;
                    z.mesh.rotation.y = z.ry;
                    
                    const walkSpeed = 8;
                    if (z.mesh.children[4] && z.mesh.children[5]) {
                        if (z.type === 'creeper') {
                            const angle = Math.sin(now * 0.01 * walkSpeed) * 0.25;
                            z.mesh.children[2].rotation.x = angle;
                            z.mesh.children[5].rotation.x = angle;
                            z.mesh.children[3].rotation.x = -angle;
                            z.mesh.children[4].rotation.x = -angle;
                        } else {
                            z.mesh.children[4].rotation.x = Math.sin(now * 0.01 * walkSpeed) * 0.25;
                            z.mesh.children[5].rotation.x = -Math.sin(now * 0.01 * walkSpeed) * 0.25;
                        }
                    }
                } else if (z.type === 'skeleton') {
                    // Skeleton Archer movement AI: maintain 10m - 16m distance
                    let isMoving = false;
                    let moveSpeed = 3.2;
                    let mx = 0, mz = 0;
                    
                    if (dist > 16.0) {
                        // Move closer
                        mx = (dx / dist) * moveSpeed;
                        mz = (dz / dist) * moveSpeed;
                        isMoving = true;
                    } else if (dist < 10.0) {
                        // Move backward
                        moveSpeed = 2.4;
                        mx = -(dx / dist) * moveSpeed;
                        mz = -(dz / dist) * moveSpeed;
                        isMoving = true;
                    }
                    
                    if (isMoving) {
                        z.mesh.position.x += mx * delta;
                        z.mesh.position.z += mz * delta;
                        z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z);
                        
                        // Animate walking legs
                        if (z.mesh.children[4] && z.mesh.children[5]) {
                            z.mesh.children[4].rotation.x = Math.sin(now * 0.01 * 10) * 0.4;
                            z.mesh.children[5].rotation.x = -Math.sin(now * 0.01 * 10) * 0.4;
                        }
                    } else {
                        // Reset legs
                        if (z.mesh.children[4] && z.mesh.children[5]) {
                            z.mesh.children[4].rotation.x = 0;
                            z.mesh.children[5].rotation.x = 0;
                        }
                    }
                    
                    // Face target
                    z.ry = Math.atan2(dx, dz);
                    z.mesh.rotation.y = z.ry;
                    
                    // Shoot archery projectile
                    if (z.lastShootTime === undefined) z.lastShootTime = 0;
                    if (now - z.lastShootTime > 2500) {
                        z.lastShootTime = now;
                        
                        // Spawn arrow
                        const arrowPos = z.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0));
                        const targetPos = new THREE.Vector3(targetX, getTerrainHeight(targetX, targetZ) + 1.0, targetZ);
                        const toTarget = new THREE.Vector3().subVectors(targetPos, arrowPos);
                        const distXZ = Math.sqrt(toTarget.x * toTarget.x + toTarget.z * toTarget.z);
                        
                        toTarget.y += distXZ * 0.15;
                        const arrowVel = toTarget.normalize().multiplyScalar(32.0);
                        
                        const arrowGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.7, 4);
                        arrowGeo.rotateX(Math.PI / 2);
                        const arrowMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
                        const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
                        arrowMesh.position.copy(arrowPos);
                        scene.add(arrowMesh);
                        
                        const arrowId = Math.random().toString(36).substr(2, 6);
                        skeletonArrows.push({
                            id: arrowId,
                            mesh: arrowMesh,
                            pos: arrowPos,
                            vel: arrowVel
                        });
                        
                        // Play skeleton clack clank sound
                        AudioSynth.playClack(z.mesh.position);
                        
                        // Broadcast shooting to client visually
                        sendNetworkMessage({
                            type: 'fire-arrow',
                            id: arrowId,
                            x: arrowPos.x,
                            y: arrowPos.y,
                            z: arrowPos.z,
                            vx: arrowVel.x,
                            vy: arrowVel.y,
                            vz: arrowVel.z
                        });
                    }
                } else {
                    // Regular zombie & creeper target pursuit
                    if (dist > 0.1 && !z.isHissing) {
                        const speed = 3.2;
                        const vx = (dx / dist) * speed;
                        const vz = (dz / dist) * speed;
                        
                        z.mesh.position.x += vx * delta;
                        z.mesh.position.z += vz * delta;
                        z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z);
                        
                        z.ry = Math.atan2(dx, dz);
                        z.mesh.rotation.y = z.ry;
                        
                        const walkSpeed = 10;
                        if (z.mesh.children[4] && z.mesh.children[5]) {
                            if (z.type === 'creeper') {
                                const angle = Math.sin(now * 0.01 * walkSpeed) * 0.4;
                                z.mesh.children[2].rotation.x = angle;
                                z.mesh.children[5].rotation.x = angle;
                                z.mesh.children[3].rotation.x = -angle;
                                z.mesh.children[4].rotation.x = -angle;
                            } else {
                                z.mesh.children[4].rotation.x = Math.sin(now * 0.01 * walkSpeed) * 0.4;
                                z.mesh.children[5].rotation.x = -Math.sin(now * 0.01 * walkSpeed) * 0.4;
                            }
                        }
                    } else {
                        // Reset legs to standing idle position if standing/hissing
                        if (z.mesh.children[4] && z.mesh.children[5]) {
                            if (z.type === 'creeper') {
                                z.mesh.children[2].rotation.x = 0;
                                z.mesh.children[3].rotation.x = 0;
                                z.mesh.children[4].rotation.x = 0;
                                z.mesh.children[5].rotation.x = 0;
                            } else {
                                z.mesh.children[4].rotation.x = 0;
                                z.mesh.children[5].rotation.x = 0;
                            }
                        }
                    }
                }
                
                const distToTarget = dist;
                // Skeletons do not punch/bite target, they shoot arrows!
                if (z.type !== 'creeper' && z.type !== 'skeleton' && distToTarget < 2.0 && now - z.lastAttackTime > 1500 && minDist !== Infinity) {
                    z.lastAttackTime = now;
                    z.isAttacking = true;
                    z.attackAnimTime = 0.4;
                    
                    const kx = (targetX - z.mesh.position.x);
                    const kz = (targetZ - z.mesh.position.z);
                    const kLen = Math.sqrt(kx*kx + kz*kz);
                    const force = 6.0;
                    const kxNorm = kLen > 0 ? (kx/kLen)*force : 0;
                    const kzNorm = kLen > 0 ? (kz/kLen)*force : 0;
                    
                    if (targetType === 'host') {
                        takeDamage(9, kxNorm, kzNorm, "Killed by Zombie!");
                    } else if (targetType === 'client') {
                        sendNetworkMessage({
                            type: 'zombie-hit',
                            damage: 9,
                            kx: kxNorm,
                            kz: kzNorm
                        });
                    } else {
                        // Target is a villager
                        const v = targetType;
                        v.health = Math.max(0, v.health - 9);
                        v.kx = kxNorm;
                        v.kz = kzNorm;
                        flashVillagerRed(v.mesh);
                        
                        if (v.health <= 0) {
                            v.isDead = true;
                            v.deathTime = 0;
                        }
                        
                        sendNetworkMessage({
                            type: 'damage-villager',
                            id: v.id,
                            damage: 9,
                            kx: kxNorm,
                            kz: kzNorm
                        });
                    }
                }
                
                if (z.isAttacking) {
                    z.attackAnimTime -= delta;
                    if (z.attackAnimTime <= 0) {
                        z.isAttacking = false;
                        z.mesh.children[2].rotation.x = -Math.PI / 2.2;
                        z.mesh.children[3].rotation.x = -Math.PI / 2.2;
                    } else {
                        const angle = -Math.PI / 2.2 - Math.sin((0.4 - z.attackAnimTime) * Math.PI / 0.4) * 0.8;
                        z.mesh.children[2].rotation.x = angle;
                        z.mesh.children[3].rotation.x = angle;
                    }
                }
            }
            
            if (now - lastZombieSyncTime > 66) {
                const syncData = zombies.map(z => ({
                    id: z.id,
                    x: z.mesh.position.x,
                    y: z.mesh.position.y,
                    z: z.mesh.position.z,
                    ry: z.ry,
                    isAttacking: z.isAttacking,
                    isBurning: z.burnTime > 0,
                    isDead: z.isDead || false,
                    deathTime: z.deathTime || 0,
                    type: z.type || 'zombie',
                    isHissing: z.isHissing || false
                }));
                sendNetworkMessage({
                    type: 'zombies-sync',
                    zombies: syncData
                });
                lastZombieSyncTime = now;
            }
        }

        function createPigMesh() {
            const group = new THREE.Group();
            const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffa7c4, roughness: 0.8 });
            const snoutMat = new THREE.MeshStandardMaterial({ color: 0xff7fa5, roughness: 0.8 });
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Torso (centered around y = 0.3)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.9), pinkMat);
            torso.position.y = 0.6;
            torso.castShadow = true;
            torso.receiveShadow = true;
            group.add(torso);

            // Head
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 0.8, 0.45);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), pinkMat);
            head.castShadow = true;
            headGroup.add(head);

            // Snout
            const snout = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.12), snoutMat);
            snout.position.set(0, -0.08, 0.25);
            snout.castShadow = true;
            headGroup.add(snout);

            // Eyes
            const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.02), whiteMat);
            leftEye.position.set(-0.23, 0.05, 0.15);
            const leftPupil = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.02), eyeMat);
            leftPupil.position.set(-0.24, 0.05, 0.16);
            headGroup.add(leftEye);
            headGroup.add(leftPupil);

            const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.02), whiteMat);
            rightEye.position.set(0.23, 0.05, 0.15);
            const rightPupil = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.02), eyeMat);
            rightPupil.position.set(0.24, 0.05, 0.16);
            headGroup.add(rightEye);
            headGroup.add(rightPupil);

            group.add(headGroup);

            // 4 Legs
            const legGeo = new THREE.BoxGeometry(0.18, 0.35, 0.18);
            const legFL = new THREE.Mesh(legGeo, pinkMat);
            legFL.position.set(-0.2, 0.175, 0.3);
            legFL.castShadow = true;
            group.add(legFL);

            const legFR = new THREE.Mesh(legGeo, pinkMat);
            legFR.position.set(0.2, 0.175, 0.3);
            legFR.castShadow = true;
            group.add(legFR);

            const legBL = new THREE.Mesh(legGeo, pinkMat);
            legBL.position.set(-0.2, 0.175, -0.3);
            legBL.castShadow = true;
            group.add(legBL);

            const legBR = new THREE.Mesh(legGeo, pinkMat);
            legBR.position.set(0.2, 0.175, -0.3);
            legBR.castShadow = true;
            group.add(legBR);

            group.userData = { type: 'pig', head: headGroup, legFL, legFR, legBL, legBR };
            return group;
        }

        function createCowMesh() {
            const group = new THREE.Group();
            const brownMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 }); // Cow main
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }); // Patches
            const noseMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.8 }); // Pink nose
            const hornMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 });
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

            // Torso (centered around y = 0.8)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.3), brownMat);
            torso.position.y = 0.8;
            torso.castShadow = true;
            torso.receiveShadow = true;
            group.add(torso);

            // Spots/patches
            const patch1 = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.4, 0.4), whiteMat);
            patch1.position.set(0.01, 0.9, 0.2);
            group.add(patch1);
            const patch2 = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.3, 0.3), whiteMat);
            patch2.position.set(-0.01, 0.7, -0.3);
            group.add(patch2);

            // Head
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 1.2, 0.7);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), brownMat);
            head.castShadow = true;
            headGroup.add(head);

            // Snout/Nose
            const snout = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.2), noseMat);
            snout.position.set(0, -0.1, 0.28);
            snout.castShadow = true;
            headGroup.add(snout);

            // Horns
            const hornGeo = new THREE.BoxGeometry(0.08, 0.2, 0.08);
            const hornL = new THREE.Mesh(hornGeo, hornMat);
            hornL.position.set(-0.22, 0.32, -0.05);
            hornL.rotation.z = -0.2;
            const hornR = new THREE.Mesh(hornGeo, hornMat);
            hornR.position.set(0.22, 0.32, -0.05);
            hornR.rotation.z = 0.2;
            headGroup.add(hornL);
            headGroup.add(hornR);

            // Eyes
            const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), eyeMat);
            leftEye.position.set(-0.26, 0.08, 0.18);
            const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), eyeMat);
            rightEye.position.set(0.26, 0.08, 0.18);
            headGroup.add(leftEye);
            headGroup.add(rightEye);

            group.add(headGroup);

            // 4 Legs
            const legGeo = new THREE.BoxGeometry(0.25, 0.5, 0.25);
            const legFL = new THREE.Mesh(legGeo, brownMat);
            legFL.position.set(-0.25, 0.25, 0.45);
            legFL.castShadow = true;
            group.add(legFL);

            const legFR = new THREE.Mesh(legGeo, brownMat);
            legFR.position.set(0.25, 0.25, 0.45);
            legFR.castShadow = true;
            group.add(legFR);

            const legBL = new THREE.Mesh(legGeo, brownMat);
            legBL.position.set(-0.25, 0.25, -0.45);
            legBL.castShadow = true;
            group.add(legBL);

            const legBR = new THREE.Mesh(legGeo, brownMat);
            legBR.position.set(0.25, 0.25, -0.45);
            legBR.castShadow = true;
            group.add(legBR);

            group.userData = { type: 'cow', head: headGroup, legFL, legFR, legBL, legBR };
            return group;
        }

        function createSheepMesh() {
            const group = new THREE.Group();
            const woolMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.9 });
            const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfcfbe, roughness: 0.8 });
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

            // Torso (centered around y = 0.55)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.95), woolMat);
            torso.position.y = 0.6;
            torso.castShadow = true;
            torso.receiveShadow = true;
            group.add(torso);

            // Head
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 0.85, 0.5);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), skinMat);
            head.castShadow = true;
            headGroup.add(head);

            // Wool cap
            const woolCap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.3), woolMat);
            woolCap.position.set(0, 0.2, -0.05);
            headGroup.add(woolCap);

            // Eyes
            const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), eyeMat);
            leftEye.position.set(-0.2, 0.05, 0.12);
            const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), eyeMat);
            rightEye.position.set(0.2, 0.05, 0.12);
            headGroup.add(leftEye);
            headGroup.add(rightEye);

            group.add(headGroup);

            // 4 Legs
            const legGeo = new THREE.BoxGeometry(0.16, 0.4, 0.16);
            const legFL = new THREE.Mesh(legGeo, skinMat);
            legFL.position.set(-0.2, 0.2, 0.35);
            legFL.castShadow = true;
            group.add(legFL);

            const legFR = new THREE.Mesh(legGeo, skinMat);
            legFR.position.set(0.2, 0.2, 0.35);
            legFR.castShadow = true;
            group.add(legFR);

            const legBL = new THREE.Mesh(legGeo, skinMat);
            legBL.position.set(-0.2, 0.2, -0.35);
            legBL.castShadow = true;
            group.add(legBL);

            const legBR = new THREE.Mesh(legGeo, skinMat);
            legBR.position.set(0.2, 0.2, -0.35);
            legBR.castShadow = true;
            group.add(legBR);

            group.userData = { type: 'sheep', head: headGroup, legFL, legFR, legBL, legBR };
            return group;
        }

        function createChickenMesh() {
            const group = new THREE.Group();
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
            const beakMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.5 }); // Orange
            const combMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.8 }); // Red
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

            // Torso (centered around y = 0.3)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), whiteMat);
            torso.position.y = 0.4;
            torso.castShadow = true;
            torso.receiveShadow = true;
            group.add(torso);

            // Head
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 0.65, 0.22);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.25, 0.22), whiteMat);
            head.castShadow = true;
            headGroup.add(head);

            // Beak
            const beak = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.13), beakMat);
            beak.position.set(0, 0.02, 0.13);
            beak.castShadow = true;
            headGroup.add(beak);

            // Wattle
            const wattle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.08), combMat);
            wattle.position.set(0, -0.08, 0.08);
            headGroup.add(wattle);

            // Comb
            const comb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), combMat);
            comb.position.set(0, 0.15, 0.0);
            headGroup.add(comb);

            // Eyes
            const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), eyeMat);
            leftEye.position.set(-0.12, 0.06, 0.05);
            const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), eyeMat);
            rightEye.position.set(0.12, 0.06, 0.05);
            headGroup.add(leftEye);
            headGroup.add(rightEye);

            group.add(headGroup);

            // Wings
            const wingGeo = new THREE.BoxGeometry(0.05, 0.22, 0.3);
            const wingL = new THREE.Mesh(wingGeo, whiteMat);
            wingL.position.set(-0.2, 0.42, 0.02);
            const wingR = new THREE.Mesh(wingGeo, whiteMat);
            wingR.position.set(0.2, 0.42, 0.02);
            group.add(wingL);
            group.add(wingR);

            // Legs
            const legGeo = new THREE.BoxGeometry(0.05, 0.25, 0.05);
            const footGeo = new THREE.BoxGeometry(0.12, 0.03, 0.15);
            
            const legFLGroup = new THREE.Group();
            legFLGroup.position.set(-0.08, 0, 0);
            const legL = new THREE.Mesh(legGeo, beakMat);
            legL.position.y = 0.125;
            legL.castShadow = true;
            const footL = new THREE.Mesh(footGeo, beakMat);
            footL.position.set(0, 0.015, 0.03);
            legFLGroup.add(legL);
            legFLGroup.add(footL);
            group.add(legFLGroup);

            const legFRGroup = new THREE.Group();
            legFRGroup.position.set(0.08, 0, 0);
            const legR = new THREE.Mesh(legGeo, beakMat);
            legR.position.y = 0.125;
            legR.castShadow = true;
            const footR = new THREE.Mesh(footGeo, beakMat);
            footR.position.set(0, 0.015, 0.03);
            legFRGroup.add(legR);
            legFRGroup.add(footR);
            group.add(legFRGroup);

            group.userData = { type: 'chicken', head: headGroup, legFL: legFLGroup, legFR: legFRGroup };
            return group;
        }

        function flashAnimalRed(mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material && node.material.color) {
                    if (node.userData.originalColor === undefined) {
                        node.userData.originalColor = node.material.color.getHex();
                        node.material = node.material.clone();
                    }
                    node.material.color.setHex(0xff0000);
                }
            });
            setTimeout(() => {
                mesh.traverse((node) => {
                    if (node.isMesh && node.material && node.material.color && node.userData.originalColor !== undefined) {
                        node.material.color.setHex(node.userData.originalColor);
                    }
                });
            }, 250);
        }

        function getFoodTypeForAnimal(type) {
            if (type === 'pig') return 'porkchop';
            if (type === 'cow') return 'beef';
            if (type === 'sheep') return 'mutton';
            if (type === 'chicken') return 'chicken';
            return 'porkchop';
        }

        function spawnDroppedFood(type, pos) {
            const group = new THREE.Group();
            let color = 0xffa7c4; // porkchop
            if (type === 'beef') color = 0x8b0000;
            else if (type === 'mutton') color = 0xd2691e;
            else if (type === 'chicken') color = 0xf5deb3;

            const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, emissive: color, emissiveIntensity: 0.15 });
            const geom = new THREE.BoxGeometry(0.24, 0.16, 0.08);
            const mesh = new THREE.Mesh(geom, mat);
            mesh.castShadow = true;
            group.add(mesh);
            group.position.copy(pos);
            group.position.y += 0.3;
            scene.add(group);

            droppedFoods.push({
                type: type,
                mesh: group,
                pos: group.position,
                spawnTime: Date.now(),
                rotY: Math.random() * Math.PI
            });
        }

        function createVillagerMesh() {
            const group = new THREE.Group();
            
            const robeColors = [0x8a5a3c, 0x4a6b5d, 0x3b5e8c, 0x8c7d3b];
            const chosenColor = robeColors[Math.floor(Math.random() * robeColors.length)];
            
            const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 });
            const robeMat = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.8 });
            const darkMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
            const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const shoesMat = new THREE.MeshStandardMaterial({ color: 0x1a202c });

            // Torso (index 0)
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 1.2, 10), robeMat);
            torso.position.y = 1.0;
            torso.castShadow = true;
            group.add(torso);

            // Head (index 1)
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), skinMat);
            head.position.y = 1.75;
            head.castShadow = true;
            group.add(head);

            // Large Prominent Nose (Villager characteristic)
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.1), skinMat);
            nose.position.set(0, -0.04, 0.26);
            head.add(nose);

            // Eyes & Unibrow
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.03), eyeWhiteMat);
            eyeL.position.set(-0.07, 0.05, 0.22);
            head.add(eyeL);
            const pupilL = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.01), darkMat);
            pupilL.position.set(0, 0, 0.015);
            eyeL.add(pupilL);

            const eyeR = eyeL.clone();
            eyeR.position.x = 0.07;
            head.add(eyeR);

            const unibrow = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.03), darkMat);
            unibrow.position.set(0, 0.1, 0.23);
            head.add(unibrow);

            // Left Leg (index 2)
            const legL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.75, 0.13), robeMat);
            legL.position.set(-0.18, 0.38, 0);
            legL.castShadow = true;
            group.add(legL);

            const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.18), shoesMat);
            shoeL.position.set(0, -0.38, 0.02);
            legL.add(shoeL);

            // Right Leg (index 3)
            const legR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.75, 0.13), robeMat);
            legR.position.set(0.18, 0.38, 0);
            legR.castShadow = true;
            group.add(legR);

            const shoeR = shoeL.clone();
            legR.add(shoeR);

            // Folded Arms box in front of chest (index 4)
            const foldedArms = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.22), robeMat);
            foldedArms.position.set(0, 1.15, 0.24);
            foldedArms.castShadow = true;
            group.add(foldedArms);
            
            return group;
        }

        function spawnVillagers(villagerData) {
            clearVillagers();
            if (!villagerData) return;
            
            villagerData.forEach(vd => {
                const vy = getTerrainHeight(vd.x, vd.z);
                const mesh = createVillagerMesh();
                mesh.position.set(vd.x, vy, vd.z);
                scene.add(mesh);
                
                villagers.push({
                    id: vd.id,
                    mesh: mesh,
                    x: vd.x,
                    y: vy,
                    z: vd.z,
                    targetX: vd.x + (Math.random() - 0.5) * 25,
                    targetZ: vd.z + (Math.random() - 0.5) * 25,
                    waitTime: Math.random() * 3.0,
                    speed: 1.0 + Math.random() * 0.4,
                    health: 40,
                    maxHealth: 40,
                    isDead: false,
                    deathTime: 0,
                    kx: 0,
                    kz: 0
                });
            });
        }

        function clearVillagers() {
            villagers.forEach(v => {
                scene.remove(v.mesh);
            });
            villagers.length = 0;
        }

        function updateBees(delta) {
            if (!isHost || !gameActive) return;
            
            const now = Date.now();
            
            // Check if target player health is low or they went invisible or died
            if (beesAngryAt === 'host') {
                if (myHealth <= 15 || localPlayerInvisible || myHealth <= 0) {
                    beesAngryAt = null;
                }
            } else if (beesAngryAt === 'client') {
                if (!opponentGroup || oppHealth <= 15 || opponentInvisible || oppHealth <= 0) {
                    beesAngryAt = null;
                }
            }
            
            bees.forEach(b => {
                if (b.hp <= 0) {
                    if (b.mesh.position.y > getTerrainHeight(b.mesh.position.x, b.mesh.position.z)) {
                        b.mesh.position.y -= 5 * delta;
                        b.mesh.rotation.x = Math.PI; // Upside down
                    }
                    return;
                }
                
                // Wing flapping
                if (b.mesh.children[1] && b.mesh.children[2]) {
                    b.mesh.children[1].rotation.z = Math.sin(now * 0.08) * 0.6;
                    b.mesh.children[2].rotation.z = -Math.sin(now * 0.08) * 0.6;
                }
                
                let targetPos = new THREE.Vector3();
                let speed = 4.0;
                
                if (beesAngryAt) {
                    let tx, ty, tz;
                    if (beesAngryAt === 'host') {
                        tx = camera.position.x;
                        ty = camera.position.y - 0.5;
                        tz = camera.position.z;
                    } else if (opponentGroup) {
                        tx = opponentGroup.position.x;
                        ty = opponentGroup.position.y + 1.2;
                        tz = opponentGroup.position.z;
                    } else {
                        beesAngryAt = null;
                        return;
                    }
                    targetPos.set(tx, ty, tz);
                    speed = 6.0;
                    
                    b.mesh.lookAt(targetPos);
                    const dir = new THREE.Vector3().subVectors(targetPos, b.pos).normalize();
                    b.pos.addScaledVector(dir, speed * delta);
                    b.mesh.position.copy(b.pos);
                    
                    const dist = b.pos.distanceTo(targetPos);
                    if (dist < 1.2 && (!b.lastAttackTime || now - b.lastAttackTime > 1200)) {
                        b.lastAttackTime = now;
                        if (beesAngryAt === 'host') {
                            takeDamage(4, dir.x * 2.0, dir.z * 2.0, "Stung to death by Bees!");
                        } else {
                            sendNetworkMessage({
                                type: 'bee-hit',
                                damage: 4,
                                kx: dir.x * 2.0,
                                kz: dir.z * 2.0
                            });
                        }
                    }
                } else {
                    if (b.state === 'wander') {
                        if (Math.random() < 0.02 && cherryFlowers.length > 0) {
                            const f = cherryFlowers[Math.floor(Math.random() * cherryFlowers.length)];
                            b.targetFlower = f;
                            b.state = 'collect';
                        } else {
                            if (!b.wanderTarget || b.pos.distanceTo(b.wanderTarget) < 1.0) {
                                b.wanderTarget = new THREE.Vector3(
                                    b.home.x + (Math.random() - 0.5) * 8,
                                    b.home.y + (Math.random() - 0.5) * 4,
                                    b.home.z + (Math.random() - 0.5) * 8
                                );
                            }
                            targetPos.copy(b.wanderTarget);
                            
                            b.mesh.lookAt(targetPos);
                            const dir = new THREE.Vector3().subVectors(targetPos, b.pos).normalize();
                            b.pos.addScaledVector(dir, 2.5 * delta);
                            b.mesh.position.copy(b.pos);
                        }
                    } else if (b.state === 'collect') {
                        if (!b.targetFlower) {
                            b.state = 'wander';
                        } else {
                            targetPos.copy(b.targetFlower);
                            b.mesh.lookAt(targetPos);
                            
                            const dist = b.pos.distanceTo(targetPos);
                            if (dist < 0.5) {
                                b.collectTimer += delta;
                                b.pos.y = targetPos.y + 0.2 + Math.sin(now * 0.01) * 0.1;
                                b.mesh.position.copy(b.pos);
                                
                                if (b.collectTimer >= 2.5) {
                                    b.nectar = 1.0;
                                    b.collectTimer = 0;
                                    b.state = 'return';
                                }
                            } else {
                                const dir = new THREE.Vector3().subVectors(targetPos, b.pos).normalize();
                                b.pos.addScaledVector(dir, speed * delta);
                                b.mesh.position.copy(b.pos);
                            }
                        }
                    } else if (b.state === 'return') {
                        targetPos.copy(b.home);
                        b.mesh.lookAt(targetPos);
                        
                        const dist = b.pos.distanceTo(targetPos);
                        if (dist < 0.5) {
                            b.nectar = 0;
                            b.state = 'wander';
                        } else {
                            const dir = new THREE.Vector3().subVectors(targetPos, b.pos).normalize();
                            b.pos.addScaledVector(dir, speed * delta);
                            b.mesh.position.copy(b.pos);
                        }
                    }
                }
            });
            
            if (now - lastBeeSyncTime > 66) {
                const syncData = bees.map(b => ({
                    id: b.id,
                    x: b.pos.x,
                    y: b.pos.y,
                    z: b.pos.z,
                    ry: b.mesh.rotation.y,
                    hp: b.hp
                }));
                sendNetworkMessage({
                    type: 'bees-sync',
                    bees: syncData
                });
                lastBeeSyncTime = now;
            }
        }

        function updateVillagers(delta) {
            const now = Date.now();
            villagers.forEach(v => {
                if (v.isDead) {
                    if (v.deathTime === undefined) v.deathTime = 0;
                    v.deathTime += delta;
                    const slumpProgress = Math.min(1.0, v.deathTime / 0.8);
                    v.mesh.rotation.x = slumpProgress * (-Math.PI / 2);
                    v.mesh.position.y = getTerrainHeight(v.mesh.position.x, v.mesh.position.z) + 0.15 * (1 - slumpProgress);
                    return;
                }
                
                // Apply knockback velocities
                if (v.kx || v.kz) {
                    v.mesh.position.x += v.kx * delta;
                    v.mesh.position.z += v.kz * delta;
                    v.mesh.position.y = getTerrainHeight(v.mesh.position.x, v.mesh.position.z);
                    
                    v.kx -= v.kx * 4.5 * delta;
                    v.kz -= v.kz * 4.5 * delta;
                    if (Math.abs(v.kx) < 0.05) v.kx = 0;
                    if (Math.abs(v.kz) < 0.05) v.kz = 0;
                }
                
                if (v.waitTime > 0) {
                    v.waitTime -= delta;
                    v.mesh.children[0].position.y = 1.0 + Math.sin(now * 0.003) * 0.02;
                    return;
                }
                
                const dx = v.targetX - v.mesh.position.x;
                const dz = v.targetZ - v.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 0.6) {
                    v.waitTime = 1.5 + Math.random() * 3.5;
                    const villageCenter = { x: -78, z: -78 };
                    v.targetX = villageCenter.x + (Math.random() - 0.5) * 35;
                    v.targetZ = villageCenter.z + (Math.random() - 0.5) * 35;
                } else {
                    const vx = (dx / dist) * v.speed;
                    const vz = (dz / dist) * v.speed;
                    v.mesh.position.x += vx * delta;
                    v.mesh.position.z += vz * delta;
                    v.mesh.position.y = getTerrainHeight(v.mesh.position.x, v.mesh.position.z);
                    
                    const angle = Math.atan2(dx, dz);
                    v.mesh.rotation.y = angle;
                    
                    const walkSpeed = 9;
                    v.mesh.children[2].rotation.x = Math.sin(now * 0.01 * walkSpeed) * 0.4;
                    v.mesh.children[3].rotation.x = -Math.sin(now * 0.01 * walkSpeed) * 0.4;
                }
            });
        }

        function flashVillagerRed(mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material && node.material.color) {
                    if (node.userData.originalColor === undefined) {
                        node.userData.originalColor = node.material.color.getHex();
                        node.material = node.material.clone();
                    }
                    node.material.color.setHex(0xff0000);
                }
            });
            setTimeout(() => {
                mesh.traverse((node) => {
                    if (node.isMesh && node.material && node.material.color && node.userData.originalColor !== undefined) {
                        node.material.color.setHex(node.userData.originalColor);
                    }
                });
            }, 150);
        }

        function clearAnimals() {
            animals.forEach(a => {
                scene.remove(a.mesh);
            });
            animals.length = 0;
        }

        function clearDroppedFoods() {
            droppedFoods.forEach(df => {
                scene.remove(df.mesh);
            });
            droppedFoods.length = 0;
        }

        function spawnInitialAnimals() {
            clearAnimals();
            
            const spawnConfigs = [
                { type: 'pig', health: 25, count: 6 },
                { type: 'cow', health: 40, count: 6 },
                { type: 'sheep', health: 20, count: 6 },
                { type: 'chicken', health: 15, count: 7 }
            ];

            const zones = [
                { cx: 60, cz: 20, r: 40 },      // Plains
                { cx: -78, cz: -78, r: 25 },    // Village (Savanna)
                { cx: -50, cz: 50, r: 35 }      // Forest
            ];

            spawnConfigs.forEach(config => {
                for (let c = 0; c < config.count; c++) {
                    const zone = zones[Math.floor(Math.random() * zones.length)];
                    const ax = zone.cx + (Math.random() - 0.5) * zone.r * 2;
                    const az = zone.cz + (Math.random() - 0.5) * zone.r * 2;
                    const ay = getTerrainHeight(ax, az);
                    
                    if (ay < -10) continue; // Don't spawn in water/abyss
                    
                    let mesh;
                    if (config.type === 'pig') mesh = createPigMesh();
                    else if (config.type === 'cow') mesh = createCowMesh();
                    else if (config.type === 'sheep') mesh = createSheepMesh();
                    else if (config.type === 'chicken') mesh = createChickenMesh();
                    
                    mesh.position.set(ax, ay, az);
                    scene.add(mesh);
                    
                    animals.push({
                        id: Math.random().toString(36).substr(2, 6),
                        type: config.type,
                        mesh: mesh,
                        x: ax,
                        y: ay,
                        z: az,
                        spawnX: ax,
                        spawnZ: az,
                        targetX: ax + (Math.random() - 0.5) * 15,
                        targetZ: az + (Math.random() - 0.5) * 15,
                        waitTime: Math.random() * 4.0,
                        speed: 0.8 + Math.random() * 0.4,
                        health: config.health,
                        maxHealth: config.health,
                        isDead: false,
                        deathTime: 0,
                        kx: 0,
                        kz: 0
                    });
                }
            });
        }

        function updateAnimals(delta) {
            const now = Date.now();
            for (let i = animals.length - 1; i >= 0; i--) {
                const a = animals[i];
                if (a.isDead) {
                    if (a.deathTime === undefined) a.deathTime = 0;
                    a.deathTime += delta;
                    const slumpProgress = Math.min(1.0, a.deathTime / 0.8);
                    a.mesh.rotation.x = slumpProgress * (-Math.PI / 2);
                    a.mesh.position.y = getTerrainHeight(a.mesh.position.x, a.mesh.position.z) + 0.1 * (1 - slumpProgress);
                    
                    if (a.deathTime >= 1.5) {
                        scene.remove(a.mesh);
                        animals.splice(i, 1);
                    }
                    continue;
                }
                
                // Apply knockback velocities
                if (a.kx || a.kz) {
                    a.mesh.position.x += a.kx * delta;
                    a.mesh.position.z += a.kz * delta;
                    a.mesh.position.y = getTerrainHeight(a.mesh.position.x, a.mesh.position.z);
                    
                    a.kx -= a.kx * 4.5 * delta;
                    a.kz -= a.kz * 4.5 * delta;
                    if (Math.abs(a.kx) < 0.05) a.kx = 0;
                    if (Math.abs(a.kz) < 0.05) a.kz = 0;
                }
                
                if (a.waitTime > 0) {
                    a.waitTime -= delta;
                    if (a.mesh.userData.head) {
                        a.mesh.userData.head.rotation.x = Math.sin(now * 0.002) * 0.08;
                    }
                    continue;
                }
                
                const dx = a.targetX - a.mesh.position.x;
                const dz = a.targetZ - a.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist < 0.6) {
                    a.waitTime = 2.0 + Math.random() * 5.0;
                    a.targetX = a.mesh.position.x + (Math.random() - 0.5) * 30;
                    a.targetZ = a.mesh.position.z + (Math.random() - 0.5) * 30;
                    
                    const targetHeight = getTerrainHeight(a.targetX, a.targetZ);
                    if (targetHeight < -10) {
                        a.targetX = a.spawnX;
                        a.targetZ = a.spawnZ;
                    }
                } else {
                    const vx = (dx / dist) * a.speed;
                    const vz = (dz / dist) * a.speed;
                    a.mesh.position.x += vx * delta;
                    a.mesh.position.z += vz * delta;
                    a.mesh.position.y = getTerrainHeight(a.mesh.position.x, a.mesh.position.z);
                    
                    const angle = Math.atan2(dx, dz);
                    a.mesh.rotation.y = angle;
                    
                    const walkSpeed = 10;
                    const legAngle = Math.sin(now * 0.01 * walkSpeed) * 0.5;
                    if (a.mesh.userData.legFL) a.mesh.userData.legFL.rotation.x = legAngle;
                    if (a.mesh.userData.legFR) a.mesh.userData.legFR.rotation.x = -legAngle;
                    if (a.mesh.userData.legBL) a.mesh.userData.legBL.rotation.x = -legAngle;
                    if (a.mesh.userData.legBR) a.mesh.userData.legBR.rotation.x = legAngle;
                }
            }
        }

        function addFoodToInventory(type) {
            for (let i = 3; i < 9; i++) {
                if (hotbarItems[i] === type && hotbarCounts[i] < 64) {
                    hotbarCounts[i]++;
                    return true;
                }
            }
            
            for (let i = 0; i < 27; i++) {
                if (inventoryItems[i] === type && inventoryCounts[i] < 64) {
                    inventoryCounts[i]++;
                    return true;
                }
            }
            
            for (let i = 3; i < 9; i++) {
                if (hotbarItems[i] === null) {
                    hotbarItems[i] = type;
                    hotbarCounts[i] = 1;
                    return true;
                }
            }
            
            for (let i = 0; i < 27; i++) {
                if (inventoryItems[i] === null) {
                    inventoryItems[i] = type;
                    inventoryCounts[i] = 1;
                    return true;
                }
            }
            
            return false;
        }

        function updateDroppedFoods(delta) {
            const now = Date.now();
            const playerPos = new THREE.Vector3(camera.position.x, camera.position.y - 1.0, camera.position.z);
            
            for (let i = droppedFoods.length - 1; i >= 0; i--) {
                const df = droppedFoods[i];
                df.mesh.rotation.y += 1.5 * delta;
                df.mesh.position.y = getTerrainHeight(df.pos.x, df.pos.z) + 0.4 + Math.sin(now * 0.005) * 0.12;
                
                const dist = playerPos.distanceTo(df.pos);
                if (dist < 1.8) {
                    const success = addFoodToInventory(df.type);
                    if (success) {
                        AudioSynth.playPickup();
                        scene.remove(df.mesh);
                        droppedFoods.splice(i, 1);
                        updateHotbarUI();
                        updateInventoryUI();
                    }
                }
            }
        }

        function spawnFireParticles(position, count = 1) {
            for (let i = 0; i < count; i++) {
                const size = 0.08 + Math.random() * 0.12;
                const geo = new THREE.BoxGeometry(size, size, size);
                const mat = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.4 ? 0xff4500 : 0xffaa00,
                    transparent: true,
                    opacity: 0.85,
                    toneMapped: false
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.copy(position);
                mesh.position.x += (Math.random() - 0.5) * 0.7;
                mesh.position.y += Math.random() * 1.4;
                mesh.position.z += (Math.random() - 0.5) * 0.7;
                
                scene.add(mesh);
                
                fireParticles.push({
                    mesh: mesh,
                    mat: mat,
                    velY: 1.2 + Math.random() * 1.2,
                    velX: (Math.random() - 0.5) * 0.3,
                    velZ: (Math.random() - 0.5) * 0.3,
                    life: 0.5 + Math.random() * 0.4
                });
            }
        }

        function updateFireParticles(delta) {
            for (let i = fireParticles.length - 1; i >= 0; i--) {
                const p = fireParticles[i];
                p.life -= delta;
                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    fireParticles.splice(i, 1);
                } else {
                    p.mesh.position.y += p.velY * delta;
                    p.mesh.position.x += p.velX * delta;
                    p.mesh.position.z += p.velZ * delta;
                    p.mesh.scale.multiplyScalar(1 - delta * 1.5);
                    p.mat.opacity = (p.life / 0.9);
                }
            }
        }

        let localPlayerWasBurning = false;
        let lastHealthSyncTime = 0;
        function updatePlayerBurning(delta) {
            const elFireVignette = document.getElementById('fire-vignette');
            
            if (myBurnTime > 0 && myHealth > 0) {
                myBurnTime -= delta;
                myHealth = Math.max(0, myHealth - 2.0 * delta);
                updateHud();
                
                if (elFireVignette) {
                    elFireVignette.style.display = 'block';
                }
                
                // Spawn fire particles visible to local first-person camera
                const lookDir = new THREE.Vector3();
                camera.getWorldDirection(lookDir);
                const firePos = camera.position.clone()
                    .addScaledVector(lookDir, 1.2)
                    .add(new THREE.Vector3(0, -0.6, 0));
                spawnFireParticles(firePos, 1);
                
                // Sync health to peer at 10Hz
                const now = Date.now();
                if (now - lastHealthSyncTime > 100) {
                    sendNetworkMessage({
                        type: 'health-sync',
                        health: myHealth
                    });
                    lastHealthSyncTime = now;
                }

                if (!localPlayerWasBurning) {
                    localPlayerWasBurning = true;
                    sendNetworkMessage({ type: 'fire-state', burning: true });
                }
                
                if (myHealth <= 0) {
                    declareLoser("Killed by Fire!");
                    myBurnTime = 0;
                    localPlayerWasBurning = false;
                    if (elFireVignette) elFireVignette.style.display = 'none';
                    sendNetworkMessage({ type: 'fire-state', burning: false });
                    sendNetworkMessage({
                        type: 'health-sync',
                        health: 0
                    });
                }
            } else {
                if (elFireVignette) {
                    elFireVignette.style.display = 'none';
                }
                if (localPlayerWasBurning) {
                    localPlayerWasBurning = false;
                    sendNetworkMessage({ type: 'fire-state', burning: false });
                }
            }
        }

        // Add playBoom audio synth
        AudioSynth.playBoom = function(pos) {
            this.init();
            const now = this.ctx.currentTime;
            const vol = this.getSpatialVolume(pos, 85);
            if (vol <= 0.01) return;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 0.45);
            
            gain.gain.setValueAtTime(0.5 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(now + 0.5);
            
            const bufferSize = this.ctx.sampleRate * 0.4;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 180;
            
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4 * vol, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            
            noise.start();
            noise.stop(now + 0.45);
        };

        AudioSynth.playHiss = function(pos) {
            this.init();
            const now = this.ctx.currentTime;
            const vol = this.getSpatialVolume(pos, 60);
            if (vol <= 0.01) return;
            
            const bufferSize = this.ctx.sampleRate * 2.0;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                const time = i / this.ctx.sampleRate;
                const sizzle = 0.7 + 0.3 * Math.sin(time * 2 * Math.PI * 60); // 60Hz pulse
                const decay = Math.max(0, 1.0 - time / 2.0);
                data[i] = (Math.random() * 2 - 1) * sizzle * decay;
            }
            
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.2 * vol, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 1.95);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            
            noise.start();
            noise.stop(now + 2.0);
        };

    Object.assign(window, {
        toggleInventoryOverlay,
        onInventorySlotClick,
        selectHotbarSlot,
    });

    initPeer();

    return () => {
        delete window.toggleInventoryOverlay;
        delete window.onInventorySlotClick;
        delete window.selectHotbarSlot;
    };
}
