// @ts-nocheck
import * as ThreeLib from 'three';

type Cleanup = () => void;

export function initNeonBruiser(): Cleanup {
    const THREE = ThreeLib;


    function safeGetItem(key: string, defaultValue: string = ''): string {
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (e) {
            console.error("Failed to get item from localStorage:", e);
            return defaultValue;
        }
    }

    function safeSetItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error("Failed to set item in localStorage:", e);
        }
    }

    function getSavedWorlds() {
        try {
            const item = localStorage.getItem('survivalism_saves');
            const parsed = JSON.parse(item || '[]');
            if (Array.isArray(parsed)) {
                return parsed.filter(s => s && typeof s === 'object' && s.id);
            }
            return [];
        } catch (e) {
            console.error("Failed to parse saved worlds from localStorage:", e);
            return [];
        }
    }

    function saveWorldsList(saves: any[]) {
        try {
            localStorage.setItem('survivalism_saves', JSON.stringify(saves));
        } catch (e) {
            console.error("Failed to save worlds to localStorage:", e);
        }
    }

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
            playBounce(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 60);
                if (vol <= 0.01) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(360, now + 0.18);
                
                gain.gain.setValueAtTime(0.3 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(now + 0.19);
            },
            playBreak(pos) {
                this.init();
                const now = this.ctx.currentTime;
                const vol = this.getSpatialVolume(pos, 65);
                if (vol <= 0.01) return;
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.25);
                gain.gain.setValueAtTime(0.35 * vol, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.26);

                const bufferSize = this.ctx.sampleRate * 0.3;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 180;
                const noiseGain = this.ctx.createGain();
                noiseGain.gain.setValueAtTime(0.4 * vol, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);
                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(this.ctx.destination);
                noise.start();
                noise.stop(now + 0.21);
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
                } else if (type === 'horse') {
                    const osc = this.ctx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(380, now);
                    osc.frequency.exponentialRampToValueAtTime(140, now + 0.4);
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.value = 650;
                    gain.gain.setValueAtTime(0.08 * vol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(now + 0.42);
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

        // Death Screen DOM Elements
        const elDeathScreen = document.getElementById('death-screen');
        const elDeathScreenSubtitle = document.getElementById('death-screen-subtitle');
        const btnRespawnBed = document.getElementById('btn-respawn-bed');
        const btnRespawnSpawn = document.getElementById('btn-respawn-spawn');
        const respawnBedStatus = document.getElementById('respawn-bed-status');


        // --- CHARACTER CUSTOMIZATION PREVIEW & UI LOGIC ---
        let previewScene, previewCamera, previewRenderer, previewMeshGroup, previewAnimationId;
        let previewSkinMat, previewHairMat, previewEyeMat, previewShirtMat, previewPantsMat;

        const elBtnCustomizePlayer = document.getElementById('btn-customize-player');
        const elCustomizeScreen = document.getElementById('customize-screen');
        const elBtnSaveCustomize = document.getElementById('btn-save-customize');

        elBtnCustomizePlayer.addEventListener('click', () => {
            elLobby.style.display = 'none';
            elCustomizeScreen.style.display = 'flex';
            const customizeNameInput = document.getElementById('customize-name-input');
            if (customizeNameInput) {
                customizeNameInput.value = myAppearance.name || 'player';
            }
            updateActiveSwatchesInUI();
            initCustomizePreview();
        });

        elBtnSaveCustomize.addEventListener('click', () => {
            const customizeNameInput = document.getElementById('customize-name-input');
            if (customizeNameInput) {
                const newName = customizeNameInput.value.trim() || 'player';
                myAppearance.name = newName;
                safeSetItem('appearance_name', newName);
                const startNameInput = document.getElementById('player-name-input');
                if (startNameInput) startNameInput.value = newName;
            }
            stopCustomizePreview();
            elCustomizeScreen.style.display = 'none';
            elLobby.style.display = 'flex';
            createPlayerMesh();
        });

        // Survivalism Screens and Event Listeners
        const btnEnterGame = document.getElementById('btn-enter-game');
        if (btnEnterGame) {
            btnEnterGame.addEventListener('click', () => {
                const nameInput = document.getElementById('player-name-input');
                if (nameInput) {
                    const newName = nameInput.value.trim() || 'player';
                    myAppearance.name = newName;
                    safeSetItem('appearance_name', newName);
                }
                const startScreen = document.getElementById('start-screen');
                if (startScreen) startScreen.style.display = 'none';
                if (elLobby) elLobby.style.display = 'flex';
                renderSavesList();
            });
        }

        const btnShowNewGame = document.getElementById('btn-show-new-game');
        const btnCancelNewGame = document.getElementById('btn-cancel-new-game');
        const btnStartNewGame = document.getElementById('btn-start-new-game');
        const btnNewModeSurvival = document.getElementById('btn-mode-survival');
        const btnNewModeFreedom = document.getElementById('btn-mode-freedom');
        const btnNewCheatsDisabled = document.getElementById('btn-cheats-disabled');
        const btnNewCheatsEnabled = document.getElementById('btn-cheats-enabled');
        const btnPhysicsNormal = document.getElementById('btn-physics-normal');
        const btnPhysicsMoon = document.getElementById('btn-physics-moon');
        const btnPhysicsBouncy = document.getElementById('btn-physics-bouncy');

        if (btnShowNewGame) {
            btnShowNewGame.addEventListener('click', () => {
                if (elLobby) elLobby.style.display = 'none';
                const newGameScreen = document.getElementById('new-game-settings-screen');
                if (newGameScreen) newGameScreen.style.display = 'flex';
                
                // Initialize default fields on settings screen
                const nameInput = document.getElementById('setting-world-name');
                if (nameInput) nameInput.value = 'New World';
                
                currentGameMode = 'survival';
                cheatsEnabled = false;
                physicsMode = 'normal';
                updateModeButtonsUI();
                updateCheatsUIState();
                updatePhysicsUIState();
            });
        }

        if (btnCancelNewGame) {
            btnCancelNewGame.addEventListener('click', () => {
                const newGameScreen = document.getElementById('new-game-settings-screen');
                if (newGameScreen) newGameScreen.style.display = 'none';
                if (elLobby) elLobby.style.display = 'flex';
                renderSavesList();
            });
        }

        if (btnStartNewGame) {
            btnStartNewGame.addEventListener('click', () => {
                startNewWorld();
            });
        }

        if (btnNewModeSurvival) {
            btnNewModeSurvival.addEventListener('click', () => {
                currentGameMode = 'survival';
                updateModeButtonsUI();
            });
        }

        if (btnNewModeFreedom) {
            btnNewModeFreedom.addEventListener('click', () => {
                currentGameMode = 'freedom';
                updateModeButtonsUI();
            });
        }

        if (btnNewCheatsDisabled) {
            btnNewCheatsDisabled.addEventListener('click', () => {
                cheatsEnabled = false;
                updateCheatsUIState();
            });
        }

        if (btnNewCheatsEnabled) {
            btnNewCheatsEnabled.addEventListener('click', () => {
                cheatsEnabled = true;
                updateCheatsUIState();
            });
        }

        if (btnPhysicsNormal) {
            btnPhysicsNormal.addEventListener('click', () => {
                physicsMode = 'normal';
                updatePhysicsUIState();
            });
        }

        if (btnPhysicsMoon) {
            btnPhysicsMoon.addEventListener('click', () => {
                physicsMode = 'moon';
                updatePhysicsUIState();
            });
        }

        if (btnPhysicsBouncy) {
            btnPhysicsBouncy.addEventListener('click', () => {
                physicsMode = 'bouncy';
                updatePhysicsUIState();
            });
        }

        // Pause Menu Listeners
        const btnResumeGame = document.getElementById('btn-resume-game');
        if (btnResumeGame) {
            btnResumeGame.addEventListener('click', () => {
                requestPointerLock();
                const pauseMenu = document.getElementById('pause-menu');
                if (pauseMenu) pauseMenu.style.display = 'none';
            });
        }

        const btnPauseSettings = document.getElementById('btn-pause-settings');
        if (btnPauseSettings) {
            btnPauseSettings.addEventListener('click', () => {
                const pauseMenu = document.getElementById('pause-menu');
                if (pauseMenu) pauseMenu.style.display = 'none';
                const ingameSettings = document.getElementById('in-game-settings-screen');
                if (ingameSettings) ingameSettings.style.display = 'flex';
                
                // Sync UI controls with current settings
                updateCheatsUIState();
                updatePhysicsUIState();
            });
        }

        const btnSaveQuit = document.getElementById('btn-save-quit');
        if (btnSaveQuit) {
            btnSaveQuit.addEventListener('click', () => {
                saveWorld();
                gameActive = false;
                exitPointerLock();
                
                const pauseMenu = document.getElementById('pause-menu');
                if (pauseMenu) pauseMenu.style.display = 'none';
                
                if (elHud) elHud.style.display = 'none';
                if (elCrosshair) elCrosshair.style.display = 'none';
                if (elLobby) elLobby.style.display = 'flex';
                
                resetGameScene();
                renderSavesList();
            });
        }

        // Respawn Player Helper
        function respawnPlayer(atBed) {
            myHealth = 100;
            hunger = 100;
            myBurnTime = 0;
            updateHud();

            let respawnedAtBed = false;
            if (atBed) {
                let targetBed = null;
                // 1. Try to find the bed at the current respawnPoint
                if (respawnPoint) {
                    targetBed = placedObjects.find(obj => 
                        obj.type === 'bed' &&
                        Math.abs(obj.pos.x - respawnPoint.x) < 1.5 &&
                        Math.abs(obj.pos.z - respawnPoint.z) < 1.5 &&
                        isDimensionCave(obj.inCave) === isDimensionCave(respawnPoint.inCave)
                    );
                }
                // 2. If no valid bed found at respawnPoint, find ANY bed in placedObjects
                if (!targetBed) {
                    const beds = placedObjects.filter(obj => obj.type === 'bed');
                    if (beds.length > 0) {
                        targetBed = beds[beds.length - 1]; // get the most recently placed bed
                        respawnPoint = {
                            x: targetBed.pos.x,
                            y: targetBed.pos.y,
                            z: targetBed.pos.z,
                            inCave: isDimensionCave(targetBed.inCave)
                        };
                    }
                }

                if (targetBed) {
                    playerInCave = isDimensionCave(targetBed.inCave);
                    camera.position.set(targetBed.pos.x, targetBed.pos.y + 0.45 + 1.6, targetBed.pos.z);
                    respawnedAtBed = true;
                } else {
                    addChatMessage("Your home bed was missing or obstructed", "system");
                    respawnPoint = null;
                }
            }

            if (!respawnedAtBed) {
                playerInCave = false;
                const spawnZ = isHost ? 12 : 28;
                const spawnY = getTerrainHeight(60, spawnZ, false) + 1.6;
                camera.position.set(60, spawnY, spawnZ);
            }

            updateChunks();

            velocity.set(0, 0, 0);
            knockbackVel.set(0, 0, 0);
            isGrounded = true;

            if (elDeathScreen) {
                elDeathScreen.style.display = 'none';
            }

            syncPlayerPosition();
            requestPointerLock();
            saveWorld(false);
        }

        if (btnRespawnBed) {
            btnRespawnBed.addEventListener('click', () => {
                respawnPlayer(true);
            });
        }
        if (btnRespawnSpawn) {
            btnRespawnSpawn.addEventListener('click', () => {
                respawnPlayer(false);
            });
        }



        const btnInGameCheatsDisabled = document.getElementById('btn-ingame-cheats-disabled');
        const btnInGameCheatsEnabled = document.getElementById('btn-ingame-cheats-enabled');
        if (btnInGameCheatsDisabled) {
            btnInGameCheatsDisabled.addEventListener('click', () => {
                cheatsEnabled = false;
                updateCheatsUIState();
            });
        }
        if (btnInGameCheatsEnabled) {
            btnInGameCheatsEnabled.addEventListener('click', () => {
                cheatsEnabled = true;
                updateCheatsUIState();
            });
        }

        const btnInGamePhysicsNormal = document.getElementById('btn-ingame-physics-normal');
        const btnInGamePhysicsMoon = document.getElementById('btn-ingame-physics-moon');
        const btnInGamePhysicsBouncy = document.getElementById('btn-ingame-physics-bouncy');
        if (btnInGamePhysicsNormal) {
            btnInGamePhysicsNormal.addEventListener('click', () => {
                physicsMode = 'normal';
                updatePhysicsUIState();
            });
        }
        if (btnInGamePhysicsMoon) {
            btnInGamePhysicsMoon.addEventListener('click', () => {
                physicsMode = 'moon';
                updatePhysicsUIState();
            });
        }
        if (btnInGamePhysicsBouncy) {
            btnInGamePhysicsBouncy.addEventListener('click', () => {
                physicsMode = 'bouncy';
                updatePhysicsUIState();
            });
        }

        const btnCloseInGameSettings = document.getElementById('btn-close-ingame-settings');
        if (btnCloseInGameSettings) {
            btnCloseInGameSettings.addEventListener('click', () => {
                const ingameSettings = document.getElementById('in-game-settings-screen');
                if (ingameSettings) ingameSettings.style.display = 'none';
                const pauseMenu = document.getElementById('pause-menu');
                if (pauseMenu) pauseMenu.style.display = 'flex';
            });
        }

        function updateModeButtonsUI() {
            const btnSurvival = document.getElementById('btn-mode-survival');
            const btnFreedom = document.getElementById('btn-mode-freedom');
            if (btnSurvival && btnFreedom) {
                if (currentGameMode === 'survival') {
                    btnSurvival.classList.add('active');
                    btnSurvival.style.borderColor = 'var(--cyan)';
                    btnSurvival.style.background = 'rgba(0, 240, 255, 0.1)';
                    btnSurvival.style.color = 'var(--cyan)';
                    
                    btnFreedom.classList.remove('active');
                    btnFreedom.style.borderColor = 'rgba(255,255,255,0.1)';
                    btnFreedom.style.background = 'rgba(255,255,255,0.02)';
                    btnFreedom.style.color = '#8a90a0';
                } else {
                    btnFreedom.classList.add('active');
                    btnFreedom.style.borderColor = 'var(--cyan)';
                    btnFreedom.style.background = 'rgba(0, 240, 255, 0.1)';
                    btnFreedom.style.color = 'var(--cyan)';
                    
                    btnSurvival.classList.remove('active');
                    btnSurvival.style.borderColor = 'rgba(255,255,255,0.1)';
                    btnSurvival.style.background = 'rgba(255,255,255,0.02)';
                    btnSurvival.style.color = '#8a90a0';
                }
            }
        }

        function startNewWorld() {
            activeWorldId = 'world_' + Date.now();
            
            const nameInput = document.getElementById('setting-world-name');
            currentWorldName = nameInput ? nameInput.value.trim() || 'New World' : 'New World';
            
            cameraView = 'first';
            
            minedStoneCoords = new Set();
            choppedTreeCoords = new Set();
            minedCoralCoords = new Set();
            minedDesertHoles = new Set();
            
            // Hide menu overlays
            const newGameScreen = document.getElementById('new-game-settings-screen');
            if (newGameScreen) newGameScreen.style.display = 'none';
            if (elLobby) elLobby.style.display = 'none';
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.style.display = 'none';
            
            isHost = true;
            isConnected = false;
            
            if (!scene) {
                startGame();
            } else {
                resetGameScene();
                
                // Reset spawn position in Plains
                const spawnZ = 20;
                const spawnY = getTerrainHeight(60, spawnZ) + 1.6;
                camera.position.set(60, spawnY, spawnZ);
                highestYSinceGrounded = camera.position.y;
                camera.rotation.set(0, 0, 0);
                
                // Show HUD
                if (elHud) elHud.style.display = 'flex';
                gameActive = true;
                
                updateCheatsUIState();
                updateHud();
                updateHotbarUI();
                updateInventoryUI();
                updateMinecraftStatsUI();
                updateWeaponUI();
                
                document.activeElement.blur();
                window.focus();
                
                updateChunks();
                requestPointerLock();
            }
        }

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

            // Dedicated Tropical Reef fish spawning
            for (let c = 0; c < 35; c++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 70;
                const ax = 0 + Math.cos(angle) * dist;
                const az = -480 + Math.sin(angle) * dist;
                const ay = getTerrainHeight(ax, az);
                
                if (ay <= WATER_Y) {
                    const fishY = ay + (WATER_Y - ay) * (0.2 + Math.random() * 0.6);
                    const mesh = createFishMesh();
                    mesh.position.set(ax, fishY, az);
                    scene.add(mesh);
                    
                    animals.push({
                        id: Math.random().toString(36).substr(2, 6),
                        type: 'fish',
                        mesh: mesh,
                        x: ax,
                        y: fishY,
                        z: az,
                        spawnX: ax,
                        spawnZ: az,
                        targetX: ax + (Math.random() - 0.5) * 25,
                        targetZ: az + (Math.random() - 0.5) * 25,
                        waitTime: Math.random() * 2.0,
                        speed: 1.2 + Math.random() * 0.8,
                        health: 15,
                        maxHealth: 15,
                        isDead: false,
                        deathTime: 0,
                        kx: 0,
                        kz: 0
                    });
                }
            }
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
                
                safeSetItem('appearance_' + cat, color);
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

        const FIVE_LETTER_WORDS = [
            'APPLE', 'BEAST', 'CABIN', 'DREAM', 'EARTH', 'FLAME', 'GIANT', 'HOUSE', 'LIGHT', 'NIGHT',
            'OCEAN', 'PLANT', 'RIVER', 'STONE', 'WATER', 'WORLD', 'SPACE', 'STORM', 'CLOUD', 'CRAFT',
            'TIGER', 'MAGIC', 'SHINE', 'SMILE', 'PIXEL', 'VOXEL', 'BLOCK', 'BRICK', 'CANDY', 'DANCE',
            'FLUTE', 'GRASS', 'HAPPY', 'GREEN', 'LEMON', 'MANGO', 'PEACH', 'SWEET', 'SHARK', 'TRAIN',
            'GHOST', 'PANDA', 'RIDER', 'SCOUT', 'STAGE', 'SHIELD', 'SWORD', 'STARS', 'HEART', 'ARROW'
        ];

        function generateFiveLetterWord() {
            return FIVE_LETTER_WORDS[Math.floor(Math.random() * FIVE_LETTER_WORDS.length)];
        }

        function generateShortId() {
            return generateFiveLetterWord() + '-' + Math.floor(1000 + Math.random() * 9000);
        }

        // Initializing PeerJS
        let reconnectInterval = null;
        let PeerClass = null;
        async function initPeer(forcedId = null, attempt = 0) {
            if (reconnectInterval) clearInterval(reconnectInterval);

            // If we have a peer with a different ID, destroy it first
            if (peer) {
                if (forcedId && peerId === forcedId) {
                    return; // Already using this ID
                }
                try {
                    peer.destroy();
                } catch (e) {
                    console.error("Error destroying peer:", e);
                }
                peer = null;
                peerId = null;
            }

            if (!PeerClass) {
                try {
                    const peerModule = await import('peerjs');
                    PeerClass = peerModule.Peer || peerModule.default || peerModule;
                } catch (err) {
                    console.error("Failed to dynamically import PeerJS:", err);
                    if (elStatus) elStatus.innerText = "Multiplayer error: PeerJS failed to load.";
                    return;
                }
            }

            if (!PeerClass || typeof PeerClass !== 'function') {
                console.error("PeerJS constructor not found! P2P multiplayer will be disabled.", PeerClass);
                if (elStatus) elStatus.innerText = "Multiplayer error: PeerJS failed to load.";
                return;
            }

            const shortId = forcedId || generateShortId();
            try {
                peer = new PeerClass(shortId, { debug: 2 });
            } catch (err) {
                console.error("Failed to initialize PeerJS:", err);
                if (elStatus) elStatus.innerText = "Failed to initialize PeerJS.";
                return;
            }

            if (!peer) return;

            peer.on('open', (id) => {
                peerId = id;
                if (elPeerIdDisplay) elPeerIdDisplay.value = id;
                if (elCopyBtn) elCopyBtn.disabled = false;
                if (elStatus) elStatus.innerText = "Connected to network. Share ID to start game.";
                if (elBtnHost) {
                    elBtnHost.innerText = "Host Game (Room Ready)";
                    elBtnHost.disabled = false;
                }
                
                const urlParams = new URLSearchParams(window.location.search);
                const joinId = urlParams.get('join');
                if (joinId && elJoinInput) {
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
                    if (attempt < 2) {
                        console.log(`ID ${shortId} is unavailable. Retrying attempt ${attempt + 1} in 1.5s...`);
                        setTimeout(() => {
                            initPeer(forcedId, attempt + 1);
                        }, 1500);
                    } else {
                        // Generate a new ID to resolve collision
                        const baseWord = forcedId ? forcedId.split('-')[0] : generateFiveLetterWord();
                        const newId = `${baseWord}-${Math.floor(1000 + Math.random() * 9000)}`;
                        console.warn(`ID ${shortId} remains unavailable. Generating new ID: ${newId}`);
                        
                        // If we are hosting a saved world, update the save file
                        if (forcedId && activeWorldId) {
                            const saves = getSavedWorlds();
                            const idx = saves.findIndex(s => s.id === activeWorldId);
                            if (idx >= 0) {
                                saves[idx].mpCode = newId;
                                saveWorldsList(saves);
                            }
                        }
                        
                        if (elStatus) elStatus.innerText = "Connection collision. New room code: " + newId;
                        
                        setTimeout(() => {
                            initPeer(newId, 0);
                        }, 500);
                    }
                    return;
                }
                if (elStatus) elStatus.innerText = "Connection Error: " + err.type;
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
        if (elCopyBtn) {
            elCopyBtn.addEventListener('click', () => {
                if (!peerId) return;
                const shareLink = window.location.origin + window.location.pathname + '?join=' + peerId;
                navigator.clipboard.writeText(shareLink).then(() => {
                    if (elToast) {
                        elToast.classList.add('show');
                        setTimeout(() => elToast.classList.remove('show'), 2000);
                    }
                }).catch(err => {
                    navigator.clipboard.writeText(peerId);
                    if (elToast) {
                        elToast.innerText = "Copied Room ID!";
                        elToast.classList.add('show');
                        setTimeout(() => elToast.classList.remove('show'), 2000);
                    }
                });
            });
        }

        if (elBtnHost) {
            elBtnHost.addEventListener('click', () => {
                isHost = true;
                if (elStatus) elStatus.innerText = "Waiting for an opponent to join...";
                const saves = getSavedWorlds();
                if (saves.length > 0) {
                    const mostRecentSave = saves[saves.length - 1];
                    loadWorld(mostRecentSave.id);
                } else {
                    startGame();
                }
            });
        }

        if (elBtnSolo) {
            elBtnSolo.addEventListener('click', () => {
                isHost = true;
                isConnected = false;
                const saves = getSavedWorlds();
                if (saves.length > 0) {
                    const mostRecentSave = saves[saves.length - 1];
                    loadWorld(mostRecentSave.id);
                } else {
                    startGame();
                }
            });
        }

        if (elBtnJoin) {
            elBtnJoin.addEventListener('click', () => {
                const targetId = elJoinInput ? elJoinInput.value.trim().toUpperCase() : '';
                if (!targetId) {
                    if (elStatus) elStatus.innerText = "Please enter a valid Room ID.";
                    return;
                }
                connectToOpponent(targetId);
            });
        }

        function connectToOpponent(targetId) {
            const cleanId = targetId.trim().toUpperCase();
            if (elStatus) elStatus.innerText = "Connecting to room " + cleanId + "...";
            
            const doConnect = () => {
                conn = peer.connect(cleanId);
                isHost = false;
                setupConnection();
            };

            if (!peer || peer.destroyed) {
                initPeer().then(() => {
                    if (peer) {
                        peer.once('open', () => {
                            doConnect();
                        });
                    } else {
                        if (elStatus) elStatus.innerText = "Error: Peer connection not initialized.";
                    }
                });
            } else {
                doConnect();
            }
        }

        function setupConnection() {
            const handleOpen = () => {
                isConnected = true;
                if (elStatus) elStatus.innerText = "Connection established! Preparing game...";
                
                // Sync customized character appearance
                sendNetworkMessage({
                    type: 'appearance',
                    name: myAppearance.name || 'player',
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

            conn.on('error', (err) => {
                console.error("Connection Error:", err);
                if (elStatus) elStatus.innerText = "Connection failed: " + err.message;
                handleDisconnect();
            });

            conn.on('close', () => {
                handleDisconnect();
            });
        }

        function handleDisconnect() {
            isConnected = false;
            gameActive = false;
            exitPointerLock();
            elLobby.style.display = 'flex';
            elHud.style.display = 'none';
            elCrosshair.style.display = 'none';
            elGameOver.style.display = 'none';
            elMapOverlay.style.display = 'none';
            if (elStatus) elStatus.innerText = "Opponent disconnected. Room reset.";
            resetGameScene();
        }

        // --- THREE.JS GAME ENGINE SETUP ---
        let scene, camera, renderer, clock, placementPreview;
        let fireTexture = null;
        let isLocked = false;
        let ignoreNextEscKeyUp = false;
        let justExitedPointerLock = false;
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
            name: safeGetItem('appearance_name', 'player'),
            skin: safeGetItem('appearance_skin', '#ffdbac'),
            hair: safeGetItem('appearance_hair', '#2c1d11'),
            eye: safeGetItem('appearance_eye', '#0a1128'),
            shirt: safeGetItem('appearance_shirt', '#2b6cb0'),
            pants: safeGetItem('appearance_pants', '#2d3748')
        };
        let opponentAppearance = {
            name: 'opponent',
            skin: '#ffdbac',
            hair: '#2c1d11',
            eye: '#0a1128',
            shirt: '#2b6cb0',
            pants: '#2d3748'
        };

        // Initialize start screen name input field
        const startNameInput = document.getElementById('player-name-input');
        if (startNameInput) {
            startNameInput.value = myAppearance.name || 'player';
        }

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

        let timeOffset = 30000 - (Date.now() % (810 * 1000));
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
        const eatingParticles = [];
        
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
        let isEating = false;
        let heldItem = null;
        let hotbarItems = new Array(9).fill(null);
        let hotbarCounts = new Array(9).fill(0);
        let hotbarDurability = new Array(9).fill(null);
        hotbarItems[0] = 'wooden_axe';
        hotbarCounts[0] = 1;
        hotbarDurability[0] = 60;
        hotbarItems[1] = 'crafting_bench';
        hotbarCounts[1] = 1;
        let inventoryItems = new Array(27).fill(null);
        let inventoryCounts = new Array(27).fill(0);
        let inventoryDurability = new Array(27).fill(null);
        let armorItems = {
            helmet: null,
            chestplate: null,
            leggings: null,
            gauntlets: null,
            boots: null
        };
        const placedObjects = [];
        let respawnPoint = null; // { x, y, z, inCave }
        let activeFurnace = null;
        let furnaceUIOpen = false;
        let activeChest = null;
        let chestUIOpen = false;
        let lastMiningHoldTime = 0;
        let groundHits = 0;
        let lastGroundHitTime = 0;
        let groundShovelHits = 0;
        let lastGroundShovelHitTime = 0;
        const obtainedItems = new Set();
        obtainedItems.add('wooden_axe');
        obtainedItems.add('crafting_bench');
        let lastWeaponSwingTime = 0;
        let animals = [];
        let droppedFoods = [];
        let worldTrees = [];
        let worldStones = [];
        let worldCorals = [];
        let isMouseDown = false;
        let mouseDownStartTime = 0;
        let choppingTreeTarget = null;
        let isRodBaited = false;
        let activeBobber = null;
        let flyingFish = null;

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
        let firstPersonHands, rightHand, leftHand, kickerLeg, bowGroup, woodenAxeGroup, woodenSwordGroup, woodenPickaxeGroup, woodenShovelGroup, foodGroup;
        let localPunching = false, localKicking = false, localDrawingBow = false;
        let localPunchTimer = 0, localKickTimer = 0, localBowTimer = 0;

        // Projectiles
        const localArrows = [];
        const peerArrows = [];
        const errorProjectiles = [];
        const peerErrorProjectiles = [];
        let portalVortices = [];
        let lastQuantumDamageTime = 0;

        // Survivalism State & Third Person camera views
        let cameraView = 'first'; // 'first', 'third_back', 'third_front'
        let cheatsEnabled = false;
        let currentWeather = 'clear'; // 'clear', 'rain', 'thunder'
        let weatherTimer = 120.0; // random weather change countdown
        let rainParticles = null;
        let isLightningFlashing = false;
        let lightningFlashDuration = 0;
        let lightningFlashTimer = 5.0; // countdown to next lightning flash
        let rainSoundSource = null;
        let rainSoundGain = null;
        let currentGameMode = 'survival'; // 'survival', 'freedom'
        let physicsMode = 'normal'; // 'normal', 'moon', 'bouncy'
        let currentWorldName = 'My World';
        let activeWorldId = null;
        let minedStoneCoords = new Set();
        let choppedTreeCoords = new Set();
        let minedCoralCoords = new Set();
        let minedDesertHoles = new Set();
        let highestYSinceGrounded = 0;
        let ridingBoat = false;
        let ridingHorse = false;
        let activeHorse = null;

        let playerMeshGroup = null;
        let playerHead = null, playerLArm = null, playerRArm = null, playerLLeg = null, playerRLeg = null;

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
        const TERRAIN_SIZE = 1600;
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

        // Permutation table for 2D Perlin Noise
        const Permutation = new Uint8Array(512);
        const p_init = [151,160,137,91,90,15,
        131,13,201,95,96,53,194,233, 7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
        190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
        88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
        77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
        102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
        135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
        5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,162,119,171,205,179,244,
        240,201,50,223,24,150,5,12,95,190,92,236,111,162,22,238,104,135,83,232,19,211,
        246,120,226,148,58,120,40,115,224,21,114,79,166,225,201,50,223,24,150,5,12,95,
        190,92,236,111,162,22,238,104,135,83,232,19,211,246,120,226,148,58,120,40,115,
        224,21,114,79,166,225];

        for (let i = 0; i < 256; i++) {
            Permutation[i] = p_init[i];
            Permutation[i + 256] = p_init[i];
        }

        function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
        function lerp(t, a, b) { return a + t * (b - a); }
        function grad2d(hash, x, y) {
            const h = hash & 7;
            const u = h < 4 ? x : y;
            const v = h < 4 ? y : x;
            return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
        }

        function perlin2d(x, y) {
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            const xf = x - Math.floor(x);
            const yf = y - Math.floor(y);
            const u = fade(xf);
            const v = fade(yf);
            
            const aa = Permutation[Permutation[X] + Y];
            const ab = Permutation[Permutation[X] + Y + 1];
            const ba = Permutation[Permutation[X + 1] + Y];
            const bb = Permutation[Permutation[X + 1] + Y + 1];
            
            const x1 = lerp(u, grad2d(aa, xf, yf), grad2d(ba, xf - 1, yf));
            const x2 = lerp(u, grad2d(ab, xf, yf - 1), grad2d(bb, xf - 1, yf - 1));
            return lerp(v, x1, x2);
        }

        function getCaveFloorAndCeiling(x, z) {
            // Winding noodle cave patterns using 2D Perlin noise
            const n1 = perlin2d(x * 0.02, z * 0.02);
            const n2 = perlin2d(x * 0.02 + 500, z * 0.02 + 500);
            let d = Math.min(Math.abs(n1), Math.abs(n2));
            
            // Force open tunnels near explicit cave entrances/exits
            const entrances = [
                { x: -50, z: 70 },
                { x: 20, z: 40 },
                { x: -320, z: 220 }
            ];
            
            entrances.forEach(ent => {
                const dist = Math.sqrt(Math.pow(x - ent.x, 2) + Math.pow(z - ent.z, 2));
                if (dist < 25.0) {
                    const weight = Math.min(1.0, dist / 25.0);
                    d = d * weight;
                }
            });
            
            const threshold = 0.12;
            const transition = 0.04;
            
            // Standard target floor and ceiling heights inside open cave tunnels
            const targetFloor = -24.0 + perlin2d(x * 0.05, z * 0.05) * 3.0;
            const targetCeil = -10.0 + perlin2d(x * 0.04 + 100, z * 0.04 + 100) * 3.0;
            
            if (d < threshold) {
                // Inside the cave noodle tunnel: interpolate floor and ceiling
                const w = Math.min(1.0, (threshold - d) / transition);
                const mid = (targetFloor + targetCeil) / 2.0;
                
                const fH = targetFloor * w + mid * (1 - w);
                const cH = targetCeil * w + mid * (1 - w);
                return { floor: fH, ceil: cH };
            } else {
                // Outside the cave tunnel: floor meets ceiling (solid wall)
                const mid = (targetFloor + targetCeil) / 2.0;
                return { floor: mid, ceil: mid };
            }
        }

        // Cave height math helpers
        function getCaveFloorHeight(x, z) {
            return getCaveFloorAndCeiling(x, z).floor;
        }

        function getCaveCeilingHeight(x, z) {
            return getCaveFloorAndCeiling(x, z).ceil;
        }

        // Deterministic seeding for procedural chunk elements
        function hashCoords(x, z) {
            let h = 0x811c9dc5;
            const str = `${x},${z}`;
            for (let i = 0; i < str.length; i++) {
                h ^= str.charCodeAt(i);
                h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
            }
            return (h >>> 0) / 4294967296;
        }

        // Overworld height function for coordinates outside the starter 1200x1200m zone
        function getNoiseTerrainHeight(x, z) {
            // Large scale landscape structures (continents/mountains/valleys)
            const nLow = perlin2d(x * 0.0003, z * 0.0003);
            const nMid = perlin2d(x * 0.0015, z * 0.0015);
            const nRough = perlin2d(x * 0.008, z * 0.008);
            const nDetail = perlin2d(x * 0.03, z * 0.03) * 0.8 + perlin2d(x * 0.09, z * 0.09) * 0.2;
            
            let h = 2.0; // base plains height
            
            if (nLow > 0.2) {
                // Mountain range region
                const t = (nLow - 0.2) / 0.8;
                const mountainH = 15.0 + t * 65.0 + nMid * 12.0 + nRough * 4.0;
                h = 2.0 * (1 - t) + mountainH * t;
            } else if (nLow < -0.3) {
                // Deep valley/ocean region
                const t = (nLow - (-1.0)) / 0.7;
                const oceanH = -12.0 + nMid * 3.0;
                h = -1.0 * (1 - t) + oceanH * t;
            } else {
                // Plains and hills
                const t = (nLow - (-0.3)) / 0.5;
                const plainsH = 2.0 + nMid * 4.0 + nRough * 1.5;
                const hillsH = 6.0 + nMid * 12.0 + nRough * 3.0;
                h = plainsH * (1 - t) + hillsH * t;
            }
            
            h += nDetail * 1.2;
            return h;
        }

        // Global chunk loading/cave variables
        let playerInCave = false;
        let opponentInCave = false;
        const loadedChunks = new Map();
        const caveEntrances = [];
        const caveExits = [];
        let torchLight = null;
        const caveWaterLevel = -18.0;
        const chunkWidth = 400;

        // Procedural Heightmap Formula
        function getTerrainHeight(x, z, inCave = false, ignoreMinedHoles = false) {
            if (inCave) {
                return getCaveFloorHeight(x, z);
            }

            if (x > 1400) {
                // Quantum Lands
                let qH = -45.0; // Abyss/Pool bottom
                
                // 1. Main Island
                const dMain = Math.sqrt(Math.pow(x - 2000, 2) + Math.pow(z, 2));
                if (dMain < 250) {
                    const w = Math.min(1.0, (250 - dMain) / 20); // 20m transition
                    const hMain = 20.0 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hMain * w);
                }
                
                // 2. Upper Island (Larger)
                const dUpper = Math.sqrt(Math.pow(x - 2000, 2) + Math.pow(z - 300, 2));
                if (dUpper < 180) {
                    const w = Math.min(1.0, (180 - dUpper) / 20);
                    const hUpper = 60.0 + Math.sin(x * 0.06) * Math.cos(z * 0.06) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hUpper * w);
                }
                
                // 3. Lower Island (Smaller)
                const dLower = Math.sqrt(Math.pow(x - 2000, 2) + Math.pow(z + 300, 2));
                if (dLower < 110) {
                    const w = Math.min(1.0, (110 - dLower) / 20);
                    const hLower = -10.0 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hLower * w);
                }
                
                // 3b. Lower West Island (Smaller, center 1700, -250)
                const dLowerWest = Math.sqrt(Math.pow(x - 1700, 2) + Math.pow(z + 250, 2));
                if (dLowerWest < 80) {
                    const w = Math.min(1.0, (80 - dLowerWest) / 20);
                    const hLowerWest = -15.0 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hLowerWest * w);
                }
                
                // 4. High Peak (Smaller peak)
                const dPeak = Math.sqrt(Math.pow(x - 2350, 2) + Math.pow(z, 2));
                if (dPeak < 120) {
                    const w = Math.min(1.0, (120 - dPeak) / 20);
                    const hPeak = 90.0 + (1.0 - dPeak / 120) * 15.0 + Math.sin(x * 0.07) * Math.cos(z * 0.07) * 3.0;
                    qH = Math.max(qH, -45.0 * (1 - w) + hPeak * w);
                }
                
                // 5. Connecting Bridges (Main to Lower, Main to Upper)
                const distFromCenter = Math.abs(x - 2000);
                if (distFromCenter < 15) {
                    const edgeWeight = Math.min(1.0, (15 - distFromCenter) / 3.0); // 3m smooth transition at edges
                    // Main to Lower (z between -250 and -190)
                    if (z >= -250 && z <= -190) {
                        const t = (z - (-250)) / (-190 - (-250)); // t goes from 0 at z=-250 to 1 at z=-190
                        const hBridge = 20.0 - t * 30.0; // starts at 20 (Main) and goes down to -10 (Lower)
                        qH = hBridge * edgeWeight + qH * (1.0 - edgeWeight);
                    }
                    // Main to Upper (z between 120 and 250)
                    if (z >= 120 && z <= 250) {
                        const t = (z - 120) / (250 - 120); // t goes from 0 at z=120 to 1 at z=250
                        const hBridge = 60.0 - t * 40.0; // starts at 60 (Upper) and goes down to 20 (Main)
                        qH = hBridge * edgeWeight + qH * (1.0 - edgeWeight);
                    }
                }

                // 6. Bridge between Lower Island (2000, -300) and Lower West Island (1700, -250)
                if (x >= 1780 && x <= 1890) {
                    const distFromBridgeCenter = Math.abs(z - (-275));
                    if (distFromBridgeCenter < 15) {
                        const edgeWeight = Math.min(1.0, (15 - distFromBridgeCenter) / 3.0);
                        const t = (x - 1780) / (1890 - 1780); // t goes from 0 at x=1780 to 1 at x=1890
                        const hBridge = -15.0 + t * 5.0; // goes from -15 (Lower West) to -10 (Lower)
                        qH = hBridge * edgeWeight + qH * (1.0 - edgeWeight);
                    }
                }
                
                return qH;
            }

            const r = Math.sqrt(x * x + z * z);
            
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

            // 6. Rocky Island (center (420, 50), radius 120)
            const d6 = Math.sqrt(Math.pow(x - 420, 2) + Math.pow(z - 50, 2));
            if (d6 < 120) {
                const w = Math.min(1.0, (120 - d6) / 30);
                const h6 = 3.0 + Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.5;
                landH = Math.max(landH, -0.6 * (1 - w) + h6 * w);
            }
            
            // 7. Reef Island (center (0, -480), radius 120)
            const d7 = Math.sqrt(Math.pow(x - 0, 2) + Math.pow(z + 480, 2));
            if (d7 < 120) {
                const w = Math.min(1.0, (120 - d7) / 30);
                const h7 = -2.5 + Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.0;
                landH = Math.max(landH, -0.6 * (1 - w) + h7 * w);
            }
            
            
            // 8. 2nd Pine Island (behind the mountain) (center (350, 650), radius 120)
            const d8 = Math.sqrt(Math.pow(x - 350, 2) + Math.pow(z - 650, 2));
            if (d8 < 120) {
                const w = Math.min(1.0, (120 - d8) / 30);
                const h8 = 2.0 + Math.sin(x * 0.06) * Math.cos(z * 0.06) * 1.5;
                landH = Math.max(landH, -6.0 * (1 - w) + h8 * w);
            }
            
            // 9. Mushroom Island (just beside 2nd Pine Island) (center (520, 650), radius 120)
            const d9 = Math.sqrt(Math.pow(x - 520, 2) + Math.pow(z - 650, 2));
            if (d9 < 120) {
                const w = Math.min(1.0, (120 - d9) / 30);
                const h9 = 2.5 + Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.0;
                landH = Math.max(landH, -6.0 * (1 - w) + h9 * w);
            }
            
            h = landH;
            
            // Transition to infinite noise-based terrain starting at 550m up to 650m
            if (r > 550) {
                const noiseH = getNoiseTerrainHeight(x, z);
                
                // Exempt Pine Island 2 and Mushroom Island from noise overwrite
                let islandW = 0;
                if (d8 < 120) islandW = Math.min(1.0, (120 - d8) / 30);
                if (d9 < 120) islandW = Math.max(islandW, Math.min(1.0, (120 - d9) / 30));
                
                if (islandW > 0) {
                    h = h * islandW + noiseH * (1.0 - islandW);
                } else if (r < 650) {
                    const t = (r - 550) / 100;
                    h = h * (1 - t) + noiseH * t;
                } else {
                    h = noiseH;
                }
            }

            // Edge mountain boundaries only at the very limit of the infinitely large world (3,000,000 coordinates)
            if (r > 2999950) {
                const factor = (r - 2999950) / 45;
                h = h * (1 - Math.min(1.0, factor)) + factor * factor * 22.0;
            }
            // Apply mined stone holes
            if (!ignoreMinedHoles && worldStones && minedStoneCoords) {
                for (let i = 0; i < worldStones.length; i++) {
                    const stone = worldStones[i];
                    const dx = x - stone.x;
                    if (Math.abs(dx) >= 1.5) continue;
                    const dz = z - stone.z;
                    if (Math.abs(dz) >= 1.5) continue;
                    
                    const coordKey = `${stone.x.toFixed(1)},${stone.z.toFixed(1)}`;
                    if (minedStoneCoords.has(coordKey)) {
                        const dist = Math.sqrt(dx * dx + dz * dz);
                        if (dist < 1.3) {
                            const depth = 1.1;
                            const factor = 1.0 - dist / 1.3;
                            const smoothFactor = Math.sin(factor * Math.PI / 2);
                            h -= depth * smoothFactor;
                        }
                    }
                }
            }
            
            // Apply mined desert holes
            if (!ignoreMinedHoles && typeof minedDesertHoles !== 'undefined' && minedDesertHoles && minedDesertHoles.size > 0) {
                const distToDesertVal = Math.sqrt(Math.pow(x - 350, 2) + Math.pow(z + 350, 2));
                if (distToDesertVal < 185) {
                    minedDesertHoles.forEach(coordKey => {
                        const parts = coordKey.split(',');
                        if (parts.length >= 2) {
                            const hx = parseFloat(parts[0]);
                            const hz = parseFloat(parts[1]);
                            const depth = parts.length === 3 ? parseInt(parts[2]) : 1;
                            const dx = x - hx;
                            const dz = z - hz;
                            if (Math.abs(dx) < 2.0 && Math.abs(dz) < 2.0) {
                                const dist = Math.sqrt(dx * dx + dz * dz);
                                if (dist < 1.8) {
                                    const totalDepth = depth * 1.5;
                                    const factor = 1.0 - dist / 1.8;
                                    const smoothFactor = Math.sin(factor * Math.PI / 2);
                                    h -= totalDepth * smoothFactor;
                                }
                            }
                        }
                    });
                }
            }
            
            return h;
        }

        function getTerrainColor(x, z, y) {
            // Default forest green color
            let r_col = 0.10, g_col = 0.22, b_col = 0.12;
            
            // Distances to biome centers
            const d_desert = Math.sqrt(Math.pow(x - 350, 2) + Math.pow(z + 350, 2));
            const d_cherry = Math.sqrt(Math.pow(x + 150, 2) + Math.pow(z + 350, 2));
            const d_mountain = Math.sqrt(Math.pow(x - 250, 2) + Math.pow(z - 350, 2));
            const d_village2 = Math.sqrt(Math.pow(x + 350, 2) + Math.pow(z - 250, 2));
            const d_rocky = Math.sqrt(Math.pow(x - 420, 2) + Math.pow(z - 50, 2));
            const d_reef = Math.sqrt(Math.pow(x - 0, 2) + Math.pow(z + 480, 2));
            const d_pine2 = Math.sqrt(Math.pow(x - 350, 2) + Math.pow(z - 650, 2));
            const d_mushroom = Math.sqrt(Math.pow(x - 520, 2) + Math.pow(z - 650, 2));
            
            const d_main = Math.sqrt(x * x + z * z);
            
            // Procedural green blend using perlin noise
            const grassNoise = perlin2d(x * 0.12, z * 0.12) * 0.5 + 0.5;
            const forestR = 65 / 255;
            const forestG = 120 / 255;
            const forestB = 55 / 255;
            
            const cherryR = 85 / 255;
            const cherryG = 135 / 255;
            const cherryB = 80 / 255;

            let skipOceanBlend = false;

            if (d_main < 210) {
                r_col = forestR;
                g_col = forestG;
                b_col = forestB;
                skipOceanBlend = true;
            } else if (d_cherry < 180) {
                r_col = cherryR;
                g_col = cherryG;
                b_col = cherryB;
                skipOceanBlend = true;
            } else if (d_desert < 180) {
                const w = Math.min(1.0, (180 - d_desert) / 30);
                
                // Check if inside a dug hole with depth >= 2
                let isDugStone = false;
                if (typeof minedDesertHoles !== 'undefined' && minedDesertHoles && minedDesertHoles.size > 0) {
                    minedDesertHoles.forEach(coordKey => {
                        const parts = coordKey.split(',');
                        if (parts.length >= 2) {
                            const hx = parseFloat(parts[0]);
                            const hz = parseFloat(parts[1]);
                            const depth = parts.length === 3 ? parseInt(parts[2]) : 1;
                            if (depth >= 2) {
                                const dx = x - hx;
                                const dz = z - hz;
                                const dist = Math.sqrt(dx * dx + dz * dz);
                                if (dist < 1.8) {
                                    isDugStone = true;
                                }
                            }
                        }
                    });
                }
                
                if (isDugStone) {
                    skipOceanBlend = true;
                    // Blend to stone grey color
                    let stoneR = 0.45, stoneG = 0.45, stoneB = 0.45;
                    
                    // Deterministic vein generation based on vertex coordinates
                    const hashVal = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
                    const randVal = hashVal - Math.floor(hashVal);
                    if (randVal < 0.08) {
                        stoneR = 0.15; stoneG = 0.15; stoneB = 0.15; // Coal vein
                    } else if (randVal < 0.14) {
                        stoneR = 0.70; stoneG = 0.40; stoneB = 0.25; // Iron vein
                    } else if (randVal < 0.18) {
                        stoneR = 0.20; stoneG = 0.65; stoneB = 0.50; // Copper vein (oxidized)
                    }
                    
                    r_col = r_col * (1 - w) + stoneR * w;
                    g_col = g_col * (1 - w) + stoneG * w;
                    b_col = b_col * (1 - w) + stoneB * w;
                } else {
                    // Blend to desert sand (0.85, 0.78, 0.50)
                    r_col = r_col * (1 - w) + 0.85 * w;
                    g_col = g_col * (1 - w) + 0.78 * w;
                    b_col = b_col * (1 - w) + 0.50 * w;
                }
            } else if (d_mountain < 180) {
                const w = Math.min(1.0, (180 - d_mountain) / 30);
                let mr = 0.12, mg = 0.24, mb = 0.14;
                if (y > 40) {
                    mr = 0.95; mg = 0.95; mb = 0.95;
                } else if (y > 15) {
                    mr = 0.45; mg = 0.45; mb = 0.45;
                }
                r_col = r_col * (1 - w) + mr * w;
                g_col = g_col * (1 - w) + mg * w;
                b_col = b_col * (1 - w) + mb * w;
            } else if (d_village2 < 180) {
                r_col = forestR;
                g_col = forestG;
                b_col = forestB;
                skipOceanBlend = true;
            } else if (d_rocky < 120) {
                const w = Math.min(1.0, (120 - d_rocky) / 30);
                const rr = 0.45, rg = 0.45, rb = 0.45;
                r_col = r_col * (1 - w) + rr * w;
                g_col = g_col * (1 - w) + rg * w;
                b_col = b_col * (1 - w) + rb * w;
            } else if (d_reef < 120) {
                const w = Math.min(1.0, (120 - d_reef) / 30);
                r_col = r_col * (1 - w) + 0.2 * w;
                g_col = g_col * (1 - w) + 0.6 * w;
                b_col = b_col * (1 - w) + 0.55 * w;
            } else if (d_pine2 < 120) {
                const w = Math.min(1.0, (120 - d_pine2) / 30);
                r_col = r_col * (1 - w) + forestR * w;
                g_col = g_col * (1 - w) + forestG * w;
                b_col = b_col * (1 - w) + forestB * w;
                skipOceanBlend = true;
            } else if (d_mushroom < 120) {
                const w = Math.min(1.0, (120 - d_mushroom) / 30);
                r_col = r_col * (1 - w) + 0.38 * w;
                g_col = g_col * (1 - w) + 0.28 * w;
                b_col = b_col * (1 - w) + 0.38 * w;
                skipOceanBlend = true;
            }
            
            if (y < -0.5 && !skipOceanBlend) {
                const depthFactor = Math.min(1.0, (-0.5 - y) / 5.0);
                r_col = r_col * (1 - depthFactor) + 0.25 * depthFactor;
                g_col = g_col * (1 - depthFactor) + 0.22 * depthFactor;
                b_col = b_col * (1 - depthFactor) + 0.18 * depthFactor;
            }
            
            return { r: r_col, g: g_col, b: b_col };
        }

        function updateTerrainMeshNear(stoneX, stoneZ) {
            if (!terrainGeometry) return;
            const positions = terrainGeometry.attributes.position.array;
            const colors = terrainGeometry.attributes.color.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i+2];
                
                const dx = x - stoneX;
                const dz = z - stoneZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < 3.0) {
                    const newY = getTerrainHeight(x, z, false);
                    positions[i+1] = newY;
                    
                    const col = getTerrainColor(x, z, newY);
                    colors[i] = col.r;
                    colors[i+1] = col.g;
                    colors[i+2] = col.b;
                }
            }
            terrainGeometry.attributes.position.needsUpdate = true;
            terrainGeometry.attributes.color.needsUpdate = true;
            terrainGeometry.computeVertexNormals();
        }

        function addMinedDesertHole(hx, hz, sendNetwork = true) {
            const prefix = `${hx.toFixed(1)},${hz.toFixed(1)},`;
            let foundKey = null;
            let currentDepth = 0;
            
            for (const key of minedDesertHoles) {
                if (key.startsWith(prefix) || key === `${hx.toFixed(1)},${hz.toFixed(1)}`) {
                    foundKey = key;
                    const parts = key.split(',');
                    currentDepth = parts.length === 3 ? parseInt(parts[2]) : 1;
                    break;
                }
            }
            
            if (foundKey) {
                minedDesertHoles.delete(foundKey);
            }
            
            const newDepth = currentDepth + 1;
            const newKey = `${hx.toFixed(1)},${hz.toFixed(1)},${newDepth}`;
            minedDesertHoles.add(newKey);

            if (sendNetwork && isConnected) {
                sendNetworkMessage({
                    type: 'dig-desert-hole',
                    x: hx,
                    z: hz
                });
            }

            return newDepth;
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
                const prompt = document.getElementById('click-lock-prompt');
                const pauseMenu = document.getElementById('pause-menu');
                const ingameSettings = document.getElementById('in-game-settings-screen');
                if (document.pointerLockElement === document.body) {
                    isLocked = true;
                    elCrosshair.style.display = 'flex';
                    if (prompt) prompt.style.display = 'none';
                    if (pauseMenu) pauseMenu.style.display = 'none';
                    if (ingameSettings) ingameSettings.style.display = 'none';
                    gameActive = true;
                    document.activeElement.blur();
                    window.focus();
                } else {
                    isLocked = false;
                    elCrosshair.style.display = 'none';
                    if (gameActive && myHealth > 0 && oppHealth > 0) {
                        const isIngameSettingsOpen = ingameSettings && ingameSettings.style.display === 'flex';
                        const isPauseMenuOpen = pauseMenu && pauseMenu.style.display === 'flex';
                        if (chatOpen || mapOpen || inventoryOpen || furnaceUIOpen || chestUIOpen || isIngameSettingsOpen || isPauseMenuOpen) {
                            if (prompt) prompt.style.display = 'none';
                        } else {
                            // Only open the pause menu if the document has focus and is not hidden.
                            // If pointer lock is lost because of tab switch or focus loss, let the blur/visibility change handlers save and exit instead of opening the pause menu.
                            const isFocusLost = !document.hasFocus() || document.visibilityState === 'hidden';
                            if (!isFocusLost) {
                                if (pauseMenu) pauseMenu.style.display = 'flex';
                                if (prompt) prompt.style.display = 'none';
                                
                                // Set flag to prevent onKeyUp from immediately closing the pause menu
                                justExitedPointerLock = true;
                                setTimeout(() => {
                                    justExitedPointerLock = false;
                                }, 100);
                            }
                        }
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
            
            // Placement Preview Box
            const previewGeo = new THREE.BoxGeometry(1, 1, 1);
            const previewMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                wireframe: true,
                transparent: true,
                opacity: 0.6,
                depthWrite: false
            });
            placementPreview = new THREE.Mesh(previewGeo, previewMat);
            placementPreview.visible = false;
            scene.add(placementPreview);
            
            // Camera (Yaw Y first, Pitch X second)
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.rotation.order = 'YXZ';
            
            // Set spawn coordinates inside Open Plains
            const spawnZ = isHost ? 28 : 12;
            const spawnY = getTerrainHeight(60, spawnZ) + 1.6;
            camera.position.set(60, spawnY, spawnZ);
            highestYSinceGrounded = camera.position.y;
            if (!isHost) {
                camera.rotation.y = Math.PI; // Look towards Host
            }

            createPlayerMesh();

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
            terrainGeometry = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 320, 320);
            terrainGeometry.rotateX(-Math.PI / 2); // align flat
            terrainGeometry.translate(200, 0, 200); // shift geometry center to (200, 200) to cover [-600, 1000]
            
            const positions = terrainGeometry.attributes.position.array;
            const colors = [];
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i+2];
                const y = getTerrainHeight(x, z);
                positions[i+1] = y; // Adjust Y coordinate
                
                const col = getTerrainColor(x, z, y);
                colors.push(col.r, col.g, col.b);
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
            terrainMesh.name = 'staticTerrain';
            scene.add(terrainMesh);

            // Massive Ocean water plane with a hole for the desert island
            const oceanShape = new THREE.Shape();
            oceanShape.moveTo(-1200, -1200);
            oceanShape.lineTo(1200, -1200);
            oceanShape.lineTo(1200, 1200);
            oceanShape.lineTo(-1200, 1200);
            oceanShape.closePath();
            
            // Desert island center (350, -350).
            // Shifting ocean mesh to (200, -0.5, 200) to match new terrain bounds.
            // Shape X: lx = 350 - 200 = 150.
            // Shape Y: ly = 200 - (-350) = 550.
            const desertHole = new THREE.Path();
            desertHole.absarc(150, 550, 170, 0, Math.PI * 2, true);
            oceanShape.holes.push(desertHole);
            
            const oceanGeo = new THREE.ShapeGeometry(oceanShape);
            const oceanMat = new THREE.MeshStandardMaterial({
                color: 0x0f3060, // Deep ocean blue
                roughness: 0.15,
                metalness: 0.85,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
            oceanMesh.rotateX(-Math.PI / 2);
            oceanMesh.position.set(200, -0.5, 200);
            oceanMesh.name = 'staticOcean';
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
            quantumTerrainMesh.name = 'quantumTerrain';
            scene.add(quantumTerrainMesh);
            
            // 2. Translucent Green Quantum Pool (at y = -40, centered at x = 2000, z = 0)
            const qPoolGeo = new THREE.PlaneGeometry(1200, 1200);
            const qPoolMat = new THREE.MeshStandardMaterial({
                color: 0x00ff33, // Quantum green
                roughness: 0.1,
                metalness: 0.8,
                transparent: true,
                opacity: 0.65,
                side: THREE.DoubleSide
            });
            const qPoolMesh = new THREE.Mesh(qPoolGeo, qPoolMat);
            qPoolMesh.rotateX(-Math.PI / 2);
            qPoolMesh.position.set(2000, -40, 0);
            qPoolMesh.name = 'quantumPool';
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
                const pauseMenu = document.getElementById('pause-menu');
                const ingameSettings = document.getElementById('in-game-settings-screen');
                const isPauseMenuOpen = pauseMenu && pauseMenu.style.display === 'flex';
                const isIngameSettingsOpen = ingameSettings && ingameSettings.style.display === 'flex';
                
                if (gameActive && !mapOpen && !chatOpen && !inventoryOpen && !furnaceUIOpen && !chestUIOpen && !isPauseMenuOpen && !isIngameSettingsOpen && elLobby.style.display === 'none' && elGameOver.style.display !== 'flex') {
                    if (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'SELECT') {
                        requestPointerLock();
                    }
                }
            });
            initPointerLock();

            // autoSaveAndExit has been moved to the outer initNeonBruiser scope to prevent memory leaks and properly handle page unload/tab hide.

            // Keyboard Listeners
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('wheel', (e) => {
                if (gameActive && myHealth > 0 && isLocked && !mapOpen && !chatOpen && !inventoryOpen) {
                    if (e.deltaY > 0) {
                        selectHotbarSlot((selectedHotbarIndex + 1) % 9);
                    } else if (e.deltaY < 0) {
                        selectHotbarSlot((selectedHotbarIndex - 1 + 9) % 9);
                    }
                }
            }, { passive: true });

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
                        ignoreNextEscKeyUp = true;
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
                    hp: 40,
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

        function spawnSingleBeeForHive(hx, hy, hz) {
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

        function spawnBeesForHive(hx, hy, hz) {
            for (let i = 0; i < 5; i++) {
                spawnSingleBeeForHive(hx, hy, hz);
            }
        }

        function spawnReefCorals() {
            const coralColors = [
                0xff007f, // Neon Pink
                0x00f0ff, // Neon Cyan
                0xffea00, // Neon Yellow
                0xff5e00, // Neon Orange
                0xaa00ff, // Neon Purple
                0xff00aa  // Magenta
            ];
            
            for (let i = 0; i < 90; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 85;
                const cx = 0 + Math.cos(angle) * dist;
                const cz = -480 + Math.sin(angle) * dist;
                
                const coordKey = `${cx.toFixed(1)},${cz.toFixed(1)}`;
                if (minedCoralCoords && minedCoralCoords.has(coordKey)) {
                    continue;
                }
                
                const cy = getTerrainHeight(cx, cz);
                if (cy > WATER_Y) continue; // Must be underwater
                
                const coralColor = coralColors[Math.floor(Math.random() * coralColors.length)];
                const coralMat = new THREE.MeshStandardMaterial({
                    color: coralColor,
                    roughness: 0.9,
                    emissive: coralColor,
                    emissiveIntensity: 0.15
                });
                
                const coralType = Math.floor(Math.random() * 3); // 3 different coral styles
                const coralGroup = new THREE.Group();
                coralGroup.position.set(cx, cy, cz);
                
                if (coralType === 0) {
                    // Tube/Cylinder coral
                    const numTubes = 3 + Math.floor(Math.random() * 3);
                    for (let j = 0; j < numTubes; j++) {
                        const th = 0.5 + Math.random() * 0.8;
                        const tr = 0.1 + Math.random() * 0.1;
                        const tube = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, th, 8), coralMat);
                        tube.position.set((Math.random() - 0.5) * 0.4, th/2, (Math.random() - 0.5) * 0.4);
                        tube.rotation.x = (Math.random() - 0.5) * 0.3;
                        tube.rotation.z = (Math.random() - 0.5) * 0.3;
                        tube.castShadow = true;
                        coralGroup.add(tube);
                    }
                } else if (coralType === 1) {
                    // Brain coral (spherical clusters)
                    const baseGeo = new THREE.SphereGeometry(0.35, 8, 8);
                    const baseMesh = new THREE.Mesh(baseGeo, coralMat);
                    baseMesh.position.y = 0.25;
                    baseMesh.scale.set(1.2, 0.8, 1.2);
                    baseMesh.castShadow = true;
                    coralGroup.add(baseMesh);
                    
                    const numBubbles = 4 + Math.floor(Math.random() * 4);
                    for (let j = 0; j < numBubbles; j++) {
                        const bub = new THREE.Mesh(new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 8, 8), coralMat);
                        bub.position.set(
                            (Math.random() - 0.5) * 0.5,
                            0.25 + (Math.random() - 0.5) * 0.2,
                            (Math.random() - 0.5) * 0.5
                        );
                        bub.castShadow = true;
                        coralGroup.add(bub);
                    }
                } else {
                    // Fan/Plate coral (stacked boxes)
                    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), coralMat);
                    baseMesh.position.y = 0.3;
                    baseMesh.castShadow = true;
                    coralGroup.add(baseMesh);
                    
                    const numPlates = 2 + Math.floor(Math.random() * 3);
                    for (let j = 0; j < numPlates; j++) {
                        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.6 + Math.random()*0.4, 0.08, 0.6 + Math.random()*0.4), coralMat);
                        plate.position.set((Math.random() - 0.5)*0.2, 0.2 + j * 0.25, (Math.random() - 0.5)*0.2);
                        plate.rotation.z = (Math.random() - 0.5)*0.4;
                        plate.rotation.x = (Math.random() - 0.5)*0.4;
                        plate.castShadow = true;
                        coralGroup.add(plate);
                    }
                }
                
                scene.add(coralGroup);
                
                worldCorals.push({
                    mesh: coralGroup,
                    group: coralGroup,
                    color: coralColor,
                    x: cx,
                    y: cy,
                    z: cz,
                    hits: 0,
                    lastHitTime: 0
                });
            }
        }
        
        function resetWorldCorals() {
            worldCorals.forEach(coral => {
                coral.hits = 0;
                coral.lastHitTime = 0;
                coral.mesh.visible = true;
                
                const coordKey = `${coral.x.toFixed(1)},${coral.z.toFixed(1)}`;
                if (minedCoralCoords.has(coordKey)) {
                    coral.mesh.visible = false;
                }
            });
        }

        function spawnRockyPlainsResources() {
            for (let i = 0; i < 35; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 95;
                const rx = 420 + Math.cos(angle) * dist;
                const rz = 50 + Math.sin(angle) * dist;
                
                const coordKey = `${rx.toFixed(1)},${rz.toFixed(1)}`;
                if (minedStoneCoords && minedStoneCoords.has(coordKey)) {
                    continue;
                }
                
                const ry = getTerrainHeight(rx, rz);
                if (ry <= WATER_Y) continue; // must be above water
                
                const rand = Math.random();
                let type;
                let color;
                let isMetal = false;
                
                if (rand < 0.40) {
                    type = 'limestone';
                    color = 0xeae6df; // white/cream
                } else if (rand < 0.65) {
                    type = 'coal_ore';
                    color = 0x222222; // black coal
                } else if (rand < 0.85) {
                    type = 'iron_ore';
                    color = 0xa34f40; // reddish-brown rust
                    isMetal = true;
                } else {
                    type = 'copper_ore';
                    color = 0xe88d72; // copper
                    isMetal = true;
                }
                
                const stoneMat = new THREE.MeshStandardMaterial({
                    color: 0x777777, // Neutral grey stone
                    roughness: 0.9,
                    metalness: 0.1
                });
                
                const oreMat = new THREE.MeshStandardMaterial({
                    color: color,
                    roughness: 0.9,
                    metalness: isMetal ? 0.6 : 0.1
                });
                
                const stoneGroup = new THREE.Group();
                stoneGroup.position.set(rx, ry, rz);
                // Flatten and broaden the stone group so it is embedded in the ground
                stoneGroup.scale.set(1.2, 0.25, 1.2);
                
                const baseRadius = 0.5 + Math.random() * 0.25;
                const baseGeo = new THREE.DodecahedronGeometry(baseRadius);
                const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
                // Place the base mesh lower to embed it in the terrain
                baseMesh.position.y = 0.05;
                baseMesh.castShadow = true;
                baseMesh.receiveShadow = true;
                stoneGroup.add(baseMesh);
                
                const numSub = 1 + Math.floor(Math.random() * 2);
                const subMeshes = [];
                for (let j = 0; j < numSub; j++) {
                    const subRadius = 0.25 + Math.random() * 0.2;
                    const subGeo = new THREE.DodecahedronGeometry(subRadius);
                    const subMesh = new THREE.Mesh(subGeo, stoneMat);
                    // Place the sub-meshes lower as well
                    subMesh.position.set(
                        (Math.random() - 0.5) * 0.5,
                        0.0 + Math.random() * 0.1,
                        (Math.random() - 0.5) * 0.5
                    );
                    subMesh.castShadow = true;
                    subMesh.receiveShadow = true;
                    stoneGroup.add(subMesh);
                    subMeshes.push(subMesh);
                }
                
                const numSpecks = 4 + Math.floor(Math.random() * 3);
                for (let k = 0; k < numSpecks; k++) {
                    const targetMesh = (Math.random() < 0.6 || subMeshes.length === 0) ? baseMesh : subMeshes[Math.floor(Math.random() * subMeshes.length)];
                    const targetRadius = targetMesh === baseMesh ? baseRadius : 0.25;
                    
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const dx = Math.sin(phi) * Math.cos(theta);
                    const dy = Math.sin(phi) * Math.sin(theta);
                    const dz = Math.cos(phi);
                    
                    const speckRadius = 0.08 + Math.random() * 0.06;
                    const speckGeo = new THREE.DodecahedronGeometry(speckRadius);
                    const speckMesh = new THREE.Mesh(speckGeo, oreMat);
                    
                    speckMesh.position.set(
                        targetMesh.position.x + dx * targetRadius * 0.95,
                        targetMesh.position.y + dy * targetRadius * 0.95,
                        targetMesh.position.z + dz * targetRadius * 0.95
                    );
                    speckMesh.castShadow = true;
                    stoneGroup.add(speckMesh);
                }
                
                scene.add(stoneGroup);
                
                worldStones.push({
                    mesh: stoneGroup,
                    group: stoneGroup,
                    x: rx,
                    y: ry,
                    z: rz,
                    type: type,
                    hits: 0,
                    lastHitTime: 0
                });
            }
        }
        
        function spawnBigMushroom(tx, tz) {
            const ty = getTerrainHeight(tx, tz);
            if (ty <= WATER_Y) return;

            const colors = [
                0xeeb808, // Yellow
                0x151515, // Black
                0xd93838, // Red
                0x228b22  // Green
            ];
            const colorHex = colors[Math.floor(Math.random() * colors.length)];
            
            const shroomGroup = new THREE.Group();
            shroomGroup.position.set(tx, ty, tz);

            // Stalk
            const stalkMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.85 });
            const stalkGeo = new THREE.CylinderGeometry(0.2, 0.28, 2.5, 8);
            const stalk = new THREE.Mesh(stalkGeo, stalkMat);
            stalk.position.y = 1.25;
            stalk.castShadow = true;
            shroomGroup.add(stalk);

            // Cap
            const capMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
            const capGeo = new THREE.SphereGeometry(1.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = 2.2;
            cap.scale.set(1.1, 0.75, 1.1);
            cap.castShadow = true;
            shroomGroup.add(cap);

            // Tiny spots
            const spotMat = new THREE.MeshStandardMaterial({ color: 0xefefff, roughness: 0.8 });
            const spotGeo = new THREE.BoxGeometry(0.15, 0.08, 0.15);
            const spotPositions = [
                { x: 0.4, y: 2.7, z: 0.4 },
                { x: -0.4, y: 2.7, z: -0.4 },
                { x: 0.6, y: 2.5, z: -0.3 },
                { x: -0.6, y: 2.5, z: 0.3 },
                { x: 0.0, y: 2.85, z: 0.0 },
                { x: 0.2, y: 2.6, z: -0.5 },
            ];
            spotPositions.forEach(pos => {
                const spot = new THREE.Mesh(spotGeo, spotMat);
                spot.position.set(pos.x, pos.y, pos.z);
                spot.rotation.x = pos.z * 0.8;
                spot.rotation.z = -pos.x * 0.8;
                shroomGroup.add(spot);
            });

            scene.add(shroomGroup);

            const leaves = [cap];
            worldTrees.push({
                group: shroomGroup,
                trunk: stalk,
                leaves: leaves,
                originalTrunkPos: stalk.position.clone(),
                originalTrunkRot: stalk.rotation.clone(),
                x: tx,
                z: tz,
                y: ty,
                isChopped: false,
                logsLeft: 3,
                chopClicks: 0,
                isFelling: false,
                fellProgress: 0,
                rotProgress: 0,
                fallAngle: 0,
                isMushroom: true,
                mushroomColor: colorHex
            });
        }

        const pineFoliageMat = new THREE.MeshStandardMaterial({ color: 0x0f3b1e, roughness: 0.8 });
        const pineTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3.5, 8);
        const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });

        function spawnSinglePineTree(tx, tz) {
            const ty = getTerrainHeight(tx, tz);
            if (ty <= WATER_Y) return;

            const treeGroup = new THREE.Group();
            treeGroup.position.set(tx, ty, tz);

            const trunk = new THREE.Mesh(pineTrunkGeo, pineTrunkMat);
            trunk.position.y = 1.75;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            const leaves = [];
            for (let j = 0; j < 3; j++) {
                const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.6 - j * 0.4, 2.2, 8), pineFoliageMat);
                leaf.position.y = 3.0 + j * 1.3;
                leaf.castShadow = true;
                leaf.userData.originalColor = 0x0f3b1e;
                treeGroup.add(leaf);
                leaves.push(leaf);
            }

            scene.add(treeGroup);

            worldTrees.push({
                group: treeGroup,
                trunk: trunk,
                leaves: leaves,
                originalTrunkPos: trunk.position.clone(),
                originalTrunkRot: trunk.rotation.clone(),
                x: tx,
                z: tz,
                y: ty,
                isChopped: false,
                logsLeft: 4,
                chopClicks: 0,
                isFelling: false,
                fellProgress: 0,
                rotProgress: 0,
                fallAngle: 0
            });
        }

        function spawnPineIsland2Resources() {
            // Pine Island 2 center is (350, 650), radius 120
            for (let i = 0; i < 35; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 95;
                const tx = 350 + Math.cos(angle) * dist;
                const tz = 650 + Math.sin(angle) * dist;
                
                const coordKey = `${tx.toFixed(1)},${tz.toFixed(1)}`;
                if (choppedTreeCoords.has(coordKey)) {
                    continue;
                }
                
                const ty = getTerrainHeight(tx, tz);
                if (ty <= WATER_Y) { i--; continue; }
                
                spawnSinglePineTree(tx, tz);
            }
        }

        function spawnMushroomIslandResources() {
            // Mushroom Island center is (520, 650), radius 120
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 90;
                const tx = 520 + Math.cos(angle) * dist;
                const tz = 650 + Math.sin(angle) * dist;
                
                const coordKey = `${tx.toFixed(1)},${tz.toFixed(1)}`;
                if (choppedTreeCoords.has(coordKey)) {
                    continue;
                }
                
                const ty = getTerrainHeight(tx, tz);
                if (ty <= WATER_Y) { i--; continue; }
                
                spawnBigMushroom(tx, tz);
            }
        }
        
        function resetWorldStones() {
            worldStones.forEach(stone => {
                stone.hits = 0;
                stone.lastHitTime = 0;
                stone.mesh.visible = true;
                
                const coordKey = `${stone.x.toFixed(1)},${stone.z.toFixed(1)}`;
                if (minedStoneCoords.has(coordKey)) {
                    stone.mesh.visible = false;
                }
            });
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

                // Leaves
                const f1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), foliageMat);
                f1.position.y = 3.5;
                f1.castShadow = true;
                treeGroup.add(f1);

                const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), foliageMat);
                f2.position.set(0.7, 4.0, 0.4);
                f2.castShadow = true;
                treeGroup.add(f2);

                const f3 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), foliageMat);
                f3.position.set(-0.7, 4.0, -0.4);
                f3.castShadow = true;
                treeGroup.add(f3);

                scene.add(treeGroup);

                const leaves = [];
                treeGroup.children.forEach(child => {
                    if (child !== trunk) {
                        if (child.material && child.material.color) {
                            child.userData.originalColor = child.material.color.getHex();
                        }
                        leaves.push(child);
                    }
                });

                worldTrees.push({
                    group: treeGroup,
                    trunk: trunk,
                    leaves: leaves,
                    originalTrunkPos: trunk.position.clone(),
                    originalTrunkRot: trunk.rotation.clone(),
                    x: tx,
                    z: tz,
                    y: ty,
                    isChopped: false,
                    logsLeft: 4,
                    chopClicks: 0,
                    isFelling: false,
                    fellProgress: 0,
                    rotProgress: 0,
                    fallAngle: 0
                });
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
            for (let i = 0; i < 150; i++) {
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

                const leaves = [];
                treeGroup.children.forEach(child => {
                    if (child !== trunk) {
                        if (child.material && child.material.color) {
                            child.userData.originalColor = child.material.color.getHex();
                        }
                        leaves.push(child);
                    }
                });

                worldTrees.push({
                    group: treeGroup,
                    trunk: trunk,
                    leaves: leaves,
                    originalTrunkPos: trunk.position.clone(),
                    originalTrunkRot: trunk.rotation.clone(),
                    x: tx,
                    z: tz,
                    y: ty,
                    isChopped: false,
                    logsLeft: 4,
                    chopClicks: 0,
                    isFelling: false,
                    fellProgress: 0,
                    rotProgress: 0,
                    fallAngle: 0
                });
            }

            // 5. Spawn Lake Water Plane
            const waterGeo = new THREE.CircleGeometry(LAKE_RADIUS, 32);
            const waterMat = new THREE.MeshStandardMaterial({
                color: 0x005577, // Beautiful deep blue/teal water
                roughness: 0.1,
                metalness: 0.9,
                transparent: true,
                opacity: 0.75,
                side: THREE.DoubleSide
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

                const leaves = [];
                treeGroup.children.forEach(child => {
                    if (child !== trunk) {
                        if (child.material && child.material.color) {
                            child.userData.originalColor = child.material.color.getHex();
                        }
                        leaves.push(child);
                    }
                });

                worldTrees.push({
                    group: treeGroup,
                    trunk: trunk,
                    leaves: leaves,
                    originalTrunkPos: trunk.position.clone(),
                    originalTrunkRot: trunk.rotation.clone(),
                    x: tx,
                    z: tz,
                    y: ty,
                    isChopped: false,
                    logsLeft: 4,
                    chopClicks: 0,
                    isFelling: false,
                    fellProgress: 0,
                    rotProgress: 0,
                    fallAngle: 0
                });
                
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
            
            for (let i = 0; i < 70; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 150;
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

                const leaves = [];
                treeGroup.children.forEach(child => {
                    if (child !== trunk) {
                        if (child.material && child.material.color) {
                            child.userData.originalColor = child.material.color.getHex();
                        }
                        leaves.push(child);
                    }
                });

                worldTrees.push({
                    group: treeGroup,
                    trunk: trunk,
                    leaves: leaves,
                    originalTrunkPos: trunk.position.clone(),
                    originalTrunkRot: trunk.rotation.clone(),
                    x: tx,
                    z: tz,
                    y: ty,
                    isChopped: false,
                    logsLeft: 4,
                    chopClicks: 0,
                    isFelling: false,
                    fellProgress: 0,
                    rotProgress: 0,
                    fallAngle: 0
                });
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

            // 11. Pine Trees and Forest (around spawn point)

            // Spawn pine trees close to spawn point (60, 20)
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 8 + Math.random() * 15;
                const tx = 60 + Math.cos(angle) * dist;
                const tz = 20 + Math.sin(angle) * dist;
                
                // Keep safe distance from spawns
                const distToHost = Math.sqrt(Math.pow(tx - 60, 2) + Math.pow(tz - 28, 2));
                const distToClient = Math.sqrt(Math.pow(tx - 60, 2) + Math.pow(tz - 12, 2));
                if (distToHost < 6 || distToClient < 6) {
                    i--;
                    continue;
                }
                spawnSinglePineTree(tx, tz);
            }

            // Spawn pine forest beside it (around x: 100, z: 40)
            for (let i = 0; i < 80; i++) {
                const tx = 80 + Math.random() * 50;
                const tz = 0 + Math.random() * 60;
                // Exclude directly at spawn point
                const distToSpawn = Math.sqrt(Math.pow(tx - 60, 2) + Math.pow(tz - 20, 2));
                if (distToSpawn < 20) {
                    i--;
                    continue;
                }
                spawnSinglePineTree(tx, tz);
            }

            // Spawn dropped items around spawn point (logs and planks)
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 3 + Math.random() * 6;
                const ix = 60 + Math.cos(angle) * dist;
                const iz = 20 + Math.sin(angle) * dist;
                const iy = getTerrainHeight(ix, iz);
                if (iy > WATER_Y) {
                    spawnDroppedFood('log', new THREE.Vector3(ix, iy, iz));
                }
            }
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 3 + Math.random() * 6;
                const ix = 60 + Math.cos(angle) * dist;
                const iz = 20 + Math.sin(angle) * dist;
                const iy = getTerrainHeight(ix, iz);
                if (iy > WATER_Y) {
                    spawnDroppedFood('planks', new THREE.Vector3(ix, iy, iz));
                }
            }
            
            // Spawn Reef Corals underwater at (0, -480)
            spawnReefCorals();
            
            // Spawn Rocky Plains resources
            spawnRockyPlainsResources();
            
            // Spawn Pine Island 2 resources (center 350, 650)
            spawnPineIsland2Resources();
            
            // Spawn Mushroom Island resources (center 520, 650)
            spawnMushroomIslandResources();

            // 11b. Spawn 50 more pine trees at the main spawn island (Plains: x > 20, d1 < 210)
            for (let i = 0; i < 50; i++) {
                const tx = 20 + Math.random() * 150;
                const tz = -150 + Math.random() * 300;
                const dist = Math.sqrt(tx * tx + tz * tz);
                if (dist > 200) { i--; continue; } // Keep on spawn island
                const ty = getTerrainHeight(tx, tz);
                if (ty <= WATER_Y) { i--; continue; }
                
                // Exclude directly at player spawns
                const distToHost = Math.sqrt(Math.pow(tx - 60, 2) + Math.pow(tz - 28, 2));
                const distToClient = Math.sqrt(Math.pow(tx - 60, 2) + Math.pow(tz - 12, 2));
                if (distToHost < 6 || distToClient < 6) {
                    i--;
                    continue;
                }
                spawnSinglePineTree(tx, tz);
            }

            // 11c. Spawn 45 pine trees at the mountain island (center 250, 350, radius 180)
            for (let i = 0; i < 45; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 140;
                const tx = 250 + Math.cos(angle) * radius;
                const tz = 350 + Math.sin(angle) * radius;
                const ty = getTerrainHeight(tx, tz);
                if (ty <= WATER_Y || ty > 65) { i--; continue; } // Don't spawn underwater or on extremely steep peaks
                spawnSinglePineTree(tx, tz);
            }
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

        // Procedural biome coloring helper for chunks
        function getTerrainColor(x, y, z) {
            let r_col = 0.10, g_col = 0.22, b_col = 0.12; // Default forest green
            
            // Distances to biome centers
            const d_desert = Math.sqrt(Math.pow(x - 350, 2) + Math.pow(z + 350, 2));
            const d_cherry = Math.sqrt(Math.pow(x + 150, 2) + Math.pow(z + 350, 2));
            const d_mountain = Math.sqrt(Math.pow(x - 250, 2) + Math.pow(z - 350, 2));
            const d_village2 = Math.sqrt(Math.pow(x + 350, 2) + Math.pow(z - 250, 2));
            const d_rocky = Math.sqrt(Math.pow(x - 420, 2) + Math.pow(z - 50, 2));
            
            const d_main = Math.sqrt(x * x + z * z);
            
            // Procedural green blend using perlin noise
            const grassNoise = perlin2d(x * 0.12, z * 0.12) * 0.5 + 0.5;
            const forestR = 65 / 255;
            const forestG = 120 / 255;
            const forestB = 55 / 255;
            
            const cherryR = 85 / 255;
            const cherryG = 135 / 255;
            const cherryB = 80 / 255;

            let skipOceanBlend = false;

            if (d_main < 210) {
                r_col = forestR;
                g_col = forestG;
                b_col = forestB;
                skipOceanBlend = true;
            } else if (d_cherry < 180) {
                r_col = cherryR;
                g_col = cherryG;
                b_col = cherryB;
                skipOceanBlend = true;
            } else if (d_desert < 180) {
                const w = Math.min(1.0, (180 - d_desert) / 30);
                r_col = r_col * (1 - w) + 0.85 * w;
                g_col = g_col * (1 - w) + 0.78 * w;
                b_col = b_col * (1 - w) + 0.50 * w;
            } else if (d_mountain < 180) {
                const w = Math.min(1.0, (180 - d_mountain) / 30);
                let mr = 0.12, mg = 0.24, mb = 0.14;
                if (y > 40) {
                    mr = 0.95; mg = 0.95; mb = 0.95;
                } else if (y > 15) {
                    mr = 0.45; mg = 0.45; mb = 0.45;
                }
                r_col = r_col * (1 - w) + mr * w;
                g_col = g_col * (1 - w) + mg * w;
                b_col = b_col * (1 - w) + mb * w;
            } else if (d_village2 < 180) {
                r_col = forestR;
                g_col = forestG;
                b_col = forestB;
                skipOceanBlend = true;
            } else if (d_rocky < 120) {
                const w = Math.min(1.0, (120 - d_rocky) / 30);
                const rr = 0.45, rg = 0.45, rb = 0.45; // Default dark grey
                
                r_col = r_col * (1 - w) + rr * w;
                g_col = g_col * (1 - w) + rg * w;
                b_col = b_col * (1 - w) + rb * w;
            } else {
                // Procedural biomes outside the starter area based on Perlin noise
                const biomeNoise = perlin2d(x * 0.0015, z * 0.0015);
                if (biomeNoise > 0.3) {
                    // Savanna blend
                    r_col = 0.55; g_col = 0.53; b_col = 0.28;
                } else if (biomeNoise < -0.3) {
                    // Desert blend
                    r_col = 0.85; g_col = 0.78; b_col = 0.50;
                }
            }
            
            // Global mountain stone and snow caps based on height - restricted to Mountain Biome
            if (d_mountain < 180) {
                if (y > 45) {
                    // Snow cap
                    r_col = 0.95; g_col = 0.95; b_col = 0.95;
                } else if (y > 25) {
                    // Stone transition
                    const t = (y - 25) / 20; // 25 to 45
                    r_col = r_col * (1 - t) + 0.45 * t;
                    g_col = g_col * (1 - t) + 0.45 * t;
                    b_col = b_col * (1 - t) + 0.45 * t;
                }
            }

            // Ocean bed sand blend
            if (y < -0.5 && !skipOceanBlend) {
                const depthFactor = Math.min(1.0, (-0.5 - y) / 5.0);
                r_col = r_col * (1 - depthFactor) + 0.25 * depthFactor;
                g_col = g_col * (1 - depthFactor) + 0.22 * depthFactor;
                b_col = b_col * (1 - depthFactor) + 0.18 * depthFactor;
            }
            
            return { r: r_col, g: g_col, b: b_col };
        }

        // Generate chunk mesh for overworld
        function generateChunkMesh(cx, cz) {
            const subdivisions = 40;
            const geo = new THREE.PlaneGeometry(chunkWidth, chunkWidth, subdivisions, subdivisions);
            geo.rotateX(-Math.PI / 2);
            
            const positions = geo.attributes.position.array;
            const colors = [];
            const chunkCenterX = cx * chunkWidth;
            const chunkCenterZ = cz * chunkWidth;
            
            for (let i = 0; i < positions.length; i += 3) {
                const absX = positions[i] + chunkCenterX;
                const absZ = positions[i+2] + chunkCenterZ;
                const absY = getTerrainHeight(absX, absZ, false);
                positions[i+1] = absY;
                
                const col = getTerrainColor(absX, absY, absZ);
                colors.push(col.r, col.g, col.b);
            }
            
            geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geo.computeVertexNormals();
            
            const mat = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.9,
                metalness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.receiveShadow = true;
            
            return mesh;
        }

        // Generate cave floor, ceiling and water meshes
        function generateCaveChunkMeshes(cx, cz) {
            const subdivisions = 40;
            const chunkCenterX = cx * chunkWidth;
            const chunkCenterZ = cz * chunkWidth;
            
            // 1. Floor
            const floorGeo = new THREE.PlaneGeometry(chunkWidth, chunkWidth, subdivisions, subdivisions);
            floorGeo.rotateX(-Math.PI / 2);
            const floorPos = floorGeo.attributes.position.array;
            const floorColors = [];
            
            for (let i = 0; i < floorPos.length; i += 3) {
                const absX = floorPos[i] + chunkCenterX;
                const absZ = floorPos[i+2] + chunkCenterZ;
                const fH = getCaveFloorHeight(absX, absZ);
                const cH = getCaveCeilingHeight(absX, absZ);
                
                const finalY = cH - fH <= 0 ? cH : fH;
                floorPos[i+1] = finalY;
                
                let r = 0.12 + perlin2d(absX * 0.1, absZ * 0.1) * 0.03;
                let g = 0.12 + perlin2d(absX * 0.1, absZ * 0.1) * 0.03;
                let b = 0.15 + perlin2d(absX * 0.1, absZ * 0.1) * 0.03;
                
                if (hashCoords(absX, absZ) < 0.015 && cH - fH > 2.0) {
                    r = 0.0; g = 0.8; b = 0.8; // Glowing cyan crystals
                }
                
                floorColors.push(r, g, b);
            }
            floorGeo.setAttribute('color', new THREE.Float32BufferAttribute(floorColors, 3));
            floorGeo.computeVertexNormals();
            
            const floorMat = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.95,
                metalness: 0.05
            });
            const floorMesh = new THREE.Mesh(floorGeo, floorMat);
            floorMesh.receiveShadow = true;
            
            // 2. Ceiling
            const ceilGeo = new THREE.PlaneGeometry(chunkWidth, chunkWidth, subdivisions, subdivisions);
            ceilGeo.rotateX(Math.PI / 2); // face downwards
            const ceilPos = ceilGeo.attributes.position.array;
            const ceilColors = [];
            
            for (let i = 0; i < ceilPos.length; i += 3) {
                const absX = ceilPos[i] + chunkCenterX;
                const absZ = -(ceilPos[i+2]) + chunkCenterZ;
                const fH = getCaveFloorHeight(absX, absZ);
                const cH = getCaveCeilingHeight(absX, absZ);
                
                ceilPos[i+1] = cH;
                
                let r = 0.10 + perlin2d(absX * 0.09, absZ * 0.09) * 0.02;
                let g = 0.10 + perlin2d(absX * 0.09, absZ * 0.09) * 0.02;
                let b = 0.13 + perlin2d(absX * 0.09, absZ * 0.09) * 0.02;
                
                if (hashCoords(absX + 5, absZ + 5) < 0.02 && cH - fH > 2.0) {
                    r = 0.7; g = 0.1; b = 0.8; // Glowing purple mush
                }
                
                ceilColors.push(r, g, b);
            }
            ceilGeo.setAttribute('color', new THREE.Float32BufferAttribute(ceilColors, 3));
            ceilGeo.computeVertexNormals();
            
            const ceilMesh = new THREE.Mesh(ceilGeo, floorMat);
            ceilMesh.receiveShadow = true;
            
            // 3. Cave Water Plane (Removed)
            const waterMesh = new THREE.Group();
            
            return { floorMesh, ceilMesh, waterMesh };
        }

        // Spawn cave portal meshes
        function createCaveEntranceMesh() {
            const group = new THREE.Group();
            const portal = new THREE.Mesh(
                new THREE.CylinderGeometry(2.0, 2.0, 0.1, 16),
                new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
            );
            portal.rotation.x = Math.PI / 2;
            portal.position.set(0, 1.8, 0);
            group.add(portal);
            
            const archMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.95 });
            for (let i = 0; i < 6; i++) {
                const stone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), archMat);
                const angle = (i / 5) * Math.PI;
                stone.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3 + 0.3, 0);
                stone.rotation.z = angle - Math.PI / 2;
                stone.castShadow = true;
                group.add(stone);
            }
            return group;
        }

        function createCaveExitMesh() {
            const group = new THREE.Group();
            const portal = new THREE.Mesh(
                new THREE.CylinderGeometry(2.0, 2.0, 0.1, 16),
                new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide })
            );
            portal.rotation.x = Math.PI / 2;
            portal.position.set(0, 1.8, 0);
            group.add(portal);
            
            const archMat = new THREE.MeshStandardMaterial({ color: 0x2e353d, roughness: 0.95 });
            for (let i = 0; i < 6; i++) {
                const stone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), archMat);
                const angle = (i / 5) * Math.PI;
                stone.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3 + 0.3, 0);
                stone.rotation.z = angle - Math.PI / 2;
                stone.castShadow = true;
                group.add(stone);
            }
            return group;
        }

        // Dynamic Chunk Loader and Dimension Manager
        function updateChunks() {
            if (!scene) return;
            
            const playerCX = Math.floor((camera.position.x + chunkWidth/2) / chunkWidth);
            const playerCZ = Math.floor((camera.position.z + chunkWidth/2) / chunkWidth);
            
            const requiredChunks = new Set();
            const requiredList = [];
            
            for (let dx = -1; dx <= 1; dx++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const cx = playerCX + dx;
                    const cz = playerCZ + dz;
                    const key = `${cx},${cz}`;
                    requiredChunks.add(key);
                    requiredList.push({ cx, cz, key });
                }
            }
            
            // 1. Unload out-of-range chunks
            for (const [key, chunk] of loadedChunks.entries()) {
                if (!requiredChunks.has(key)) {
                    if (chunk.terrainMesh) scene.remove(chunk.terrainMesh);
                    if (chunk.ceilMesh) scene.remove(chunk.ceilMesh);
                    if (chunk.waterMesh) scene.remove(chunk.waterMesh);
                    
                    chunk.entities.forEach(ent => {
                        scene.remove(ent);
                    });
                    
                    for (let i = caveEntrances.length - 1; i >= 0; i--) {
                        const ent = caveEntrances[i];
                        if (ent.chunkKey === key) {
                            scene.remove(ent.mesh);
                            caveEntrances.splice(i, 1);
                        }
                    }

                    for (let i = caveExits.length - 1; i >= 0; i--) {
                        const ex = caveExits[i];
                        if (ex.chunkKey === key) {
                            scene.remove(ex.mesh);
                            caveExits.splice(i, 1);
                        }
                    }

                    for (let i = zombies.length - 1; i >= 0; i--) {
                        const z = zombies[i];
                        if (z.chunkKey === key) {
                            scene.remove(z.mesh);
                            zombies.splice(i, 1);
                        }
                    }
                    
                    // Clean up worldTrees entries belonging to this chunk
                    for (let i = worldTrees.length - 1; i >= 0; i--) {
                        if (worldTrees[i].chunkKey === key) {
                            worldTrees.splice(i, 1);
                        }
                    }
                    
                    loadedChunks.delete(key);
                }
            }
            
            // Toggle original static terrain visibility based on dimension
            const staticTerrain = scene.getObjectByName('staticTerrain');
            const staticOcean = scene.getObjectByName('staticOcean');
            const qTerrain = scene.getObjectByName('quantumTerrain');
            const qPool = scene.getObjectByName('quantumPool');
            const inQuantumLands = (camera.position.x > 1400);
            
            if (inQuantumLands) {
                if (staticTerrain) staticTerrain.visible = false;
                if (staticOcean) staticOcean.visible = false;
                if (qTerrain) qTerrain.visible = true;
                if (qPool) qPool.visible = true;
            } else {
                if (staticTerrain) staticTerrain.visible = !isDimensionCave(playerInCave);
                if (staticOcean) {
                    staticOcean.visible = !isDimensionCave(playerInCave);
                    if (!isDimensionCave(playerInCave)) {
                        const inStarter = (playerCX >= -1 && playerCX <= 2 && playerCZ >= -1 && playerCZ <= 2);
                        if (inStarter) {
                            staticOcean.position.set(200, -0.5, 200);
                        } else {
                            staticOcean.position.set(playerCX * chunkWidth, -0.5, playerCZ * chunkWidth);
                        }
                    }
                }
                if (qTerrain) qTerrain.visible = false;
                if (qPool) qPool.visible = false;
            }
            
            bushes.forEach(b => {
                b.mesh.visible = !isDimensionCave(playerInCave);
            });
            
            // 2. Load/Update required chunks
            requiredList.forEach(c => {
                const chunk = loadedChunks.get(c.key);
                const needsReload = !chunk || isDimensionCave(chunk.isCave) !== isDimensionCave(playerInCave);
                
                if (needsReload) {
                    if (chunk) {
                        if (chunk.terrainMesh) scene.remove(chunk.terrainMesh);
                        if (chunk.ceilMesh) scene.remove(chunk.ceilMesh);
                        if (chunk.waterMesh) scene.remove(chunk.waterMesh);
                        chunk.entities.forEach(ent => scene.remove(ent));
                        
                        for (let i = caveEntrances.length - 1; i >= 0; i--) {
                            if (caveEntrances[i].chunkKey === c.key) {
                                scene.remove(caveEntrances[i].mesh);
                                caveEntrances.splice(i, 1);
                            }
                        }
                        for (let i = caveExits.length - 1; i >= 0; i--) {
                            if (caveExits[i].chunkKey === c.key) {
                                scene.remove(caveExits[i].mesh);
                                caveExits.splice(i, 1);
                            }
                        }
                        for (let i = zombies.length - 1; i >= 0; i--) {
                            if (zombies[i].chunkKey === c.key) {
                                scene.remove(zombies[i].mesh);
                                zombies.splice(i, 1);
                            }
                        }
                    }
                    
                    const chunkData = {
                        isCave: playerInCave,
                        terrainMesh: null,
                        ceilMesh: null,
                        waterMesh: null,
                        entities: []
                    };
                    
                    const chunkCenterX = c.cx * chunkWidth;
                    const chunkCenterZ = c.cz * chunkWidth;
                    
                    if (playerInCave) {
                        const caveMeshes = generateCaveChunkMeshes(c.cx, c.cz);
                        chunkData.terrainMesh = caveMeshes.floorMesh;
                        chunkData.ceilMesh = caveMeshes.ceilMesh;
                        chunkData.waterMesh = caveMeshes.waterMesh;
                        
                        scene.add(caveMeshes.floorMesh);
                        scene.add(caveMeshes.ceilMesh);
                        scene.add(caveMeshes.waterMesh);
                        
                        if (c.cx === 0 && c.cz === 0) {
                            if (!caveExits.some(ex => ex.x === -50 && ex.z === 70)) {
                                const exitMesh = createCaveExitMesh();
                                exitMesh.position.set(-50, getCaveFloorHeight(-50, 70), 70);
                                scene.add(exitMesh);
                                caveExits.push({
                                    x: -50,
                                    z: 70,
                                    mesh: exitMesh,
                                    chunkKey: c.key
                                });
                            }
                            if (!caveExits.some(ex => ex.x === 20 && ex.z === 40)) {
                                const exitMesh = createCaveExitMesh();
                                exitMesh.position.set(20, getCaveFloorHeight(20, 40), 40);
                                scene.add(exitMesh);
                                caveExits.push({
                                    x: 20,
                                    z: 40,
                                    mesh: exitMesh,
                                    chunkKey: c.key
                                });
                            }
                        } else if (c.cx === -1 && c.cz === 1) {
                            if (!caveExits.some(ex => ex.x === -320 && ex.z === 220)) {
                                const exitMesh = createCaveExitMesh();
                                exitMesh.position.set(-320, getCaveFloorHeight(-320, 220), 220);
                                scene.add(exitMesh);
                                caveExits.push({
                                    x: -320,
                                    z: 220,
                                    mesh: exitMesh,
                                    chunkKey: c.key
                                });
                            }
                        } else {
                            const seedExit = hashCoords(c.cx + 7, c.cz + 7);
                            if (seedExit < 0.05) {
                                const localX = (hashCoords(c.cx, c.cz) - 0.5) * 300;
                                const localZ = (hashCoords(c.cx + 2, c.cz + 2) - 0.5) * 300;
                                const absX = chunkCenterX + localX;
                                const absZ = chunkCenterZ + localZ;
                                const fH = getCaveFloorHeight(absX, absZ);
                                const cH = getCaveCeilingHeight(absX, absZ);
                                
                                if (cH - fH > 3.0) {
                                    const exitMesh = createCaveExitMesh();
                                    exitMesh.position.set(absX, fH, absZ);
                                    scene.add(exitMesh);
                                    caveExits.push({
                                        x: absX,
                                        z: absZ,
                                        mesh: exitMesh,
                                        chunkKey: c.key
                                    });
                                }
                            }
                        }
                        
                        // Spawn cave mobs
                        const seedMobs = hashCoords(c.cx, c.cz);
                        if (seedMobs < 0.45) {
                            const numMobs = Math.floor(seedMobs * 10) % 3 + 1;
                            for (let m = 0; m < numMobs; m++) {
                                const mx = chunkCenterX + (hashCoords(c.cx + m, c.cz) - 0.5) * 300;
                                const mz = chunkCenterZ + (hashCoords(c.cx, c.cz + m) - 0.5) * 300;
                                const fH = getCaveFloorHeight(mx, mz);
                                const cH = getCaveCeilingHeight(mx, mz);
                                
                                if (cH - fH > 3.0) {
                                    const mobId = `cave_mob_${c.cx}_${c.cz}_${m}`;
                                    if (!zombies.some(z => z.id === mobId)) {
                                        const rType = hashCoords(c.cx + m, c.cz + m);
                                        let type, health, mesh;
                                        if (rType < 0.35) {
                                            type = 'skeleton';
                                            health = 45;
                                            mesh = createSkeletonMesh();
                                        } else if (rType < 0.65) {
                                            type = 'creeper';
                                            health = 38;
                                            mesh = createCreeperMesh();
                                        } else {
                                            type = 'zombie';
                                            health = 40;
                                            mesh = createZombieMesh();
                                        }
                                        mesh.position.set(mx, fH, mz);
                                        scene.add(mesh);
                                        
                                        zombies.push({
                                            id: mobId,
                                            mesh: mesh,
                                            type: type,
                                            x: mx,
                                            y: fH,
                                            z: mz,
                                            inCave: true,
                                            chunkKey: c.key,
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
                            }
                        }
                        
                    } else {
                        const inStarterRegion = c.cx >= -1 && c.cx <= 2 && c.cz >= -1 && c.cz <= 2;
                        
                        if (!inStarterRegion) {
                            const chunkMesh = generateChunkMesh(c.cx, c.cz);
                            chunkData.terrainMesh = chunkMesh;
                            scene.add(chunkMesh);
                            
                            const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3.5, 8);
                            const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
                            const foliageMat = new THREE.MeshStandardMaterial({ color: 0x0f3b1e, roughness: 0.8 });
                            
                            const density = perlin2d(chunkCenterX * 0.005, chunkCenterZ * 0.005);
                            let treeCount = 0;
                            if (density > 0.1) {
                                treeCount = Math.floor(density * 18);
                            }
                            
                            for (let t = 0; t < treeCount; t++) {
                                const tx = chunkCenterX + (hashCoords(c.cx + t, c.cz) - 0.5) * 360;
                                const tz = chunkCenterZ + (hashCoords(c.cx, c.cz + t) - 0.5) * 360;
                                const ty = getTerrainHeight(tx, tz, false);
                                
                                if (ty > 0.0) {
                                    const treeKey = `${tx.toFixed(1)},${tz.toFixed(1)}`;
                                    if (choppedTreeCoords.has(treeKey)) continue;
                                    const treeGroup = new THREE.Group();
                                    treeGroup.position.set(tx, ty, tz);
                                    
                                    const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
                                    trunk.position.y = 1.75;
                                    trunk.castShadow = true;
                                    treeGroup.add(trunk);
                                    
                                    const leaves = [];
                                    for (let j = 0; j < 3; j++) {
                                        const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.6 - j * 0.4, 2.2, 8), foliageMat);
                                        leaf.position.y = 3.0 + j * 1.3;
                                        leaf.castShadow = true;
                                        leaf.userData.originalColor = 0x0f3b1e;
                                        treeGroup.add(leaf);
                                        leaves.push(leaf);
                                    }
                                    
                                    scene.add(treeGroup);
                                    chunkData.entities.push(treeGroup);
                                    
                                    worldTrees.push({
                                        group: treeGroup,
                                        trunk: trunk,
                                        leaves: leaves,
                                        originalTrunkPos: trunk.position.clone(),
                                        originalTrunkRot: trunk.rotation.clone(),
                                        x: tx,
                                        z: tz,
                                        y: ty,
                                        isChopped: false,
                                        logsLeft: 4,
                                        chopClicks: 0,
                                        isFelling: false,
                                        fellProgress: 0,
                                        rotProgress: 0,
                                        fallAngle: 0,
                                        chunkKey: c.key
                                    });
                                }
                            }
                        }
                        
                        // (Caves removed)
                    }
                    
                    loadedChunks.set(c.key, chunkData);
                }
            });

            // Sync visibility of all placed blocks with player's dimension
            placedObjects.forEach(obj => {
                if (obj.mesh) {
                    obj.mesh.visible = (isDimensionCave(obj.inCave) === isDimensionCave(playerInCave));
                }
            });
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

            const v1Houses = [
                { x: -85, z: -85 },
                { x: -65, z: -80 },
                { x: -75, z: -60 },
                { x: -95, z: -70 },
                { x: -90, z: -98 },
                { x: -70, z: -100 }
            ];

            const v2Houses = [
                { x: -360, z: 240 },
                { x: -340, z: 260 },
                { x: -370, z: 270 },
                { x: -330, z: 230 },
                { x: -350, z: 285 }
            ];

            // Spawn 350 clumps (Main Island / general spawn island area)
            for (let i = 0; i < 350; i++) {
                let x = -185 + Math.random() * 370;
                let z = -185 + Math.random() * 370;

                const distToHostStart = Math.sqrt(Math.pow(x - 60, 2) + Math.pow(z - 28, 2));
                const distToClientStart = Math.sqrt(Math.pow(x - 60, 2) + Math.pow(z - 12, 2));
                const distToLake = Math.sqrt(Math.pow(x - LAKE_CENTER_X, 2) + Math.pow(z - LAKE_CENTER_Z, 2));

                if (distToHostStart < 8 || distToClientStart < 8 || distToLake < CRATER_RADIUS) {
                    continue;
                }

                // Check if too close to any house on main island village
                let tooCloseToHouse = false;
                for (const house of v1Houses) {
                    const distToHouse = Math.sqrt(Math.pow(x - house.x, 2) + Math.pow(z - house.z, 2));
                    if (distToHouse < 4.5) {
                        tooCloseToHouse = true;
                        break;
                    }
                }
                if (tooCloseToHouse) continue;

                const y = getTerrainHeight(x, z);
                if (y > -0.5) {
                    const mesh = new THREE.Mesh(grassGeom, grassMat);
                    mesh.position.set(x, y, z);
                    mesh.rotation.y = Math.random() * Math.PI;
                    const s = 0.7 + Math.random() * 0.6;
                    mesh.scale.set(s, s, s);
                    scene.add(mesh);
                }
            }

            // Spawn 150 extra grass clumps in the main island village area (centered around x: -80, z: -80)
            for (let i = 0; i < 150; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 90;
                const x = -80 + Math.cos(angle) * radius;
                const z = -80 + Math.sin(angle) * radius;

                // Check if too close to any house on main island village
                let tooCloseToHouse = false;
                for (const house of v1Houses) {
                    const distToHouse = Math.sqrt(Math.pow(x - house.x, 2) + Math.pow(z - house.z, 2));
                    if (distToHouse < 4.5) {
                        tooCloseToHouse = true;
                        break;
                    }
                }
                if (tooCloseToHouse) continue;

                const y = getTerrainHeight(x, z);
                if (y > -0.5) {
                    const mesh = new THREE.Mesh(grassGeom, grassMat);
                    mesh.position.set(x, y, z);
                    mesh.rotation.y = Math.random() * Math.PI;
                    const s = 0.7 + Math.random() * 0.6;
                    mesh.scale.set(s, s, s);
                    scene.add(mesh);
                }
            }

            // Spawn 150 extra grass clumps in the second village island (centered around x: -350, z: 250)
            for (let i = 0; i < 150; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 150;
                const x = -350 + Math.cos(angle) * radius;
                const z = 250 + Math.sin(angle) * radius;

                // Check if too close to any house on second village
                let tooCloseToHouse = false;
                for (const house of v2Houses) {
                    const distToHouse = Math.sqrt(Math.pow(x - house.x, 2) + Math.pow(z - house.z, 2));
                    if (distToHouse < 4.5) {
                        tooCloseToHouse = true;
                        break;
                    }
                }
                if (tooCloseToHouse) continue;

                const y = getTerrainHeight(x, z);
                if (y > -0.5) {
                    const mesh = new THREE.Mesh(grassGeom, grassMat);
                    mesh.position.set(x, y, z);
                    mesh.rotation.y = Math.random() * Math.PI;
                    const s = 0.7 + Math.random() * 0.6;
                    mesh.scale.set(s, s, s);
                    scene.add(mesh);
                }
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
            // Trash cans removed
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

            // First Person WOODEN AXE Mesh Group
            woodenAxeGroup = new THREE.Group();
            woodenAxeGroup.position.set(0, 0, -0.15); // slightly in front of the fist
            woodenAxeGroup.rotation.set(0.4, 0, -0.3);
            woodenAxeGroup.visible = false;

            const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
            const axeHeadMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.1 });

            // Handle
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), handleMat);
            handle.rotation.x = Math.PI / 2; // Lie along Z axis
            woodenAxeGroup.add(handle);

            // Axe head
            const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.1), axeHeadMat);
            axeHead.position.set(-0.04, 0.03, -0.15); // Position near the end of the handle
            woodenAxeGroup.add(axeHead);

            rightHand.add(woodenAxeGroup);

            // First Person WOODEN SWORD Mesh Group
            woodenSwordGroup = new THREE.Group();
            woodenSwordGroup.position.set(0, 0, -0.15);
            woodenSwordGroup.rotation.set(0.4, 0, -0.3);
            woodenSwordGroup.visible = false;

            const swordHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), handleMat);
            swordHandle.rotation.x = Math.PI / 2;
            woodenSwordGroup.add(swordHandle);

            const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.03), handleMat);
            crossguard.position.set(0, 0.03, -0.075);
            crossguard.rotation.z = Math.PI / 2;
            woodenSwordGroup.add(crossguard);

            const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.025), axeHeadMat);
            swordBlade.position.set(0, 0, -0.275);
            swordBlade.rotation.x = Math.PI / 2;
            woodenSwordGroup.add(swordBlade);

            rightHand.add(woodenSwordGroup);

            // First Person WOODEN PICKAXE Mesh Group
            woodenPickaxeGroup = new THREE.Group();
            woodenPickaxeGroup.position.set(0, 0, -0.15);
            woodenPickaxeGroup.rotation.set(0.4, 0, -0.3);
            woodenPickaxeGroup.visible = false;

            const pickHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), handleMat);
            pickHandle.rotation.x = Math.PI / 2;
            woodenPickaxeGroup.add(pickHandle);

            const pickHead = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.04), axeHeadMat);
            pickHead.position.set(0, 0, -0.22);
            woodenPickaxeGroup.add(pickHead);

            rightHand.add(woodenPickaxeGroup);

            // First Person WOODEN SHOVEL Mesh Group
            woodenShovelGroup = new THREE.Group();
            woodenShovelGroup.position.set(0, 0, -0.15);
            woodenShovelGroup.rotation.set(0.4, 0, -0.3);
            woodenShovelGroup.visible = false;

            const shovelHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), handleMat);
            shovelHandle.rotation.x = Math.PI / 2;
            woodenShovelGroup.add(shovelHandle);

            const shovelHead = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.02), axeHeadMat);
            shovelHead.position.set(0, 0, -0.25);
            shovelHead.rotation.x = Math.PI / 2;
            woodenShovelGroup.add(shovelHead);

            rightHand.add(woodenShovelGroup);
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

            // First Person FOOD Mesh Group
            foodGroup = new THREE.Group();
            foodGroup.position.set(0, 0.05, -0.12);
            foodGroup.rotation.set(0.4, 0, -0.3);
            foodGroup.visible = false;
            rightHand.add(foodGroup);
        }

        function updateHeldFoodVisual(foodType) {
            if (!foodGroup) return;
            // Clear previous geometry/children
            while (foodGroup.children.length > 0) {
                const child = foodGroup.children[0];
                foodGroup.remove(child);
            }
            
            // Depending on the food type, create cool pixel-art/voxel style meshes
            if (foodType === 'porkchop' || foodType === 'cooked_porkchop') {
                const isCooked = foodType === 'cooked_porkchop';
                const meatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xb5651d : 0xff9ebb, roughness: 0.8 });
                const skinMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0x8b4513 : 0xff6a6a, roughness: 0.8 });
                const boneMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xd2b48c : 0xeeeeee, roughness: 0.8 });
                
                const meat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), meatMat);
                meat.position.set(0, 0, 0);
                foodGroup.add(meat);
                
                const skin = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.02, 0.045), skinMat);
                skin.position.set(0, -0.03, 0);
                foodGroup.add(skin);

                const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), boneMat);
                bone.position.set(0, 0.05, 0);
                bone.rotation.z = 0.2;
                foodGroup.add(bone);
            } else if (foodType === 'beef' || foodType === 'cooked_beef') {
                const isCooked = foodType === 'cooked_beef';
                const steakMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0x5c4033 : 0x8b2500, roughness: 0.9 });
                const fatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xcd853f : 0xfffff0, roughness: 0.9 });
                
                const steak = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.04), steakMat);
                steak.position.set(0, 0, 0);
                foodGroup.add(steak);
                
                const fat1 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.095, 0.045), fatMat);
                fat1.position.set(0.03, 0, 0);
                foodGroup.add(fat1);
            } else if (foodType === 'mutton' || foodType === 'cooked_mutton') {
                const isCooked = foodType === 'cooked_mutton';
                const meatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0x8b5a2b : 0xd04040, roughness: 0.8 });
                const fatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xd2b48c : 0xffffff, roughness: 0.8 });
                
                const meat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.04), meatMat);
                meat.position.set(0, 0, 0);
                foodGroup.add(meat);
                
                const fat = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.015, 0.045), fatMat);
                fat.position.set(0, 0.03, 0);
                foodGroup.add(fat);
            } else if (foodType === 'chicken' || foodType === 'cooked_chicken') {
                const isCooked = foodType === 'cooked_chicken';
                const meatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0x8b5a2b : 0xcd853f, roughness: 0.8 });
                const boneMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xd2b48c : 0xffffff, roughness: 0.8 });
                
                const meatPart = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), meatMat);
                meatPart.scale.set(1, 1.4, 1);
                meatPart.position.set(0, 0.01, 0);
                foodGroup.add(meatPart);
                
                const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), boneMat);
                bone.position.set(0, -0.03, 0);
                foodGroup.add(bone);
            } else if (foodType === 'raw_fish' || foodType === 'cooked_fish') {
                const isCooked = foodType === 'cooked_fish';
                const bodyMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xe97451 : 0x4682b4, roughness: 0.5 });
                const bellyMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xffebcd : 0xe0ffff, roughness: 0.5 });
                const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
                
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.1, 0.035), bodyMat);
                body.position.set(0, 0, 0);
                foodGroup.add(body);
                
                const belly = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.04), bellyMat);
                belly.position.set(0.015, 0, 0);
                foodGroup.add(belly);
                
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.006, 4, 4), eyeMat);
                eye.position.set(0.01, 0.035, 0.015);
                foodGroup.add(eye);
            }
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
            opponentGroup.visible = isConnected;
            if (isConnected) {
                scene.add(opponentGroup);
            }

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

        function createPlayerMesh() {
            if (playerMeshGroup) {
                scene.remove(playerMeshGroup);
            }
            playerMeshGroup = new THREE.Group();
            playerMeshGroup.visible = false; // Hidden in FP view by default
            scene.add(playerMeshGroup);

            const skinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.skin), roughness: 0.8 });
            const shirtMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.shirt), roughness: 0.7 });
            const pantsMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.pants), roughness: 0.8 });
            const shoesMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.8 });
            const hairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(myAppearance.hair), roughness: 0.9 });
            const pupilMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(myAppearance.eye) });

            // Torso
            const shirtTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.6, 12), shirtMat);
            shirtTorso.position.y = 1.3;
            shirtTorso.castShadow = true;
            shirtTorso.receiveShadow = true;
            playerMeshGroup.add(shirtTorso);

            const pantsTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.6, 12), pantsMat);
            pantsTorso.position.y = 0.7;
            pantsTorso.castShadow = true;
            pantsTorso.receiveShadow = true;
            playerMeshGroup.add(pantsTorso);

            // Head
            playerHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
            playerHead.position.y = 1.8;
            playerHead.castShadow = true;
            playerMeshGroup.add(playerHead);

            // Eyes
            const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.02), pupilMat);
            eyeL.position.set(-0.075, 0.05, 0.262);
            playerHead.add(eyeL);

            const eyeR = eyeL.clone();
            eyeR.position.x = 0.075;
            playerHead.add(eyeR);

            // Nose
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.07), skinMat);
            nose.position.set(0, -0.02, 0.26);
            playerHead.add(nose);

            // Hair
            const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.40), hairMat);
            hairTop.position.set(0, 0.21, -0.06);
            playerHead.add(hairTop);

            const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.10), hairMat);
            hairBack.position.set(0, 0.01, -0.21);
            playerHead.add(hairBack);

            const hairL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.30), hairMat);
            hairL.position.set(-0.25, 0.05, -0.01);
            playerHead.add(hairL);

            const hairR = hairL.clone();
            hairR.position.x = 0.25;
            playerHead.add(hairR);

            // Left Arm
            playerLArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), skinMat);
            playerLArm.position.set(-0.30, 1.3, 0);
            playerLArm.castShadow = true;
            playerMeshGroup.add(playerLArm);

            const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), shirtMat);
            sleeveL.position.y = 0.18;
            playerLArm.add(sleeveL);

            // Right Arm
            playerRArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), skinMat);
            playerRArm.position.set(0.30, 1.3, 0);
            playerRArm.castShadow = true;
            playerMeshGroup.add(playerRArm);

            const sleeveR = sleeveL.clone();
            playerRArm.add(sleeveR);

            // Left Leg
            playerLLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), skinMat);
            playerLLeg.position.set(-0.11, 0.4, 0);
            playerLLeg.castShadow = true;
            playerMeshGroup.add(playerLLeg);

            const shortsL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.4, 0.17), pantsMat);
            shortsL.position.y = 0.2;
            playerLLeg.add(shortsL);

            const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.12, 0.22), shoesMat);
            shoeL.position.set(0, -0.4, 0.03);
            playerLLeg.add(shoeL);

            // Right Leg
            playerRLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), skinMat);
            playerRLeg.position.set(0.11, 0.4, 0);
            playerRLeg.castShadow = true;
            playerMeshGroup.add(playerRLeg);

            const shortsR = shortsL.clone();
            playerRLeg.add(shortsR);

            const shoeR = shoeL.clone();
            shoeR.position.set(0, -0.4, 0.03);
            playerRLeg.add(shoeR);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Input Keyboard Listeners
        function onKeyDown(event) {
            // Ignore game keys if typing in an input/textarea field
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                return;
            }
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

            if (chestUIOpen) {
                if (event.code === 'KeyE') {
                    closeChestUI();
                }
                return;
            }

            if (furnaceUIOpen) {
                if (event.code === 'KeyE') {
                    closeFurnaceUI();
                }
                return;
            }

            if (inventoryOpen) {
                if (event.code === 'KeyE') {
                    event.preventDefault();
                    toggleInventoryOverlay();
                }
                return;
            }
            
            // Map Screen toggle
            if (event.code === 'KeyN') {
                toggleMapOverlay();
                return;
            }

            // Eating Food Input
            if (event.code === 'KeyM') {
                if (!gameActive || myHealth <= 0 || mapOpen || inventoryOpen || chatOpen) return;
                
                const currentItem = hotbarItems[selectedHotbarIndex];
                if (currentItem && ['porkchop', 'beef', 'mutton', 'chicken', 'raw_fish', 'cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'cooked_chicken', 'cooked_fish'].includes(currentItem)) {
                    if (hunger >= 100) {
                        addChatMessage("Your hunger bar is already full!", "system");
                        return;
                    }
                    if (!isEating) {
                        isEating = true;
                        eatingTimer = 0;
                        eatingSoundTimer = 0.24; // chew almost immediately
                        eatingItem = currentItem;
                    }
                } else {
                    addChatMessage("Hold food in your hand and hold [M] to eat!", "system");
                }
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
                    moveForces.jump = true;
                    if (isGrounded && gameActive && myHealth > 0 && !mapOpen && !inventoryOpen) {
                        velocity.y = 6.2; // Jump impulse
                        isGrounded = false;
                        if (currentGameMode !== 'freedom') {
                            hunger = Math.max(0, hunger - 2); // Jump decays hunger!
                        }
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
                case 'KeyQ':
                    handleDropItem();
                    break;
                case 'KeyR':
                    handleKeyPressR();
                    break;
                case 'KeyF':
                    handleKeyPressF();
                    break;
                case 'KeyE':
                    event.preventDefault();
                    if (handleKeyEInteraction()) {
                        break;
                    }
                    toggleInventoryOverlay();
                    break;
                case 'KeyI':
                    toggleControlsHelp();
                    break;
            }
        }

        function handleDropItem() {
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen || inventoryOpen) return;
            const dropItemType = hotbarItems[selectedHotbarIndex];
            if (dropItemType) {
                const dur = hotbarDurability[selectedHotbarIndex];
                hotbarCounts[selectedHotbarIndex]--;
                
                const lookDir = new THREE.Vector3();
                camera.getWorldDirection(lookDir);
                
                const lookXZ = new THREE.Vector2(lookDir.x, lookDir.z).normalize();
                const dropPos = new THREE.Vector3(
                    camera.position.x + lookXZ.x * 5.0,
                    camera.position.y - 0.5,
                    camera.position.z + lookXZ.y * 5.0
                );
                
                const groundY = getTerrainHeight(dropPos.x, dropPos.z, playerInCave);
                if (dropPos.y < groundY + 0.3) {
                    dropPos.y = groundY + 0.3;
                }
                
                spawnDroppedFood(dropItemType, dropPos, 1.0, dur);
                
                if (hotbarCounts[selectedHotbarIndex] <= 0) {
                    hotbarItems[selectedHotbarIndex] = null;
                    hotbarCounts[selectedHotbarIndex] = 0;
                    hotbarDurability[selectedHotbarIndex] = null;
                    selectHotbarSlot(selectedHotbarIndex);
                } else {
                    updateHotbarUI();
                }
                
                AudioSynth.playWhoosh();
            }
        }

        function onKeyUp(event) {
            // Ignore game keys if typing in an input/textarea field
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                return;
            }
            if (event.key === 'Escape' || event.code === 'Escape') {
                if (ignoreNextEscKeyUp) {
                    ignoreNextEscKeyUp = false;
                    return;
                }
                if (justExitedPointerLock) {
                    return;
                }
                const pauseMenu = document.getElementById('pause-menu');
                const prompt = document.getElementById('click-lock-prompt');
                const ingameSettings = document.getElementById('in-game-settings-screen');
                
                if (gameActive && myHealth > 0 && oppHealth > 0) {
                    // 1. If in-game settings are open, go back to pause menu
                    if (ingameSettings && ingameSettings.style.display === 'flex') {
                        ingameSettings.style.display = 'none';
                        if (pauseMenu) pauseMenu.style.display = 'flex';
                        return;
                    }
                    
                    // 2. If pause menu is open, resume the game
                    if (pauseMenu && pauseMenu.style.display === 'flex') {
                        requestPointerLock();
                        pauseMenu.style.display = 'none';
                        return;
                    }
                    
                    // 3. Otherwise, if pointer is not locked and no overlays are open, go to pause menu
                    if (!document.pointerLockElement && !chatOpen && !mapOpen && !inventoryOpen && !furnaceUIOpen && !chestUIOpen) {
                        if (pauseMenu) pauseMenu.style.display = 'flex';
                        if (prompt) prompt.style.display = 'none';
                        return;
                    }
                }
            }
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
                case 'Space':
                    moveForces.jump = false;
                    break;
                case 'KeyM':
                    if (isEating) {
                        isEating = false;
                        if (rightHand) {
                            rightHand.position.set(0.35, -0.3, -0.7);
                            rightHand.rotation.set(0, 0, 0);
                        }
                    }
                    break;
            }
        }

        // Mouse click triggers active weapon when locked
        window.addEventListener('mousedown', (e) => {
            if (isEating) return;
            if (gameActive && myHealth > 0 && isLocked && !mapOpen && !chatOpen && !inventoryOpen) {
                const aimedBench = getCraftingBenchAimTarget();
                if (aimedBench) {
                    e.preventDefault();
                    toggleInventoryOverlay();
                    return;
                }

                if (e.button === 0) { // Left click
                    const item = hotbarItems[selectedHotbarIndex];
                    
                    const aimedObj = getPlacedObjectAimTarget();
                    if (aimedObj && aimedObj.type === 'door') {
                        if (item && ['wooden_axe', 'wooden_sword', 'wooden_pickaxe', 'stone_axe', 'stone_sword', 'stone_pickaxe', 'wooden_shovel', 'stone_shovel', 'iron_shovel', 'copper_axe', 'copper_sword', 'copper_pickaxe', 'copper_shovel'].includes(item)) {
                            aimedObj.hits = (aimedObj.hits || 0) + 1;
                            AudioSynth.playHit(aimedObj.pos);
                            updatePlacedObjectCracks(aimedObj);
                            if (aimedObj.hits >= 3) {
                                minePlacedObject(aimedObj);
                            }
                        } else {
                            aimedObj.isOpen = !aimedObj.isOpen;
                            aimedObj.mesh.rotation.y = aimedObj.initialRotationY + (aimedObj.isOpen ? Math.PI / 2 : 0);
                            AudioSynth.playHit(aimedObj.pos);
                        }
                        return;
                    }
                    
                    isMouseDown = true;
                    mouseDownStartTime = Date.now();
                    choppingTreeTarget = getTreeAimTarget();
 
                    if (inTurret) {
                        triggerTurretShoot();
                    } else if (item === 'bow') {
                        triggerBowShoot();
                    } else if (item === 'flint_and_steel') {
                        const now = Date.now();
                        if (now - lastWeaponSwingTime >= 400) {
                            triggerWeaponSwing(item);
                            lastWeaponSwingTime = now;
                            
                            const aimedObj = getPlacedObjectAimTarget();
                            const aimedTree = getTreeAimTarget();
                            
                            if (aimedObj && aimedObj.type === 'tnt') {
                                igniteTnt(aimedObj);
                                useToolInHand();
                            } else if (aimedObj && aimedObj.type === 'unlit_campfire') {
                                aimedObj.type = 'campfire';
                                aimedObj.burnTimeLeft = 60.0;
                                addCampfireFireMesh(aimedObj);
                                AudioSynth.playHit(aimedObj.pos);
                                if (isConnected) {
                                    sendNetworkMessage({
                                        type: 'light-campfire',
                                        x: aimedObj.pos.x,
                                        y: aimedObj.pos.y,
                                        z: aimedObj.pos.z
                                    });
                                }
                                saveWorld(false);
                                useToolInHand();
                            } else if (aimedObj && aimedObj.type === 'campfire') {
                                aimedObj.burnTimeLeft = 60.0;
                                AudioSynth.playHit(aimedObj.pos);
                                if (isConnected) {
                                    sendNetworkMessage({
                                        type: 'light-campfire',
                                        x: aimedObj.pos.x,
                                        y: aimedObj.pos.y,
                                        z: aimedObj.pos.z
                                    });
                                }
                                useToolInHand();
                            } else if (aimedTree && !aimedTree.isBurning && !aimedTree.isChopped && !aimedTree.isBurned) {
                                startTreeBurning(aimedTree);
                                useToolInHand();
                            } else {
                                const placePos = getGroundIntersectPoint(6.0);
                                if (placePos) {
                                    const fireBelow = placedObjects.some(obj => 
                                        obj.type === 'fire' &&
                                        Math.abs(obj.pos.x - placePos.x) < 0.1 &&
                                        Math.abs(obj.pos.z - placePos.z) < 0.1 &&
                                        Math.abs((obj.pos.y + 0.9) - placePos.y) < 0.1
                                    );
                                    const fireAt = placedObjects.some(obj => 
                                        obj.type === 'fire' &&
                                        Math.abs(obj.pos.x - placePos.x) < 0.1 &&
                                        Math.abs(obj.pos.z - placePos.z) < 0.1 &&
                                        Math.abs(obj.pos.y - placePos.y) < 0.1
                                    );
                                    if (!fireBelow && !fireAt) {
                                        spawnPlacedObject('fire', placePos, true);
                                        AudioSynth.playHit(placePos);
                                        saveWorld(false);
                                        useToolInHand();
                                    }
                                }
                            }
                        }
                        return;
                    } else if (item && ['log', 'planks', 'crafting_bench', 'stone', 'smooth_stone', 'stone_cutter', 'boat', 'stone_stairs', 'stone_slab', 'wooden_stairs', 'door', 'ladder', 'wool', 'bed', 'furnace', 'chest', 'sand', 'tnt', 'unlit_campfire'].includes(item)) {
                        const placed = tryPlaceBlock();
                        if (placed) return;
                        triggerWeaponSwing(item);
                    } else if (item && ['wooden_axe', 'wooden_sword', 'wooden_pickaxe', 'stone_sword', 'stone_pickaxe', 'stone_axe', 'iron_sword', 'iron_pickaxe', 'iron_axe', 'wooden_shovel', 'stone_shovel', 'iron_shovel', 'copper_sword', 'copper_pickaxe', 'copper_axe', 'copper_shovel'].includes(item)) {
                        const now = Date.now();
                        if (now - lastWeaponSwingTime >= 400) {
                            triggerWeaponSwing(item);
                            const aimedObj = getPlacedObjectAimTarget();
                            if (aimedObj) {
                                aimedObj.hits = (aimedObj.hits || 0) + 1;
                                AudioSynth.playHit(aimedObj.pos);
                                updatePlacedObjectCracks(aimedObj);
                                if (aimedObj.hits >= 3) {
                                    minePlacedObject(aimedObj);
                                }
                            } else if (item.endsWith('_axe')) {
                                const aimedTree = getTreeAimTarget();
                                if (aimedTree) {
                                    if (aimedTree.isChopped) {
                                        harvestLog(aimedTree);
                                    } else {
                                        aimedTree.chopClicks = (aimedTree.chopClicks || 0) + 1;
                                        AudioSynth.playHit(aimedTree.group.position);
                                        aimedTree.lastHitTime = Date.now();
                                        if (aimedTree.chopClicks >= 3) {
                                            chopTreeDown(aimedTree);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (item && ['porkchop', 'beef', 'mutton', 'chicken'].includes(item)) {
                        triggerEatFood();
                    } else {
                        triggerWeaponSwing(item || 'fists');
                    }
                } else if (e.button === 2) { // Right click
                    e.preventDefault();
                    triggerKick();
                }
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                isMouseDown = false;
                choppingTreeTarget = null;
            }
        });

        // Block context menus when pointer locked to allow right click kicks
        window.addEventListener('contextmenu', (e) => {
            if (isLocked) {
                e.preventDefault();
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
                if (command === '/night' || command === '/day' || command === '/tp' || command === '/weather') {
                    if (!cheatsEnabled) {
                         addChatMessage("Cheats are disabled in this world!", "system");
                         elChatInput.value = '';
                         toggleChat();
                         return;
                    }
                }
                if (command === '/night') {
                    triggerNightCommand();
                } else if (command === '/day') {
                    triggerDayCommand();
                } else if (command === '/weather') {
                    const wType = parts[1] ? parts[1].toLowerCase() : '';
                    if (['clear', 'rain', 'thunder'].includes(wType)) {
                        setWeather(wType);
                        if (isHost && isConnected) {
                            sendNetworkMessage({ type: 'weather-sync', weather: currentWeather });
                        }
                        addChatMessage("Weather set to " + wType + ".", "system");
                    } else {
                        addChatMessage("Usage: /weather [clear|rain|thunder]", "system");
                    }
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
                        quantum: { x: 2000, z: 0 },
                        rocky: { x: 420, z: 50 },
                        reef: { x: 0, z: -480 },
                        pine2: { x: 350, z: 650 },
                        pinecone2: { x: 350, z: 650 },
                        secondpine: { x: 350, z: 650 },
                        secondpinecone: { x: 350, z: 650 },
                        mushroom: { x: 520, z: 650 },
                        mushroomisland: { x: 520, z: 650 }
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
                        
                        playerInCave = false;
                        const tx = coords.x;
                        const tz = coords.z;
                         const ty = getTerrainHeight(tx, tz, false) + 1.6;
                         camera.position.set(tx, ty, tz);
                         highestYSinceGrounded = camera.position.y;
                         velocity.set(0, 0, 0); // Reset speed
                        
                        // Immediately sync position
                        sendNetworkMessage({
                            type: 'pos-sync',
                            x: tx,
                            y: ty - 1.6,
                            z: tz,
                            ry: camera.rotation.y,
                            inCave: false
                        });
                        
                        addChatMessage("Teleported to " + loc + " (" + tx + ", " + tz + ").", "system");
                    } else {
                        addChatMessage("Usage: /tp [dunes|forest|cherry|mountain|savanna|quantum|rocky|reef|pine2|mushroom]", "system");
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

        function triggerDayCommand() {
            const totalCycleMs = CYCLE_DURATION * 1000;
            const currentMs = Date.now() % totalCycleMs;
            const targetMs = 30000; // 30s start of daytime
            
            const diff = (targetMs - currentMs + totalCycleMs) % totalCycleMs;
            timeOffset += diff;
            
            sendNetworkMessage({ type: 'time-sync', offset: timeOffset });
            addChatMessage("Time set to day via command.", "system");
        }

        // Make addChatMessage globally available for network events
        function addChatMessage(text, type) {
            const elChatLog = document.getElementById('chat-log');
            if (!elChatLog) return;
            
            const msgEl = document.createElement('div');
            msgEl.className = `chat-msg ${type}`;
            
            let prefix = "";
            if (type === 'system') prefix = "[System] ";
            else if (type === 'local') prefix = `[${myAppearance.name || 'You'}] `;
            else if (type === 'opponent') prefix = `[${opponentAppearance.name || 'Opponent'}] `;
            
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

        function updateFPToolMaterial(mesh, itemType) {
            if (!mesh || !itemType) return;
            
            let color = 0x5c4033; // wood (default)
            let metalness = 0.1;
            let roughness = 0.9;
            
            if (itemType.startsWith('stone_')) {
                color = 0x888888;
                metalness = 0.1;
                roughness = 0.8;
            } else if (itemType.startsWith('copper_')) {
                color = 0xe88d72;
                metalness = 0.8;
                roughness = 0.2;
            } else if (itemType.startsWith('iron_')) {
                color = 0xa34f40;
                metalness = 0.8;
                roughness = 0.2;
            }
            
            if (mesh.material) {
                mesh.material.color.setHex(color);
                mesh.material.metalness = metalness;
                mesh.material.roughness = roughness;
                mesh.material.needsUpdate = true;
            }
        }

        function updateWeaponUI() {
            const currentItem = hotbarItems[selectedHotbarIndex];
            let displayName = "EMPTY HAND";
            if (currentItem) {
                displayName = ITEM_NAMES[currentItem] || currentItem.toUpperCase();
            } else if (activeWeapon === 'fists') {
                displayName = "FISTS";
            }
            document.getElementById('active-weapon-name').innerText = displayName.toUpperCase();
            
            // Adjust FP visible meshes
            if (activeWeapon === 'bow') {
                if (bowGroup) bowGroup.visible = true;
                if (woodenAxeGroup) woodenAxeGroup.visible = false;
                if (woodenSwordGroup) woodenSwordGroup.visible = false;
                if (woodenPickaxeGroup) woodenPickaxeGroup.visible = false;
                if (woodenShovelGroup) woodenShovelGroup.visible = false;
                rightHand.visible = false;
                leftHand.visible = false;
            } else if (activeWeapon === 'wooden_axe') {
                if (bowGroup) bowGroup.visible = false;
                if (woodenAxeGroup) {
                    woodenAxeGroup.visible = true;
                    if (woodenAxeGroup.children[1]) {
                        updateFPToolMaterial(woodenAxeGroup.children[1], currentItem);
                    }
                }
                if (woodenSwordGroup) woodenSwordGroup.visible = false;
                if (woodenPickaxeGroup) woodenPickaxeGroup.visible = false;
                if (woodenShovelGroup) woodenShovelGroup.visible = false;
                rightHand.visible = true;
                leftHand.visible = true;
            } else if (activeWeapon === 'wooden_sword') {
                if (bowGroup) bowGroup.visible = false;
                if (woodenAxeGroup) woodenAxeGroup.visible = false;
                if (woodenSwordGroup) {
                    woodenSwordGroup.visible = true;
                    if (woodenSwordGroup.children[2]) {
                        updateFPToolMaterial(woodenSwordGroup.children[2], currentItem);
                    }
                }
                if (woodenPickaxeGroup) woodenPickaxeGroup.visible = false;
                if (woodenShovelGroup) woodenShovelGroup.visible = false;
                rightHand.visible = true;
                leftHand.visible = true;
            } else if (activeWeapon === 'wooden_pickaxe') {
                if (bowGroup) bowGroup.visible = false;
                if (woodenAxeGroup) woodenAxeGroup.visible = false;
                if (woodenSwordGroup) woodenSwordGroup.visible = false;
                if (woodenPickaxeGroup) {
                    woodenPickaxeGroup.visible = true;
                    if (woodenPickaxeGroup.children[1]) {
                        updateFPToolMaterial(woodenPickaxeGroup.children[1], currentItem);
                    }
                }
                if (woodenShovelGroup) woodenShovelGroup.visible = false;
                rightHand.visible = true;
                leftHand.visible = true;
            } else if (activeWeapon === 'wooden_shovel') {
                if (bowGroup) bowGroup.visible = false;
                if (woodenAxeGroup) woodenAxeGroup.visible = false;
                if (woodenSwordGroup) woodenSwordGroup.visible = false;
                if (woodenPickaxeGroup) woodenPickaxeGroup.visible = false;
                if (woodenShovelGroup) {
                    woodenShovelGroup.visible = true;
                    if (woodenShovelGroup.children[1]) {
                        updateFPToolMaterial(woodenShovelGroup.children[1], currentItem);
                    }
                }
                rightHand.visible = true;
                leftHand.visible = true;
            } else {
                if (bowGroup) bowGroup.visible = false;
                if (woodenAxeGroup) woodenAxeGroup.visible = false;
                if (woodenSwordGroup) woodenSwordGroup.visible = false;
                if (woodenPickaxeGroup) woodenPickaxeGroup.visible = false;
                if (woodenShovelGroup) woodenShovelGroup.visible = false;
                rightHand.visible = true;
                leftHand.visible = true;
            }

            // Update held food visual and visibility
            const isFood = currentItem && ['porkchop', 'beef', 'mutton', 'chicken', 'raw_fish', 'cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'cooked_chicken', 'cooked_fish'].includes(currentItem);
            if (isFood) {
                updateHeldFoodVisual(currentItem);
                if (foodGroup) foodGroup.visible = true;
            } else {
                if (foodGroup) foodGroup.visible = false;
            }
        }

        const WEAPON_SWING_COOLDOWN = 400;

        function triggerWeaponSwing(weaponType) {
            if (isEating) return;
            if (!gameActive || myHealth <= 0 || inTurret) return;
            const now = Date.now();
            if (now - lastWeaponSwingTime < WEAPON_SWING_COOLDOWN) return;
            lastWeaponSwingTime = now;

            localPunching = true;
            localPunchTimer = 0;

            AudioSynth.playWhoosh();

            // Notify opponent of swing
            sendNetworkMessage({ type: 'punch-trigger' });

            let dmg = 5;
            let range = 4.0;
            let knockback = 10.0;

            if (weaponType === 'wooden_sword') {
                dmg = 12;
                range = 4.4;
                knockback = 14.0;
            } else if (weaponType === 'wooden_axe') {
                dmg = 10;
                range = 4.2;
                knockback = 12.0;
            } else if (weaponType === 'wooden_pickaxe') {
                dmg = 9;
                range = 4.0;
                knockback = 11.0;
            } else if (weaponType === 'stone_sword') {
                dmg = 15;
                range = 4.5;
                knockback = 15.0;
            } else if (weaponType === 'stone_axe') {
                dmg = 13;
                range = 4.3;
                knockback = 13.0;
            } else if (weaponType === 'stone_pickaxe') {
                dmg = 11;
                range = 4.1;
                knockback = 11.0;
            } else if (weaponType === 'iron_sword') {
                dmg = 20;
                range = 4.6;
                knockback = 16.0;
            } else if (weaponType === 'iron_axe') {
                dmg = 16;
                range = 4.4;
                knockback = 14.0;
            } else if (weaponType === 'iron_pickaxe') {
                dmg = 14;
                range = 4.2;
                knockback = 12.0;
            } else if (weaponType === 'wooden_shovel') {
                dmg = 8;
                range = 4.0;
                knockback = 10.0;
            } else if (weaponType === 'stone_shovel') {
                dmg = 10;
                range = 4.1;
                knockback = 11.0;
            } else if (weaponType === 'copper_shovel') {
                dmg = 10;
                range = 4.1;
                knockback = 11.0;
            } else if (weaponType === 'iron_shovel') {
                dmg = 12;
                range = 4.2;
                knockback = 12.0;
            } else if (weaponType === 'copper_sword') {
                dmg = 15;
                range = 4.5;
                knockback = 15.0;
            } else if (weaponType === 'copper_axe') {
                dmg = 13;
                range = 4.3;
                knockback = 13.0;
            } else if (weaponType === 'copper_pickaxe') {
                dmg = 11;
                range = 4.1;
                knockback = 11.0;
            }

            checkHit(range, dmg, knockback);
            useToolInHand();
        }

        function startTreeBurning(tree) {
            if (tree.isBurning || tree.isBurned) return;
            tree.isBurning = true;
            tree.burnProgress = 0.0;
            
            // Clone trunk material so we only color this trunk
            if (tree.trunk && tree.trunk.material) {
                tree.trunk.material = tree.trunk.material.clone();
                tree.trunk.userData.originalColor = tree.trunk.material.color.getHex();
            }
            
            // Clone leaves materials
            if (tree.leaves) {
                tree.leaves.forEach(leaf => {
                    if (leaf.material) {
                        leaf.material = leaf.material.clone();
                        leaf.material.transparent = true;
                    }
                });
            }
            
            // Create animated flame group
            const fireGroup = new THREE.Group();
            fireGroup.name = 'treeFlames';
            
            const cubes = [];
            for (let i = 0; i < 10; i++) {
                const size = 0.12 + Math.random() * 0.22;
                const mat = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.6 ? 0xffea00 : (Math.random() > 0.3 ? 0xff5500 : 0xffffff),
                    toneMapped: false
                });
                const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
                cube.position.set(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 3.5,
                    (Math.random() - 0.5) * 0.5
                );
                fireGroup.add(cube);
                cubes.push({
                    mesh: cube,
                    initialY: cube.position.y,
                    speed: 0.6 + Math.random() * 0.8,
                    offsetX: (Math.random() - 0.5) * 0.4,
                    offsetZ: (Math.random() - 0.5) * 0.4
                });
            }
            fireGroup.userData = { cubes: cubes };
            tree.group.add(fireGroup);
            
            // Add a warm point light to the tree
            const light = new THREE.PointLight(0xff5500, 1.2, 15.0);
            light.name = 'treeLight';
            light.position.y = 1.75;
            tree.group.add(light);
            
            AudioSynth.playHit(tree.group.position);
            
            if (isConnected) {
                sendNetworkMessage({
                    type: 'tree-burn-start',
                    x: tree.x,
                    z: tree.z
                });
            }
        }

        function addCampfireFireMesh(obj) {
            // Remove existing flames if any
            const existingFlames = obj.mesh.getObjectByName('campfireFlames');
            if (existingFlames) obj.mesh.remove(existingFlames);
            const existingLight = obj.mesh.getObjectByName('campfireLight');
            if (existingLight) obj.mesh.remove(existingLight);

            const fireGroup = new THREE.Group();
            fireGroup.name = 'campfireFlames';
            
            const cubes = [];
            for (let i = 0; i < 7; i++) {
                const size = 0.1 + Math.random() * 0.15;
                const mat = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.6 ? 0xffea00 : (Math.random() > 0.3 ? 0xff5500 : 0xffffff),
                    toneMapped: false
                });
                const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
                cube.position.set((Math.random() - 0.5) * 0.25, 0.15 + Math.random() * 0.4, (Math.random() - 0.5) * 0.25);
                fireGroup.add(cube);
                cubes.push({
                    mesh: cube,
                    initialY: cube.position.y,
                    speed: 0.4 + Math.random() * 0.6,
                    offsetX: (Math.random() - 0.5) * 0.2,
                    offsetZ: (Math.random() - 0.5) * 0.2
                });
            }
            fireGroup.userData = { cubes: cubes };
            obj.mesh.add(fireGroup);
            
            const light = new THREE.PointLight(0xff7700, 1.2, 12.0);
            light.name = 'campfireLight';
            light.position.y = 0.4;
            obj.mesh.add(light);
        }

        function updateWorldTrees(delta) {
            const now = Date.now();
            const elapsedSeconds = now * 0.001;
            worldTrees.forEach(tree => {
                // 1. Shaking animation
                if (tree.lastHitTime && now - tree.lastHitTime < 300) {
                    const elapsed = (now - tree.lastHitTime) / 300;
                    const shakeAngle = Math.sin(now * 0.08) * 0.04 * (1.0 - elapsed);
                    tree.group.rotation.z = shakeAngle;
                } else if (!tree.isChopped) {
                    tree.group.rotation.z = 0; // Reset
                }
                
                // 2. Felling animation
                if (tree.isFelling) {
                    tree.fellProgress += delta * 2.0; // tip over in 0.5s
                    if (tree.fellProgress >= 1.0) {
                        tree.fellProgress = 1.0;
                        tree.isFelling = false;
                    }
                    tree.group.rotation.set(0, 0, 0); // reset first
                    tree.group.rotation.y = tree.fallAngle;
                    tree.group.rotation.x = (Math.PI / 2) * tree.fellProgress;
                }
                
                // 2b. Burning animation
                if (tree.isBurning) {
                    if (tree.burnProgress === undefined) tree.burnProgress = 0;
                    tree.burnProgress += delta * 0.08; // takes 12.5 seconds to burn down
                    
                    // Fade/shrink leaves
                    if (tree.leaves) {
                        const scale = Math.max(0, 1.0 - tree.burnProgress);
                        tree.leaves.forEach(leaf => {
                            leaf.scale.set(scale, scale, scale);
                            if (leaf.material) {
                                leaf.material.opacity = scale;
                            }
                            if (tree.burnProgress >= 1.0) {
                                leaf.visible = false;
                            }
                        });
                    }
                    
                    // Blacken trunk
                    if (tree.trunk && tree.trunk.material) {
                        const origColor = new THREE.Color(tree.trunk.userData.originalColor !== undefined ? tree.trunk.userData.originalColor : 0x3d2314);
                        tree.trunk.material.color.copy(origColor).lerp(new THREE.Color(0x111111), tree.burnProgress);
                    }
                    
                    // Animate flames on tree
                    const flames = tree.group.getObjectByName('treeFlames');
                    if (flames && flames.userData && flames.userData.cubes) {
                        flames.userData.cubes.forEach(c => {
                            c.mesh.position.y += delta * c.speed;
                            c.mesh.position.x += Math.sin(elapsedSeconds * 5.0 + c.initialY) * 0.05 * delta;
                            c.mesh.position.z += Math.cos(elapsedSeconds * 5.0 + c.initialY) * 0.05 * delta;
                            if (c.mesh.position.y > 3.8) {
                                c.mesh.position.y = 0.1;
                                c.mesh.position.x = c.offsetX;
                                c.mesh.position.z = c.offsetZ;
                                c.mesh.scale.set(1, 1, 1);
                            } else {
                                const h = c.mesh.position.y / 3.8;
                                const s = Math.max(0.1, 1.0 - h);
                                c.mesh.scale.set(s, s, s);
                            }
                        });
                    }
                    
                    // Flicker tree light
                    const light = tree.group.getObjectByName('treeLight');
                    if (light) {
                        light.intensity = 1.2 + Math.sin(elapsedSeconds * 15.0) * 0.25;
                    }
                    
                    if (tree.burnProgress >= 1.0) {
                        tree.isBurning = false;
                        tree.isBurned = true;
                        
                        // Clean up flames and light
                        if (flames) tree.group.remove(flames);
                        const light = tree.group.getObjectByName('treeLight');
                        if (light) tree.group.remove(light);
                        
                        // Make trunk completely black and keep scale
                        if (tree.trunk && tree.trunk.material) {
                            tree.trunk.material.color.setHex(0x111111);
                        }
                    }
                }
                
                // 3. Leaf rotting
                if (tree.isChopped && !tree.isFelling && tree.fellProgress >= 1.0 && !tree.isBurned) {
                    if (!tree.rotProgress) {
                        tree.leaves.forEach(leaf => {
                            if (leaf.material) {
                                leaf.material = leaf.material.clone();
                                leaf.material.transparent = true;
                            }
                        });
                        tree.rotProgress = 0.0001;
                    }
                    if (tree.rotProgress > 0 && tree.rotProgress < 1.0) {
                        tree.rotProgress += delta * 0.067; // rot in 15 seconds
                        if (tree.rotProgress > 1.0) tree.rotProgress = 1.0;
                        const scale = 1.0 - tree.rotProgress;
                        const originalColorHex = 0x0f3b1e;
                        const brownColor = new THREE.Color(0x5c4033);
                        tree.leaves.forEach(leaf => {
                            if (leaf.material && leaf.material.color) {
                                const origColor = new THREE.Color(leaf.userData.originalColor !== undefined ? leaf.userData.originalColor : originalColorHex);
                                leaf.material.color.copy(origColor).lerp(brownColor, tree.rotProgress);
                                leaf.material.opacity = 1.0 - tree.rotProgress;
                            }
                            leaf.scale.set(scale, scale, scale);
                            if (tree.rotProgress >= 1.0) {
                                leaf.visible = false;
                            }
                        });
                    }
                }
            });
        }

        function getTreeAimTarget() {
            const myX = camera.position.x;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            const lookDirXZ = new THREE.Vector2(lookDir.x, lookDir.z).normalize();

            let bestTree = null;
            let bestDist = Infinity;

            for (const tree of worldTrees) {
                if (tree.isChopped) {
                    // Fallen log: check 5 points along the remaining log length
                    const L = 3.5 * (tree.logsLeft / 4);
                    const vx = Math.cos(tree.fallAngle) * L;
                    const vz = Math.sin(tree.fallAngle) * L;
                    
                    let matched = false;
                    let minPointDist = Infinity;
                    
                    for (let i = 0; i <= 4; i++) {
                        const t = i / 4;
                        const px = tree.x + vx * t;
                        const pz = tree.z + vz * t;
                        
                        const dx = px - myX;
                        const dz = pz - myZ;
                        const distXZ = Math.sqrt(dx * dx + dz * dz);
                        
                        if (distXZ < 5.0) {
                            const toPointXZ = new THREE.Vector2(dx, dz).normalize();
                            const dot = lookDirXZ.dot(toPointXZ);
                            if (dot > 0.82) {
                                matched = true;
                                if (distXZ < minPointDist) {
                                    minPointDist = distXZ;
                                }
                            }
                        }
                    }
                    
                    if (matched && minPointDist < bestDist) {
                        bestDist = minPointDist;
                        bestTree = tree;
                    }
                } else {
                    // Standing tree: check base
                    const dx = tree.x - myX;
                    const dz = tree.z - myZ;
                    const distXZ = Math.sqrt(dx * dx + dz * dz);
                    if (distXZ < 5.0) {
                        const toTreeXZ = new THREE.Vector2(dx, dz).normalize();
                        const dot = lookDirXZ.dot(toTreeXZ);
                        if (dot > 0.82) {
                            if (distXZ < bestDist) {
                                bestDist = distXZ;
                                bestTree = tree;
                            }
                        }
                    }
                }
            }
            return bestTree;
        }

        function getStoneAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestStone = null;
            let bestDist = Infinity;
            
            worldStones.forEach(stone => {
                if (stone.mesh.visible === false) return;
                
                const dx = stone.x - myX;
                // Adjust Y aimed target to match the flat profile of embedded stones
                const dy = (stone.y + 0.1) - myY;
                const dz = stone.z - myZ;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (dist < 5.0) {
                    const toStone = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toStone);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestStone = stone;
                        }
                    }
                }
            });
            return bestStone;
        }
        
        function getCoralAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestCoral = null;
            let bestDist = Infinity;
            
            worldCorals.forEach(coral => {
                if (coral.mesh.visible === false) return;
                
                const dx = coral.x - myX;
                const dy = (coral.y + 0.3) - myY;
                const dz = coral.z - myZ;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (dist < 5.0) {
                    const toCoral = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toCoral);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestCoral = coral;
                        }
                    }
                }
            });
            return bestCoral;
        }
        
        function mineNaturalStone(stone, sendNetwork = true) {
            const coordKey = `${stone.x.toFixed(1)},${stone.z.toFixed(1)}`;
            minedStoneCoords.add(coordKey);
            
            stone.mesh.visible = false;
            updateTerrainMeshNear(stone.x, stone.z);
            AudioSynth.playHit(stone.mesh.position);
            
            const spawnPos = stone.mesh.position.clone();
            spawnPos.y += 0.3;
            
            if (stone.type === 'limestone') {
                spawnDroppedFood('limestone', spawnPos, 2.0);
                addChatMessage("Mined limestone!", "system");
            } else if (stone.type === 'coal_ore') {
                spawnDroppedFood('coal', spawnPos, 2.0);
                addChatMessage("Mined coal!", "system");
            } else if (stone.type === 'iron_ore') {
                spawnDroppedFood('raw_iron', spawnPos, 2.0);
                addChatMessage("Mined raw iron!", "system");
            } else if (stone.type === 'copper_ore') {
                spawnDroppedFood('raw_copper', spawnPos, 2.0);
                addChatMessage("Mined raw copper!", "system");
            }
            
            if (sendNetwork && isConnected) {
                sendNetworkMessage({
                    type: 'mine-stone',
                    x: stone.x,
                    z: stone.z
                });
            }
            if (isHost) {
                saveWorld(false);
            }
        }
        
        function mineNaturalCoral(coral, sendNetwork = true) {
            const coordKey = `${coral.x.toFixed(1)},${coral.z.toFixed(1)}`;
            minedCoralCoords.add(coordKey);
            
            coral.mesh.visible = false;
            AudioSynth.playHit(coral.mesh.position);
            
            // Spawn dropped coral item
            const spawnPos = coral.mesh.position.clone();
            spawnPos.y += 0.3;
            spawnDroppedFood('coral', spawnPos);
            
            addChatMessage("Mined coral!", "system");
            
            if (sendNetwork && isConnected) {
                sendNetworkMessage({
                    type: 'mine-coral',
                    x: coral.x,
                    z: coral.z
                });
            }
            if (isHost) {
                saveWorld(false);
            }
        }

        function chopTreeDown(tree, sendNetwork = true) {
            const coordKey = `${tree.x.toFixed(1)},${tree.z.toFixed(1)}`;
            choppedTreeCoords.add(coordKey);
            
            tree.isChopped = true;
            if (tree.isMushroom) {
                tree.logsLeft = 3;
                
                // Spawn 3 to 5 mushroom cap items around
                const capColors = {
                    0xeeb808: 'yellow_mushroom',
                    0x151515: 'black_mushroom',
                    0x228b22: 'green_mushroom',
                    0xd93838: 'red_mushroom'
                };
                const shroomItem = capColors[tree.mushroomColor] || 'red_mushroom';
                const count = 3 + Math.floor(Math.random() * 3);
                
                for (let j = 0; j < count; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 1.0 + Math.random() * 2.0;
                    const spawnPos = new THREE.Vector3().copy(tree.group.position);
                    spawnPos.x += Math.cos(angle) * r;
                    spawnPos.z += Math.sin(angle) * r;
                    spawnPos.y += 0.3;
                    spawnDroppedFood(shroomItem, spawnPos);
                }
            } else {
                tree.logsLeft = 4;
            }

            if (tree.isBurning) {
                tree.isBurning = false;
                tree.isBurned = true;
                const flames = tree.group.getObjectByName('treeFlames');
                if (flames) tree.group.remove(flames);
                const light = tree.group.getObjectByName('treeLight');
                if (light) tree.group.remove(light);
                if (tree.trunk && tree.trunk.material) {
                     tree.trunk.material.color.setHex(0x111111);
                }
            }

            AudioSynth.playHit(tree.group.position);
            setTimeout(() => AudioSynth.playHit(tree.group.position), 150);
            setTimeout(() => AudioSynth.playHit(tree.group.position), 300);

            tree.isFelling = true;
            tree.fellProgress = 0;
            tree.fallAngle = Math.random() * Math.PI * 2;
            
            tree.leaves = [];
            tree.group.children.forEach(child => {
                if (child !== tree.trunk) {
                    tree.leaves.push(child);
                }
            });
            
            if (tree.isBurned) {
                addChatMessage("Burned tree chopped down! Click the fallen trunk to get charcoal.", "system");
            } else if (tree.isMushroom) {
                addChatMessage("Giant mushroom chopped down! Click the fallen stalk to get wood.", "system");
            } else {
                addChatMessage("Tree chopped down! Click the fallen trunk to get logs.", "system");
            }
            
            if (sendNetwork && isConnected) {
                sendNetworkMessage({
                    type: 'chop-tree',
                    x: tree.x,
                    z: tree.z
                });
            }
        }

        function harvestLog(tree, sendNetwork = true) {
            if (tree.logsLeft <= 0) return;
            
            tree.logsLeft--;
            AudioSynth.playHit(tree.group.position);
            
            // Visual feedback: shrink the trunk log / stalk
            const maxLogs = tree.isMushroom ? 3 : 4;
            const scaleFactor = tree.logsLeft / maxLogs;
            tree.trunk.scale.y = scaleFactor;
            
            const defaultTrunkY = tree.isMushroom ? 1.25 : 1.75;
            tree.trunk.position.y = defaultTrunkY * scaleFactor;
            
            // Spawn a dropped log item
            const spawnPos = new THREE.Vector3().copy(tree.group.position);
            const totalLength = tree.isMushroom ? 2.5 : 3.5;
            const L = totalLength * scaleFactor;
            const dx = Math.cos(tree.fallAngle) * L;
            const dz = Math.sin(tree.fallAngle) * L;
            spawnPos.x += dx;
            spawnPos.z += dz;
            spawnPos.y += 0.3;
            const dropItem = tree.isBurned ? 'charcoal' : 'log';
            spawnDroppedFood(dropItem, spawnPos);
            
            if (tree.isBurned) {
                addChatMessage(`Harvested a piece of charcoal! (${tree.logsLeft} left)`, "system");
            } else if (tree.isMushroom) {
                addChatMessage(`Chopped out wood from the stalk! (${tree.logsLeft} left)`, "system");
            } else {
                addChatMessage(`Chopped out a log! (${tree.logsLeft} logs left)`, "system");
            }
            
            if (tree.logsLeft <= 0) {
                tree.group.visible = false;
            }
            
            if (sendNetwork && isConnected) {
                sendNetworkMessage({
                    type: 'harvest-log',
                    x: tree.x,
                    z: tree.z
                });
            }
            if (isHost) {
                saveWorld(false);
            }
        }

        function resetWorldTrees() {
            worldTrees.forEach(tree => {
                tree.isChopped = false;
                tree.logsLeft = 4;
                tree.isFelling = false;
                tree.fellProgress = 0;
                tree.rotProgress = 0;
                tree.chopClicks = 0;
                tree.group.visible = true;
                
                tree.group.rotation.set(0, 0, 0);
                tree.trunk.position.copy(tree.originalTrunkPos);
                tree.trunk.rotation.copy(tree.originalTrunkRot);
                tree.trunk.scale.set(1.0, 1.0, 1.0);
                
                tree.group.children.forEach(child => {
                    child.visible = true;
                    child.scale.set(1.0, 1.0, 1.0);
                    if (child !== tree.trunk && child.material && child.userData.originalColor !== undefined) {
                        child.material.color.setHex(child.userData.originalColor);
                        child.material.opacity = 1.0;
                    }
                });
            });
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
            if (isEating) return;
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
            if (isEating) return;
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
            useToolInHand();
        }

        // 2D XZ Plane Horizontal hit check fixing close-combat angles
        function checkHit(range, damage, knockbackPower) {
            let opponentHit = false;
            const myX = camera.position.x;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            const lookDirXZ = new THREE.Vector2(lookDir.x, lookDir.z).normalize();

            if (opponentGroup && isConnected) {
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
                                if (z.type === 'crawling_tree' && z.state === 'standing') {
                                    z.state = 'rising';
                                    z.stateTime = 0;
                                    spawnDirtParticles(z.mesh.position, 12);
                                    AudioSynth.playClack(z.mesh.position);
                                }
                                if (z.type === 'mimic_mushroom') {
                                    makeMimicMushroomFlee(z, myX, myZ, kDir.x, kDir.y);
                                }
                                z.kx = kDir.x;
                                z.kz = kDir.y;
                                if (z.health <= 0) {
                                    z.isDead = true;
                                    z.deathTime = 0;
                                    handleZombieDeathDrops(z);
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
                    if (a.rider === 'local') continue; // Don't hit your own horse!
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
                                handleAnimalDeathDrops(a);
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

            // Check quantum cube hit if opponent, zombies, villagers, animals, and bees weren't hit
            if (!opponentHit) {
                for (let i = quantumCubes.length - 1; i >= 0; i--) {
                    const c = quantumCubes[i];
                    const cx = c.mesh.position.x;
                    const cz = c.mesh.position.z;
                    const distXZ = Math.sqrt((cx - myX) ** 2 + (cz - myZ) ** 2);
                    if (distXZ <= range) {
                        const toCXZ = new THREE.Vector2(cx - myX, cz - myZ).normalize();
                        const dotXZ = lookDirXZ.dot(toCXZ);
                        if (dotXZ > 0.45 || distXZ < 1.6) {
                            AudioSynth.playHit();
                            flashZombieRed(c.mesh);
                            
                            if (isHost) {
                                c.hp = Math.max(0, (c.hp !== undefined ? c.hp : 40) - damage);
                                const kDir = new THREE.Vector2(cx - myX, cz - myZ).normalize().multiplyScalar(knockbackPower);
                                c.vx += kDir.x * 0.3;
                                c.vz += kDir.y * 0.3;
                                
                                if (c.hp <= 0) {
                                    scene.remove(c.mesh);
                                    if (c.rider === 'local' || (ridingCube && ridingCube.id === c.id)) {
                                        ridingCube = null;
                                    }
                                    quantumCubes.splice(i, 1);
                                    
                                    if (isConnected) {
                                        sendNetworkMessage({
                                            type: 'quantum-cube-destroy',
                                            id: c.id
                                        });
                                    }
                                }
                            } else {
                                const kDir = new THREE.Vector2(cx - myX, cz - myZ).normalize().multiplyScalar(knockbackPower);
                                if (isConnected) {
                                    sendNetworkMessage({
                                        type: 'damage-quantum-cube',
                                        id: c.id,
                                        damage: damage,
                                        kx: kDir.x,
                                        kz: kDir.y
                                    });
                                } else {
                                    c.hp = Math.max(0, (c.hp !== undefined ? c.hp : 40) - damage);
                                    c.vx += kDir.x * 0.3;
                                    c.vz += kDir.y * 0.3;
                                    if (c.hp <= 0) {
                                        scene.remove(c.mesh);
                                        if (ridingCube && ridingCube.id === c.id) {
                                            ridingCube = null;
                                        }
                                        quantumCubes.splice(i, 1);
                                    }
                                }
                            }
                            opponentHit = true;
                            break;
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

            let reduction = 0;
            const slots = ['helmet', 'chestplate', 'leggings', 'gauntlets', 'boots'];
            slots.forEach(slot => {
                const item = armorItems[slot];
                if (item) {
                    if (item.startsWith('turtle_')) {
                        reduction += 0.04; // Tier 1: 4% per piece (lowest level armor)
                    } else if (item.startsWith('leather_')) {
                        reduction += 0.08; // Tier 2: 8% per piece
                    } else if (item.startsWith('iron_')) {
                        reduction += 0.12; // Tier 3: 12% per piece (highest level armor)
                    }
                }
            });
            const reducedDamage = Math.max(1, Math.round(damage * (1 - reduction)));
            myHealth = Math.max(0, myHealth - reducedDamage);
            updateHud();

            const vignette = document.getElementById('damage-vignette');
            vignette.classList.add('active');
            setTimeout(() => vignette.classList.remove('active'), 150);

            AudioSynth.playHit();

            // Apply velocities & camera shake recoil bounce
            knockbackVel.set(kx, 0, kz);
            velocity.x += kx;
            velocity.z += kz;
            if (reason !== "Fell from a high place") {
                velocity.y += 2.0; // pop up
                isGrounded = false;
            }

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

        function dropInventory() {
            const playerPos = camera.position.clone();
            // Drop hotbar items
            for (let i = 0; i < 9; i++) {
                const type = hotbarItems[i];
                if (type) {
                    const count = hotbarCounts[i];
                    const dur = hotbarDurability[i];
                    for (let c = 0; c < count; c++) {
                        const dropPos = playerPos.clone().add(new THREE.Vector3(
                            (Math.random() - 0.5) * 2.5,
                            0.2,
                            (Math.random() - 0.5) * 2.5
                        ));
                        spawnDroppedFood(type, dropPos, 1.0, dur);
                    }
                    hotbarItems[i] = null;
                    hotbarCounts[i] = 0;
                    hotbarDurability[i] = null;
                }
            }
            // Drop main inventory items
            for (let i = 0; i < 27; i++) {
                const type = inventoryItems[i];
                if (type) {
                    const count = inventoryCounts[i];
                    const dur = inventoryDurability[i];
                    for (let c = 0; c < count; c++) {
                        const dropPos = playerPos.clone().add(new THREE.Vector3(
                            (Math.random() - 0.5) * 2.5,
                            0.2,
                            (Math.random() - 0.5) * 2.5
                        ));
                        spawnDroppedFood(type, dropPos, 1.0, dur);
                    }
                    inventoryItems[i] = null;
                    inventoryCounts[i] = 0;
                    inventoryDurability[i] = null;
                }
            }
            // Drop armor items
            const armorSlots = ['helmet', 'chestplate', 'leggings', 'gauntlets', 'boots'];
            for (const slot of armorSlots) {
                const type = armorItems[slot];
                if (type) {
                    const dropPos = playerPos.clone().add(new THREE.Vector3(
                        (Math.random() - 0.5) * 2.5,
                        0.2,
                        (Math.random() - 0.5) * 2.5
                    ));
                    spawnDroppedFood(type, dropPos);
                    armorItems[slot] = null;
                }
            }
            // Drop held item
            if (heldItem) {
                const type = heldItem.type;
                const count = heldItem.count;
                const dur = heldItem.durability !== undefined ? heldItem.durability : null;
                for (let c = 0; c < count; c++) {
                    const dropPos = playerPos.clone().add(new THREE.Vector3(
                        (Math.random() - 0.5) * 2.5,
                        0.2,
                        (Math.random() - 0.5) * 2.5
                    ));
                    spawnDroppedFood(type, dropPos, 1.0, dur);
                }
                heldItem = null;
            }
            // Cancel eating
            if (isEating) {
                isEating = false;
                if (rightHand) {
                    rightHand.position.set(0.35, -0.3, -0.7);
                    rightHand.rotation.set(0, 0, 0);
                }
            }
            // Reset active weapon to fists
            activeWeapon = 'fists';
            updateWeaponUI();

            // Re-initialize player starting inventory: disabled on death (retained on startup/reset only)
            updateHotbarUI();
            updateInventoryUI();
            updateMinecraftStatsUI();
            updateFloatingItemUI();
            saveWorld(false);
        }

        function showDeathToast(reason) {
            if (elToast) {
                elToast.innerText = "You died! Cause: " + reason;
                elToast.classList.add('show');
                setTimeout(() => elToast.classList.remove('show'), 3500);
            }
        }

        function declareWinner(reason) {
            if (reason) {
                addChatMessage("Opponent defeated: " + reason, "system");
            }
        }


        function declareLoser(reason) {
            dropInventory();
            AudioSynth.playLose();

            // Show death message / toast locally
            showDeathToast(reason);
            addChatMessage("You died! Cause: " + reason, "system");

            // Reset health to 0 to block inputs and show dead state
            myHealth = 0;
            updateHud();

            // Dismount cube/exit turret/bush if in them
            if (inTurret) {
                inTurret = false;
                turretOccupant = null;
                sendNetworkMessage({ type: 'turret-vacate' });
            }
            if (inBush) {
                inBush = false;
                activeBushId = null;
                localPlayerInvisible = false;
                sendNetworkMessage({ type: 'invisibility-state', invisible: false });
            }
            if (typeof ridingCube !== 'undefined' && ridingCube) {
                ridingCube.rider = null;
                ridingCube = null;
            }

            // Sync with peer
            sendNetworkMessage({
                type: 'opponent-died',
                reason: reason
            });
            syncPlayerPosition();

            // Release pointer lock so user can interact with buttons
            exitPointerLock();

            // Show Death Screen
            if (elDeathScreen) {
                elDeathScreen.style.display = 'flex';
            }
            if (elDeathScreenSubtitle) {
                elDeathScreenSubtitle.innerText = reason || "Unknown causes";
            }

            // Check if bed is set and exists, or if ANY bed exists in the world
            let bedExists = false;
            if (respawnPoint) {
                bedExists = placedObjects.some(obj => 
                    obj.type === 'bed' &&
                    Math.abs(obj.pos.x - respawnPoint.x) < 1.5 &&
                    Math.abs(obj.pos.z - respawnPoint.z) < 1.5 &&
                    isDimensionCave(obj.inCave) === isDimensionCave(respawnPoint.inCave)
                );
            }
            if (!bedExists) {
                bedExists = placedObjects.some(obj => obj.type === 'bed');
            }

            if (btnRespawnBed) {
                const btn = btnRespawnBed;
                if (bedExists) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    if (respawnBedStatus) respawnBedStatus.innerText = "";
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    if (respawnBedStatus) {
                        respawnBedStatus.innerText = respawnPoint ? "Your bed was missing or obstructed" : "No bed spawn point set";
                    }
                }
            }

            // Auto-respawn after a short delay (e.g. 1.5 seconds)
            setTimeout(() => {
                if (myHealth <= 0 && gameActive) {
                    respawnPlayer(true);
                }
            }, 1500);
        }

        function updateHud() {
            document.getElementById('player-health-fill').style.width = myHealth + '%';
            document.getElementById('player-health-text').innerText = myHealth + ' HP';

            const playerHudName = document.getElementById('player-hud-name');
            if (playerHudName) {
                playerHudName.innerText = (myAppearance.name || 'player').toUpperCase();
            }

            document.getElementById('opponent-health-fill').style.width = oppHealth + '%';
            document.getElementById('opponent-health-text').innerText = oppHealth + ' HP';

            const opponentHudName = document.getElementById('opponent-hud-name');
            if (opponentHudName) {
                opponentHudName.innerText = (opponentAppearance.name || 'opponent').toUpperCase();
            }

            updateMinecraftStatsUI();
            updateHotbarUI();
        }

        function saveWorld(showChatFeedback = true) {
            if (!gameActive) return;
            if (!isHost) return;
            const saveId = activeWorldId || 'world_' + Date.now();
            
            // Serialize placedObjects (omit THREE.Mesh references)
            const serializedObjects = placedObjects.map(obj => ({
                type: obj.type,
                x: obj.pos.x,
                y: obj.pos.y,
                z: obj.pos.z,
                isOpen: !!obj.isOpen,
                initialRotationY: obj.initialRotationY,
                furnaceState: obj.furnaceState || null,
                chestInventoryItems: obj.chestInventoryItems || null,
                chestInventoryCounts: obj.chestInventoryCounts || null,
                chestInventoryDurability: obj.chestInventoryDurability || null,
                inCave: isDimensionCave(obj.inCave)
            }));
            
            const savedCycleMs = (Date.now() + timeOffset) % (CYCLE_DURATION * 1000);
            
            const saves = getSavedWorlds();
            const existingSave = saves.find(s => s.id === saveId);
            const mpCode = existingSave ? existingSave.mpCode : generateShortId();
            
            const saveObj = {
                id: saveId,
                worldName: currentWorldName,
                mode: currentGameMode,
                cameraView: cameraView,
                cheatsEnabled: cheatsEnabled,
                physicsMode: physicsMode,
                date: new Date().toLocaleString(),
                savedCycleMs: savedCycleMs,
                mpCode: mpCode,
                
                myHealth: myHealth,
                hunger: hunger,
                
                playerX: camera.position.x,
                playerY: camera.position.y,
                playerZ: camera.position.z,
                playerRotY: camera.rotation.y,
                playerInCave: isDimensionCave(playerInCave),
                respawnPoint: respawnPoint ? {
                    x: respawnPoint.x,
                    y: respawnPoint.y,
                    z: respawnPoint.z,
                    inCave: isDimensionCave(respawnPoint.inCave)
                } : null,
                
                inventoryItems: inventoryItems,
                inventoryCounts: inventoryCounts,
                inventoryDurability: inventoryDurability,
                hotbarItems: hotbarItems,
                hotbarCounts: hotbarCounts,
                hotbarDurability: hotbarDurability,
                selectedHotbarIndex: selectedHotbarIndex,
                armorItems: armorItems,
                
                 placedObjects: serializedObjects,
                  minedStoneCoords: Array.from(minedStoneCoords),
                  choppedTreeCoords: Array.from(choppedTreeCoords),
                  minedCoralCoords: Array.from(minedCoralCoords),
                  minedDesertHoles: Array.from(minedDesertHoles),
                  obtainedItems: Array.from(obtainedItems)
             };
            
             const index = saves.findIndex(s => s.id === saveId);
             if (index >= 0) {
                 saves[index] = saveObj;
             } else {
                 saves.push(saveObj);
             }
             
             saveWorldsList(saves);
             activeWorldId = saveId;
             if (showChatFeedback) {
                 addChatMessage("World saved successfully!", "system");
             }
         }
 
         function loadWorld(saveId) {
             const saves = getSavedWorlds();
             const save = saves.find(s => s.id === saveId);
             if (!save) return;
             
             if (!save.mpCode) {
                 save.mpCode = generateShortId();
                 const idx = saves.findIndex(s => s.id === saveId);
                 if (idx >= 0) {
                     saves[idx].mpCode = save.mpCode;
                     saveWorldsList(saves);
                 }
             }
             
             isHost = true;
             isConnected = false;
             
             // Initialize PeerJS with the save's multiplayer code
             initPeer(save.mpCode);
             
             if (!scene) {
                 init3D();
                 let turretX = -78;
                 let turretZ = -78;
                 spawnTurretMesh(turretX, turretZ);
                 
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
                 animate();
             }
             
             resetGameScene();
             
             if (save.savedCycleMs !== undefined) {
                 const totalCycleMs = CYCLE_DURATION * 1000;
                 timeOffset = (save.savedCycleMs - (Date.now() % totalCycleMs) + totalCycleMs) % totalCycleMs;
             } else {
                 timeOffset = 30000 - (Date.now() % (CYCLE_DURATION * 1000));
             }
             
             activeWorldId = save.id;
             currentWorldName = save.worldName || 'Unnamed World';
             currentGameMode = save.mode;
             cameraView = save.cameraView || 'first';
             cheatsEnabled = !!save.cheatsEnabled;
             physicsMode = save.physicsMode || 'normal';
             
             myHealth = save.myHealth !== undefined ? save.myHealth : 100;
             hunger = save.hunger !== undefined ? save.hunger : 100;
             playerInCave = isDimensionCave(save.playerInCave);
             respawnPoint = save.respawnPoint ? {
                 x: save.respawnPoint.x,
                 y: save.respawnPoint.y,
                 z: save.respawnPoint.z,
                 inCave: isDimensionCave(save.respawnPoint.inCave)
             } : null;
             
             const px = typeof save.playerX === 'number' ? save.playerX : 60;
             const py = typeof save.playerY === 'number' ? save.playerY : getTerrainHeight(px, typeof save.playerZ === 'number' ? save.playerZ : 20) + 1.6;
             const pz = typeof save.playerZ === 'number' ? save.playerZ : 20;
             camera.position.set(px, py, pz);
             camera.rotation.y = typeof save.playerRotY === 'number' ? save.playerRotY : 0;
             velocity.set(0, 0, 0);
             isGrounded = false;
             highestYSinceGrounded = camera.position.y;
             
             inventoryItems = save.inventoryItems ? [...save.inventoryItems] : new Array(27).fill(null);
             inventoryCounts = save.inventoryCounts ? [...save.inventoryCounts] : new Array(27).fill(0);
             inventoryDurability = save.inventoryDurability ? [...save.inventoryDurability] : new Array(27).fill(null);
             hotbarItems = save.hotbarItems ? [...save.hotbarItems] : new Array(9).fill(null);
             hotbarCounts = save.hotbarCounts ? [...save.hotbarCounts] : new Array(9).fill(0);
             hotbarDurability = save.hotbarDurability ? [...save.hotbarDurability] : new Array(9).fill(null);
             initDurabilityArrays();
             selectedHotbarIndex = save.selectedHotbarIndex || 0;
             if (save.armorItems) {
                 armorItems = { ...save.armorItems };
             } else {
                 armorItems = {
                     helmet: null,
                     chestplate: null,
                     leggings: null,
                     gauntlets: null,
                     boots: null
                 };
             }
             
             minedStoneCoords = new Set(save.minedStoneCoords || []);
             choppedTreeCoords = new Set(save.choppedTreeCoords || []);
             minedCoralCoords = new Set(save.minedCoralCoords || []);
             minedDesertHoles = new Set(save.minedDesertHoles || []);
             
             if (typeof resetWorldStones === 'function') resetWorldStones();
             if (typeof resetWorldCorals === 'function') resetWorldCorals();
             if (typeof resetWorldTrees === 'function') resetWorldTrees();
             
             // Apply terrain holes for loaded mined stones
             minedStoneCoords.forEach(coordKey => {
                 const parts = coordKey.split(',');
                 if (parts.length === 2) {
                     const sx = parseFloat(parts[0]);
                     const sz = parseFloat(parts[1]);
                     if (!isNaN(sx) && !isNaN(sz)) {
                         updateTerrainMeshNear(sx, sz);
                     }
                 }
             });

             // Apply terrain holes for loaded mined desert holes
             minedDesertHoles.forEach(coordKey => {
                 const parts = coordKey.split(',');
                 if (parts.length === 2) {
                     const hx = parseFloat(parts[0]);
                     const hz = parseFloat(parts[1]);
                     if (!isNaN(hx) && !isNaN(hz)) {
                         updateTerrainMeshNear(hx, hz);
                     }
                 }
             });
             
             clearPlacedObjects();
             obtainedItems.clear();
             if (save.obtainedItems) {
                 save.obtainedItems.forEach(item => obtainedItems.add(item));
             } else {
                 obtainedItems.add('wooden_axe');
                 obtainedItems.add('crafting_bench');
             }
             if (save.placedObjects) {
                 save.placedObjects.forEach(obj => {
                     const pos = new THREE.Vector3(obj.x, obj.y, obj.z);
                     const spawned = spawnPlacedObject(obj.type, pos, false);
                     if (spawned) {
                         spawned.isOpen = !!obj.isOpen;
                         spawned.initialRotationY = typeof obj.initialRotationY === 'number' ? obj.initialRotationY : (spawned.mesh ? spawned.mesh.rotation.y : 0);
                         spawned.inCave = obj.inCave !== undefined ? isDimensionCave(obj.inCave) : false;
                         if (spawned.mesh) {
                             spawned.mesh.rotation.y = spawned.initialRotationY + (spawned.isOpen ? Math.PI / 2 : 0);
                             spawned.mesh.visible = (isDimensionCave(spawned.inCave) === isDimensionCave(playerInCave));
                         }
                         if (obj.furnaceState) {
                             spawned.furnaceState = obj.furnaceState;
                         }
                          if (obj.chestInventoryItems) {
                              spawned.chestInventoryItems = obj.chestInventoryItems;
                              spawned.chestInventoryCounts = obj.chestInventoryCounts;
                              spawned.chestInventoryDurability = obj.chestInventoryDurability || new Array(27).fill(null);
                              for (let i = 0; i < 27; i++) {
                                  if (spawned.chestInventoryItems[i] && isTool(spawned.chestInventoryItems[i]) && (spawned.chestInventoryDurability[i] === null || spawned.chestInventoryDurability[i] === undefined)) {
                                      spawned.chestInventoryDurability[i] = getMaxDurability(spawned.chestInventoryItems[i]);
                                  }
                              }
                          }
                     }
                 });
             }
             
             // Sync visibility based on whether the player is in a cave
             clientZombies.forEach(mesh => { mesh.visible = (isDimensionCave(mesh.inCave) === isDimensionCave(playerInCave)); });
             animals.forEach(a => a.mesh.visible = !isDimensionCave(playerInCave));
             bees.forEach(b => b.mesh.visible = !isDimensionCave(playerInCave));
             clientBees.forEach(mesh => mesh.visible = !isDimensionCave(playerInCave));
             
             updateCheatsUIState();
             
             updateHud();
             updateHotbarUI();
             updateInventoryUI();
             updateMinecraftStatsUI();
             updateWeaponUI();
             
             document.getElementById('lobby').style.display = 'none';
             document.getElementById('start-screen').style.display = 'none';
             document.getElementById('hud').style.display = 'flex';
             
             gameActive = true;
             document.activeElement.blur();
             window.focus();
             
             updateChunks();
             requestPointerLock();
         }
 
         function deleteWorld(saveId) {
             let saves = getSavedWorlds();
             saves = saves.filter(s => s.id !== saveId);
             saveWorldsList(saves);
             renderSavesList();
         }
 
          function showMultiplayerCodeModal(save) {
              if (!save.mpCode) {
                  save.mpCode = generateShortId();
                  const saves = getSavedWorlds();
                  const idx = saves.findIndex(s => s.id === save.id);
                  if (idx >= 0) {
                      saves[idx].mpCode = save.mpCode;
                      saveWorldsList(saves);
                  }
              }
              
              let modal = document.getElementById('mp-code-modal');
              if (!modal) {
                  modal = document.createElement('div');
                  modal.id = 'mp-code-modal';
                  modal.className = 'overlay interactive';
                  modal.style.zIndex = '2000';
                  modal.style.background = 'rgba(5, 5, 10, 0.8)';
                  modal.style.backdropFilter = 'blur(10px)';
                  modal.style.webkitBackdropFilter = 'blur(10px)';
                  modal.style.display = 'none';
                  modal.style.position = 'fixed';
                  modal.style.top = '0';
                  modal.style.left = '0';
                  modal.style.width = '100%';
                  modal.style.height = '100%';
                  modal.style.alignItems = 'center';
                  modal.style.justifyContent = 'center';
                  
                  modal.innerHTML = `
                      <div class="glass-panel" style="max-width: 400px; padding: 35px; border: 1px solid var(--cyan); box-shadow: 0 0 40px rgba(0, 240, 255, 0.25); text-align: center; display: flex; flex-direction: column; gap: 20px;">
                          <h2 style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; color: var(--cyan); text-shadow: var(--text-glow); margin: 0; text-transform: uppercase;">Multiplayer Code</h2>
                          <p style="color: #8a90a0; font-size: 0.9rem; line-height: 1.5; margin: 0;">Share this code with your friend. When they enter it in their lobby join box, they will connect to your game!</p>
                          
                          <div id="mp-code-display" style="font-family: 'Orbitron', sans-serif; font-size: 2.2rem; font-weight: bold; color: var(--magenta); text-shadow: var(--magenta-glow); letter-spacing: 6px; background: rgba(0, 0, 0, 0.4); padding: 15px; border-radius: 8px; border: 1px dashed rgba(255, 0, 127, 0.4); user-select: all; text-transform: uppercase; margin: 10px 0;">
                              ABCDE
                          </div>
                          
                          <div style="display: flex; gap: 10px; width: 100%;">
                              <button id="mp-code-btn-copy" class="btn btn-cyan" style="flex: 1; padding: 12px; margin: 0;">Copy Code</button>
                              <button id="mp-code-btn-close" class="btn btn-secondary" style="flex: 1; padding: 12px; margin: 0;">Close</button>
                          </div>
                      </div>
                  `;
                  document.body.appendChild(modal);
              }
              
              const codeDisplay = modal.querySelector('#mp-code-display');
              if (codeDisplay) codeDisplay.innerText = save.mpCode;
              
              const copyBtn = modal.querySelector('#mp-code-btn-copy');
              if (copyBtn) {
                  copyBtn.innerText = "Copy Code";
                  const newCopyBtn = copyBtn.cloneNode(true);
                  copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
                  newCopyBtn.addEventListener('click', () => {
                      navigator.clipboard.writeText(save.mpCode).then(() => {
                          newCopyBtn.innerText = "Copied!";
                          setTimeout(() => { newCopyBtn.innerText = "Copy Code"; }, 2000);
                      });
                  });
              }
              
              const closeBtn = modal.querySelector('#mp-code-btn-close');
              if (closeBtn) {
                  const newCloseBtn = closeBtn.cloneNode(true);
                  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                  newCloseBtn.addEventListener('click', () => {
                      modal.style.display = 'none';
                  });
              }
              
              modal.style.display = 'flex';
          }

          function renderSavesList() {
              const savesContainer = document.getElementById('saves-list');
              if (!savesContainer) return;
              
              const saves = getSavedWorlds();
              if (saves.length === 0) {
                  savesContainer.innerHTML = `<div style="text-align: center; color: #5a6070; padding: 30px; font-size: 0.9rem; border: 1px dashed rgba(255,255,255,0.05); border-radius: 10px;">No saved worlds yet. Create one to begin!</div>`;
                  return;
              }
              
              // Ensure all saves have a mpCode
              let savesUpdated = false;
              saves.forEach(save => {
                  if (!save.mpCode) {
                      save.mpCode = generateShortId();
                      savesUpdated = true;
                  }
              });
              if (savesUpdated) {
                  saveWorldsList(saves);
              }

              savesContainer.innerHTML = '';
              saves.forEach(save => {
                  const item = document.createElement('div');
                  item.className = 'save-item';
                  
                  const info = document.createElement('div');
                  info.className = 'save-info';
                  
                  const name = document.createElement('div');
                  name.className = 'save-name';
                  name.innerText = save.worldName || 'Unnamed World';
                  
                  const details = document.createElement('div');
                  details.className = 'save-details';
                  details.innerText = `${save.mode === 'freedom' ? 'Freedom Mode' : 'Survival Mode'} • ${save.date || 'Unknown Date'}`;
                  
                  info.appendChild(name);
                  info.appendChild(details);
                  
                  const buttons = document.createElement('div');
                  buttons.className = 'save-buttons';
                  
                  const playBtn = document.createElement('button');
                  playBtn.className = 'btn-save-play';
                  playBtn.innerText = 'Play';
                  playBtn.addEventListener('click', () => {
                      loadWorld(save.id);
                  });
                  
                  const deleteBtn = document.createElement('button');
                  deleteBtn.className = 'btn-save-delete';
                  deleteBtn.innerText = 'Delete';
                  deleteBtn.addEventListener('click', () => {
                      if (confirm(`Are you sure you want to delete "${save.worldName || 'Unnamed World'}"?`)) {
                          deleteWorld(save.id);
                      }
                  });
                  
                  const optionsBtn = document.createElement('button');
                  optionsBtn.className = 'btn-save-options';
                  optionsBtn.innerHTML = '&#8942;';
                  optionsBtn.title = 'Show Multiplayer Code';
                  optionsBtn.addEventListener('click', (e) => {
                      e.stopPropagation();
                      showMultiplayerCodeModal(save);
                  });
                  
                  buttons.appendChild(playBtn);
                  buttons.appendChild(deleteBtn);
                  buttons.appendChild(optionsBtn);
                  
                  item.appendChild(info);
                  item.appendChild(buttons);
                  savesContainer.appendChild(item);
              });
          }

        function updateCheatsUIState() {
            const btnNewDisabled = document.getElementById('btn-cheats-disabled');
            const btnNewEnabled = document.getElementById('btn-cheats-enabled');
            const btnInGameDisabled = document.getElementById('btn-ingame-cheats-disabled');
            const btnInGameEnabled = document.getElementById('btn-ingame-cheats-enabled');
            
            if (cheatsEnabled) {
                if (btnNewDisabled) { btnNewDisabled.classList.remove('active'); btnNewDisabled.style.borderColor = 'rgba(255,255,255,0.1)'; btnNewDisabled.style.background = 'rgba(255,255,255,0.02)'; btnNewDisabled.style.color = '#8a90a0'; }
                if (btnNewEnabled) { btnNewEnabled.classList.add('active'); btnNewEnabled.style.borderColor = 'var(--cyan)'; btnNewEnabled.style.background = 'rgba(0, 240, 255, 0.1)'; btnNewEnabled.style.color = 'var(--cyan)'; }
                if (btnInGameDisabled) { btnInGameDisabled.classList.remove('active'); btnInGameDisabled.style.borderColor = 'rgba(255,255,255,0.1)'; btnInGameDisabled.style.background = 'rgba(255,255,255,0.02)'; btnInGameDisabled.style.color = '#8a90a0'; }
                if (btnInGameEnabled) { btnInGameEnabled.classList.add('active'); btnInGameEnabled.style.borderColor = 'var(--cyan)'; btnInGameEnabled.style.background = 'rgba(0, 240, 255, 0.1)'; btnInGameEnabled.style.color = 'var(--cyan)'; }
            } else {
                if (btnNewDisabled) { btnNewDisabled.classList.add('active'); btnNewDisabled.style.borderColor = 'var(--cyan)'; btnNewDisabled.style.background = 'rgba(0, 240, 255, 0.1)'; btnNewDisabled.style.color = 'var(--cyan)'; }
                if (btnNewEnabled) { btnNewEnabled.classList.remove('active'); btnNewEnabled.style.borderColor = 'rgba(255,255,255,0.1)'; btnNewEnabled.style.background = 'rgba(255,255,255,0.02)'; btnNewEnabled.style.color = '#8a90a0'; }
                if (btnInGameDisabled) { btnInGameDisabled.classList.add('active'); btnInGameDisabled.style.borderColor = 'var(--cyan)'; btnInGameDisabled.style.background = 'rgba(0, 240, 255, 0.1)'; btnInGameDisabled.style.color = 'var(--cyan)'; }
                if (btnInGameEnabled) { btnInGameEnabled.classList.remove('active'); btnInGameEnabled.style.borderColor = 'rgba(255,255,255,0.1)'; btnInGameEnabled.style.background = 'rgba(255,255,255,0.02)'; btnInGameEnabled.style.color = '#8a90a0'; }
            }
        }

        function updatePhysicsUIState() {
            const btnNewNormal = document.getElementById('btn-physics-normal');
            const btnNewMoon = document.getElementById('btn-physics-moon');
            const btnNewBouncy = document.getElementById('btn-physics-bouncy');
            
            const btnInGameNormal = document.getElementById('btn-ingame-physics-normal');
            const btnInGameMoon = document.getElementById('btn-ingame-physics-moon');
            const btnInGameBouncy = document.getElementById('btn-ingame-physics-bouncy');
            
            const setButtonActive = (btn, isActive) => {
                if (!btn) return;
                if (isActive) {
                    btn.classList.add('active');
                    btn.style.borderColor = 'var(--cyan)';
                    btn.style.background = 'rgba(0, 240, 255, 0.1)';
                    btn.style.color = 'var(--cyan)';
                } else {
                    btn.classList.remove('active');
                    btn.style.borderColor = 'rgba(255,255,255,0.1)';
                    btn.style.background = 'rgba(255,255,255,0.02)';
                    btn.style.color = '#8a90a0';
                }
            };
            
            setButtonActive(btnNewNormal, physicsMode === 'normal');
            setButtonActive(btnNewMoon, physicsMode === 'moon');
            setButtonActive(btnNewBouncy, physicsMode === 'bouncy');
            
            setButtonActive(btnInGameNormal, physicsMode === 'normal');
            setButtonActive(btnInGameMoon, physicsMode === 'moon');
            setButtonActive(btnInGameBouncy, physicsMode === 'bouncy');
        }

        function updateFloatingBlocks(delta) {
            if (physicsMode === 'normal') return;

            const getBlockHeight = (type) => {
                if (type === 'crafting_bench') return 1.0;
                if (type === 'door') return 1.8;
                if (type === 'stone_slab' || type === 'bed') return 0.45;
                return 0.9;
            };

            placedObjects.forEach(obj => {
                if (obj.falling === undefined) {
                    obj.falling = false;
                    obj.vy = 0;
                }

                if (!obj.falling) {
                    const terrainY = getTerrainHeight(obj.pos.x, obj.pos.z, obj.inCave);
                    let supported = (obj.pos.y <= terrainY + 0.05);

                    if (!supported) {
                        for (let i = 0; i < placedObjects.length; i++) {
                            const other = placedObjects[i];
                            if (other === obj) continue;
                            if (other.falling) continue;

                            const dx = Math.abs(obj.pos.x - other.pos.x);
                            const dz = Math.abs(obj.pos.z - other.pos.z);
                            if (dx < 0.45 && dz < 0.45) {
                                const otherTop = other.pos.y + getBlockHeight(other.type);
                                if (Math.abs(obj.pos.y - otherTop) < 0.05) {
                                    supported = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (!supported) {
                        obj.falling = true;
                    }
                }

                if (obj.falling) {
                    const gravityVal = (physicsMode === 'moon') ? (9.8 * 0.55) : (9.8 * 2.2);
                    obj.vy -= gravityVal * delta;
                    obj.pos.y += obj.vy * delta;

                    const terrainY = getTerrainHeight(obj.pos.x, obj.pos.z, obj.inCave);
                    if (obj.pos.y <= terrainY) {
                        obj.pos.y = terrainY;
                        obj.falling = false;
                        obj.vy = 0;
                    } else {
                        for (let i = 0; i < placedObjects.length; i++) {
                            const other = placedObjects[i];
                            if (other === obj) continue;
                            if (other.falling) continue;

                            const dx = Math.abs(obj.pos.x - other.pos.x);
                            const dz = Math.abs(obj.pos.z - other.pos.z);
                            if (dx < 0.45 && dz < 0.45) {
                                const otherTop = other.pos.y + getBlockHeight(other.type);
                                if (obj.pos.y <= otherTop && obj.pos.y - obj.vy * delta >= otherTop - 0.1) {
                                    obj.pos.y = otherTop;
                                    obj.falling = false;
                                    obj.vy = 0;
                                    break;
                                }
                            }
                        }
                    }

                    if (obj.mesh) {
                        let offset = 0;
                        if (obj.type === 'log' || obj.type === 'planks' || obj.type === 'stone' || obj.type === 'smooth_stone') {
                            offset = 0.45;
                        } else if (obj.type === 'stone_slab') {
                            offset = 0.225;
                        }
                        obj.mesh.position.y = obj.pos.y + offset;
                    }
                }
            });
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
            timeOffset = 30000 - (Date.now() % (CYCLE_DURATION * 1000));
            myHealth = 100;
            oppHealth = 100;
            updateHud();
            
            hunger = 100;
            updateMinecraftStatsUI();
            hotbarItems = new Array(9).fill(null);
            hotbarCounts = new Array(9).fill(0);
            hotbarDurability = new Array(9).fill(null);
            hotbarItems[0] = 'wooden_axe';
            hotbarCounts[0] = 1;
            hotbarDurability[0] = 60;
            hotbarItems[1] = 'crafting_bench';
            hotbarCounts[1] = 1;
            hotbarItems[2] = 'boat';
            hotbarCounts[2] = 1;
            inventoryItems = new Array(27).fill(null);
            inventoryCounts = new Array(27).fill(0);
            inventoryDurability = new Array(27).fill(null);
            armorItems = {
                helmet: null,
                chestplate: null,
                leggings: null,
                gauntlets: null,
                boots: null
            };
            armorItems = {
                helmet: null,
                chestplate: null,
                leggings: null,
                gauntlets: null,
                boots: null
            };
            selectedHotbarIndex = 0;
            clearPlacedObjects();
            worldCorals = [];
            worldStones = [];
            minedCoralCoords = new Set();
            minedDesertHoles = new Set();
            activeChest = null;
            chestUIOpen = false;
            updateHotbarUI();
            updateInventoryUI();
            clearAnimals();
            clearDroppedFoods();
            if (typeof resetWorldTrees === 'function') resetWorldTrees();
            
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

            // Determine if players were in the Quantum Lands when death/reset occurred
            const wasInQuantum = (camera.position.x > 1400) || (opponentGroup && opponentGroup.position.x > 1400);

            // Reset spawns inside open plains or quantum lands
            if (wasInQuantum) {
                const spawnZ = isHost ? 3 : -3;
                const spawnY = getTerrainHeight(2000, spawnZ) + 1.6;
                camera.position.set(2000, spawnY, spawnZ);
                camera.rotation.set(0, isHost ? 0 : Math.PI, 0);
            } else {
                const spawnZ = isHost ? 28 : 12;
                const spawnY = getTerrainHeight(60, spawnZ) + 1.6;
                camera.position.set(60, spawnY, spawnZ);
                camera.rotation.set(0, isHost ? 0 : Math.PI, 0);
            }
            
            velocity.set(0, 0, 0);
            knockbackVel.set(0, 0, 0);
            isGrounded = true;

            // Reset Opponent mesh
            if (opponentGroup) {
                if (wasInQuantum) {
                    targetOpponentPos.set(2000, 0, isHost ? -3 : 3);
                    opponentGroup.position.copy(targetOpponentPos);
                    opponentGroup.position.y = getTerrainHeight(targetOpponentPos.x, targetOpponentPos.z, opponentInCave);
                    targetOpponentRotY = isHost ? 0 : Math.PI;
                    opponentGroup.rotation.y = targetOpponentRotY;
                    resetOpponentColor();
                } else {
                    targetOpponentPos.set(60, 0, isHost ? 12 : 28);
                    opponentGroup.position.copy(targetOpponentPos);
                    opponentGroup.position.y = getTerrainHeight(targetOpponentPos.x, targetOpponentPos.z, opponentInCave);
                    targetOpponentRotY = isHost ? 0 : Math.PI;
                    opponentGroup.rotation.y = targetOpponentRotY;
                    resetOpponentColor();
                }
            }

            activeWeapon = 'fists';
            updateWeaponUI();

            // Reset Turret / Zombie states
            inTurret = false;
            turretOccupant = null;
            if (turretHeadGroup) turretHeadGroup.rotation.set(0, 0, 0);
            clearZombies(true);
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
                spawnCrawlingTrees();
                spawnMushroomMimics();
                
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
            timeOffset = 30000 - (Date.now() % (CYCLE_DURATION * 1000));
            respawnPoint = null;
            myHealth = 100;
            oppHealth = 100;
            updateHud();
            
            hunger = 100;
            updateMinecraftStatsUI();
            hotbarItems = new Array(9).fill(null);
            hotbarCounts = new Array(9).fill(0);
            hotbarDurability = new Array(9).fill(null);
            hotbarItems[0] = 'wooden_axe';
            hotbarCounts[0] = 1;
            hotbarDurability[0] = 60;
            hotbarItems[1] = 'crafting_bench';
            hotbarCounts[1] = 1;
            hotbarItems[2] = 'boat';
            hotbarCounts[2] = 1;
            inventoryItems = new Array(27).fill(null);
            inventoryCounts = new Array(27).fill(0);
            inventoryDurability = new Array(27).fill(null);
            selectedHotbarIndex = 0;
            clearPlacedObjects();
            updateHotbarUI();
            updateInventoryUI();
            clearAnimals();
            clearDroppedFoods();
            if (typeof resetWorldTrees === 'function') resetWorldTrees();
            if (typeof resetWorldCorals === 'function') resetWorldCorals();
            if (typeof resetWorldStones === 'function') resetWorldStones();

            // Reset dimension and cave states
            playerInCave = false;
            opponentInCave = false;

            // Unload all chunks from scene to start fresh
            for (const chunk of loadedChunks.values()) {
                if (chunk.terrainMesh) scene.remove(chunk.terrainMesh);
                if (chunk.ceilMesh) scene.remove(chunk.ceilMesh);
                if (chunk.waterMesh) scene.remove(chunk.waterMesh);
                if (chunk.entities) {
                    chunk.entities.forEach(ent => scene.remove(ent));
                }
            }
            loadedChunks.clear();

            caveEntrances.forEach(ent => scene.remove(ent.mesh));
            caveEntrances.length = 0;
            caveExits.forEach(ex => scene.remove(ex.mesh));
            caveExits.length = 0;

            // Clear bees
            bees.forEach(b => scene.remove(b.mesh));
            bees.length = 0;
            clientBees.forEach(mesh => scene.remove(mesh));
            clientBees.clear();

            // Clear quantum cubes
            clearQuantumCubes();
            ridingCube = null;

            // Reset stone/coral/recipes sets
            minedStoneCoords = new Set();
            choppedTreeCoords = new Set();
            minedCoralCoords = new Set();
            minedDesertHoles = new Set();
            obtainedItems.clear();
            obtainedItems.add('wooden_axe');
            obtainedItems.add('crafting_bench');

            rematchRequestSent = false;
            rematchRequestReceived = false;
            elBtnRematch.disabled = false;
            elRematchStatus.innerText = "";
            activeWeapon = 'fists';
            updateWeaponUI();

            if (elDeathScreen) {
                elDeathScreen.style.display = 'none';
            }

                       // Reset Turret / Zombie states
            inTurret = false;
            turretOccupant = null;
            if (turretHeadGroup) turretHeadGroup.rotation.set(0, 0, 0);
            clearZombies(true);
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
            if (isHost) {
                spawnCrawlingTrees();
                spawnMushroomMimics();
            }
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
                    // Clear guest's state
                    clearPlacedObjects();
                    minedStoneCoords.clear();
                    choppedTreeCoords.clear();
                    minedCoralCoords.clear();
                    minedDesertHoles.clear();
                    
                    // Spawn synced turret
                    if (msg.turretX !== undefined && msg.turretZ !== undefined) {
                        spawnTurretMesh(msg.turretX, msg.turretZ);
                    }

                    // Spawn synced villagers
                    if (msg.villagers) {
                        spawnVillagers(msg.villagers);
                    }
                    
                    if (msg.weather) {
                        setWeather(msg.weather);
                    }
                    
                    if (msg.timeOffset !== undefined) {
                        timeOffset = msg.timeOffset;
                    }
                    
                    // Spawn placed objects
                    if (msg.placedObjects) {
                        msg.placedObjects.forEach(obj => {
                            const pos = new THREE.Vector3(obj.x, obj.y, obj.z);
                            const spawned = spawnPlacedObject(obj.type, pos, false);
                            if (spawned) {
                                spawned.isOpen = !!obj.isOpen;
                                spawned.initialRotationY = typeof obj.initialRotationY === 'number' ? obj.initialRotationY : (spawned.mesh ? spawned.mesh.rotation.y : 0);
                                spawned.inCave = obj.inCave !== undefined ? isDimensionCave(obj.inCave) : false;
                                if (spawned.mesh) {
                                    spawned.mesh.rotation.y = spawned.initialRotationY + (spawned.isOpen ? Math.PI / 2 : 0);
                                    spawned.mesh.visible = (isDimensionCave(spawned.inCave) === isDimensionCave(playerInCave));
                                }
                                if (obj.furnaceState) {
                                    spawned.furnaceState = obj.furnaceState;
                                }
                                if (obj.chestInventoryItems) {
                                    spawned.chestInventoryItems = obj.chestInventoryItems;
                                    spawned.chestInventoryCounts = obj.chestInventoryCounts;
                                    spawned.chestInventoryDurability = obj.chestInventoryDurability || new Array(27).fill(null);
                                    for (let i = 0; i < 27; i++) {
                                        if (spawned.chestInventoryItems[i] && isTool(spawned.chestInventoryItems[i]) && (spawned.chestInventoryDurability[i] === null || spawned.chestInventoryDurability[i] === undefined)) {
                                            spawned.chestInventoryDurability[i] = getMaxDurability(spawned.chestInventoryItems[i]);
                                        }
                                    }
                                }
                            }
                        });
                    }
                    
                    // Sync terrain alterations
                    if (msg.minedStoneCoords) {
                        msg.minedStoneCoords.forEach(coord => {
                            minedStoneCoords.add(coord);
                            const parts = coord.split(',');
                            if (parts.length === 2) {
                                updateTerrainMeshNear(parseFloat(parts[0]), parseFloat(parts[1]));
                            }
                        });
                    }
                    if (msg.minedDesertHoles) {
                        msg.minedDesertHoles.forEach(coord => {
                            minedDesertHoles.add(coord);
                            const parts = coord.split(',');
                            if (parts.length >= 2) {
                                updateTerrainMeshNear(parseFloat(parts[0]), parseFloat(parts[1]));
                            }
                        });
                    }
                    if (msg.choppedTreeCoords) {
                        msg.choppedTreeCoords.forEach(coord => {
                            choppedTreeCoords.add(coord);
                            const parts = coord.split(',');
                            if (parts.length === 2) {
                                const tx = parseFloat(parts[0]);
                                const tz = parseFloat(parts[1]);
                                const t = worldTrees.find(x => Math.abs(x.x - tx) < 0.2 && Math.abs(x.z - tz) < 0.2);
                                if (t) {
                                    t.isChopped = true;
                                    t.logsLeft = 0;
                                    t.group.visible = false;
                                }
                            }
                        });
                    }
                    if (msg.minedCoralCoords) {
                        msg.minedCoralCoords.forEach(coord => {
                            minedCoralCoords.add(coord);
                            const parts = coord.split(',');
                            if (parts.length === 2) {
                                const cx = parseFloat(parts[0]);
                                const cz = parseFloat(parts[1]);
                                const c = worldCorals.find(x => Math.abs(x.x - cx) < 0.2 && Math.abs(x.z - cz) < 0.2);
                                if (c) {
                                    c.mesh.visible = false;
                                }
                            }
                        });
                    }
                    
                    // Refresh world stone and coral visibility
                    if (typeof resetWorldStones === 'function') resetWorldStones();
                    if (typeof resetWorldCorals === 'function') resetWorldCorals();
                    
                    // Hide any mined stones from worldStones
                    worldStones.forEach(stone => {
                        const coordKey = `${stone.x.toFixed(1)},${stone.z.toFixed(1)}`;
                        if (minedStoneCoords.has(coordKey)) {
                            stone.mesh.visible = false;
                        }
                    });
                    
                    // Trigger character appearance request
                    sendNetworkMessage({
                        type: 'appearance',
                        name: myAppearance.name || 'player',
                        skin: myAppearance.skin,
                        hair: myAppearance.hair,
                        eye: myAppearance.eye,
                        shirt: myAppearance.shirt,
                        pants: myAppearance.pants
                    });
                    
                    // Safe spawn point for client player
                    const clientStartX = 60;
                    const clientStartZ = 20;
                    const clientStartY = getTerrainHeight(clientStartX, clientStartZ) + 1.6;
                    camera.position.set(clientStartX, clientStartY, clientStartZ);
                    camera.rotation.set(0, 0, 0);
                    velocity.set(0, 0, 0);

                    addChatMessage("Joined game successfully! World state synced.", "system");
                    break;
                case 'weather-sync':
                    if (msg.weather) {
                        setWeather(msg.weather);
                    }
                    break;
                case 'tree-burn-start':
                    const bTree = worldTrees.find(t => Math.abs(t.x - msg.x) < 0.2 && Math.abs(t.z - msg.z) < 0.2);
                    if (bTree) {
                        startTreeBurning(bTree);
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
                    opponentInCave = msg.inCave || false;
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
                case 'place-block':
                    spawnPlacedObject(msg.blockType, new THREE.Vector3(msg.x, msg.y, msg.z), false);
                    const spawned = placedObjects[placedObjects.length - 1];
                    if (spawned) {
                        spawned.inCave = msg.inCave !== undefined ? isDimensionCave(msg.inCave) : isDimensionCave(opponentInCave);
                        spawned.mesh.visible = (isDimensionCave(spawned.inCave) === isDimensionCave(playerInCave));
                    }
                    break;
                case 'break-block':
                    removePlacedBlockAt(msg.x, msg.y, msg.z);
                    break;
                case 'mine-stone':
                    const s = worldStones.find(x => Math.abs(x.x - msg.x) < 0.2 && Math.abs(x.z - msg.z) < 0.2);
                    if (s) {
                        mineNaturalStone(s, false);
                    }
                    break;
                case 'mine-coral':
                    const c = worldCorals.find(x => Math.abs(x.x - msg.x) < 0.2 && Math.abs(x.z - msg.z) < 0.2);
                    if (c) {
                        mineNaturalCoral(c, false);
                    }
                    break;
                case 'chop-tree':
                    const t = worldTrees.find(x => Math.abs(x.x - msg.x) < 0.2 && Math.abs(x.z - msg.z) < 0.2);
                    if (t) {
                        chopTreeDown(t, false);
                    }
                    break;
                case 'harvest-log':
                    const tLog = worldTrees.find(x => Math.abs(x.x - msg.x) < 0.2 && Math.abs(x.z - msg.z) < 0.2);
                    if (tLog) {
                        harvestLog(tLog, false);
                    }
                    break;
                case 'dig-desert-hole':
                    addMinedDesertHole(msg.x, msg.z, false);
                    updateTerrainMeshNear(msg.x, msg.z);
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
                        name: msg.name || 'opponent',
                        skin: msg.skin,
                        hair: msg.hair,
                        eye: msg.eye,
                        shirt: msg.shirt,
                        pants: msg.pants
                    };
                    rebuildOpponentMesh();
                    updateHud();
                    break;
                case 'trashed':
                    oppHealth = 0;
                    updateHud();
                    addChatMessage("Opponent was thrown into the trash bin!", "system");
                    break;
                case 'win-state':
                    declareLoser("Defeated by Opponent!");
                    break;
                case 'opponent-died':
                    oppHealth = 100;
                    updateHud();
                    addChatMessage("Opponent died: " + (msg.reason || "unknown"), "system");
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
                            mesh = zd.type === 'creeper' ? createCreeperMesh() : (zd.type === 'skeleton' ? createSkeletonMesh() : (zd.type === 'crawling_tree' ? createCrawlingTreeMesh() : (zd.type === 'mimic_mushroom' ? createMimicMushroomMesh(zd.mushroomColor || 0xd93838) : createZombieMesh())));
                            mesh.zombieType = zd.type || 'zombie';
                            scene.add(mesh);
                            clientZombies.set(zd.id, mesh);
                        }
                        
                        mesh.inCave = zd.inCave !== undefined ? isDimensionCave(zd.inCave) : false;
                        mesh.visible = (isDimensionCave(mesh.inCave) === isDimensionCave(playerInCave));
                        
                        mesh.position.set(zd.x, zd.y, zd.z);
                        mesh.rotation.y = zd.ry;
                        
                        if (mesh.zombieType === 'crawling_tree' || mesh.zombieType === 'mimic_mushroom') {
                            mesh.crawlingTreeState = zd.crawlingTreeState || 'standing';
                            mesh.attackAnimProgress = zd.attackAnimProgress || 0;
                            return;
                        }
                        
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
                                if (mesh.zombieType === 'error404') {
                                    mesh.scale.set(4, 4, 4);
                                } else {
                                    mesh.scale.set(1, 1, 1);
                                }
                                
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
                        mesh.visible = !playerInCave;
                        
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
                            if (z.type === 'crawling_tree' && z.state === 'standing') {
                                z.state = 'rising';
                                z.stateTime = 0;
                                spawnDirtParticles(z.mesh.position, 12);
                                AudioSynth.playClack(z.mesh.position);
                            }
                            if (z.type === 'mimic_mushroom') {
                                makeMimicMushroomFlee(z, undefined, undefined, msg.kx, msg.kz);
                            }
                            z.kx = msg.kx;
                            z.kz = msg.kz;
                            flashZombieRed(z.mesh);
                            if (z.health <= 0) {
                                z.isDead = true;
                                z.deathTime = 0;
                                handleZombieDeathDrops(z);
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
                    const syncCycleTime = ((Date.now() + timeOffset) % (CYCLE_DURATION * 1000)) / 1000;
                    const isNightNow = (syncCycleTime >= 540 || syncCycleTime < 30);
                    addChatMessage(`Opponent set time to ${isNightNow ? 'night' : 'day'}.`, "system");
                    break;
                case 'creeper-explode':
                    createExplosionEffect(msg.x, msg.y, msg.z, 4.5, 10, false);
                    break;
                case 'tnt-explode':
                    createExplosionEffect(msg.x, msg.y, msg.z, 12.0, 60.0, false);
                    break;
                case 'damage-quantum-cube':
                    if (isHost) {
                        const cube = quantumCubes.find(c => c.id === msg.id);
                        if (cube) {
                            cube.hp = Math.max(0, (cube.hp !== undefined ? cube.hp : 40) - msg.damage);
                            if (msg.kx !== undefined && msg.kz !== undefined) {
                                cube.vx += msg.kx * 0.3;
                                cube.vz += msg.kz * 0.3;
                            }
                            flashZombieRed(cube.mesh);
                            if (cube.hp <= 0) {
                                scene.remove(cube.mesh);
                                if (cube.rider === 'local' || (ridingCube && ridingCube.id === cube.id)) {
                                    ridingCube = null;
                                }
                                const idx = quantumCubes.indexOf(cube);
                                if (idx !== -1) {
                                    quantumCubes.splice(idx, 1);
                                }
                                sendNetworkMessage({
                                    type: 'quantum-cube-destroy',
                                    id: cube.id
                                });
                            }
                        }
                    }
                    break;
                case 'quantum-cube-destroy':
                    const qIdx = quantumCubes.findIndex(c => c.id === msg.id);
                    if (qIdx !== -1) {
                        const cube = quantumCubes[qIdx];
                        scene.remove(cube.mesh);
                        if (cube.rider === 'local' || (ridingCube && ridingCube.id === msg.id)) {
                            ridingCube = null;
                        }
                        quantumCubes.splice(qIdx, 1);
                    }
                    break;
            }
        }

        function sendMapToPeer(turretX, turretZ, villagerData) {
            if (!isConnected) return;
            sendNetworkMessage({
                type: 'init-map',
                trashCans: trashCanCoords,
                turretX: turretX,
                turretZ: turretZ,
                villagers: villagerData,
                weather: currentWeather,
                timeOffset: timeOffset,
                placedObjects: placedObjects.map(obj => ({
                    type: obj.type,
                    x: obj.pos.x,
                    y: obj.pos.y,
                    z: obj.pos.z,
                    isOpen: !!obj.isOpen,
                    initialRotationY: obj.initialRotationY,
                    furnaceState: obj.furnaceState || null,
                    chestInventoryItems: obj.chestInventoryItems || null,
                    chestInventoryCounts: obj.chestInventoryCounts || null,
                    chestInventoryDurability: obj.chestInventoryDurability || null,
                    inCave: isDimensionCave(obj.inCave)
                })),
                minedStoneCoords: Array.from(minedStoneCoords),
                choppedTreeCoords: Array.from(choppedTreeCoords),
                minedCoralCoords: Array.from(minedCoralCoords),
                minedDesertHoles: Array.from(minedDesertHoles)
            });
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
                
                if (isHost) {
                    
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
                        sendMapToPeer(turretX, turretZ, villagerData);
                    }, 400);
                    
                    spawnTurretMesh(turretX, turretZ);
                    spawnVillagers(villagerData);
                    spawnInitialAnimals();
                    animate();
                } else {
                    animate();
                }
            } else {
                if (isHost && isConnected) {
                    // Host is already in-game, sync existing map state with guest
                    let turretX = -78;
                    let turretZ = -78;
                    const existingTurret = scene.getObjectByName('turretGroup');
                    if (existingTurret) {
                        turretX = existingTurret.position.x;
                        turretZ = existingTurret.position.z;
                    }
                    const villagerData = villagers.map(v => ({ id: v.id, x: v.mesh.position.x, z: v.mesh.position.z }));
                    setTimeout(() => {
                        sendMapToPeer(turretX, turretZ, villagerData);
                    }, 400);
                } else {
                    resetMatch();
                }
            }
            
            const oppCard = document.querySelector('.opponent-card');
            if (oppCard) oppCard.style.display = isConnected ? 'flex' : 'none';

            updateHud();

            addChatMessage("Press [T] to chat. Type /day or /night to set the time.", "system");
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

            // Death check: if HP reaches 0 or below, drop all items and die
            if (gameActive && myHealth <= 0 && (!elDeathScreen || elDeathScreen.style.display !== 'flex')) {
                declareLoser("You ran out of health!");
            }

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
            
            // --- WEATHER UPDATES ---
            if (gameActive) {
                if (isHost) {
                    weatherTimer -= delta;
                    if (weatherTimer <= 0) {
                        const r = Math.random();
                        let nextWeather = 'clear';
                        if (r < 0.25) {
                            nextWeather = 'rain';
                        } else if (r < 0.35) {
                            nextWeather = 'thunder';
                        }
                        setWeather(nextWeather);
                        weatherTimer = 60.0 + Math.random() * 90.0;
                        if (isConnected) {
                            sendNetworkMessage({ type: 'weather-sync', weather: currentWeather });
                        }
                    }
                }

                // Update rain particles positions relative to camera
                if (rainParticles && rainParticles.visible) {
                    rainParticles.position.set(camera.position.x, camera.position.y, camera.position.z);
                    const posAttr = rainParticles.geometry.attributes.position;
                    const posArray = posAttr.array;
                    const vArray = rainParticles.userData.velocities;
                    for (let i = 0; i < posArray.length / 3; i++) {
                        posArray[i * 3 + 1] -= vArray[i] * delta; // Fall down
                        
                        // If it falls below a threshold relative to camera, reset to top
                        if (posArray[i * 3 + 1] < -15) {
                            posArray[i * 3] = (Math.random() - 0.5) * 50;
                            posArray[i * 3 + 1] = 20 + Math.random() * 15;
                            posArray[i * 3 + 2] = (Math.random() - 0.5) * 50;
                        }
                    }
                    posAttr.needsUpdate = true;
                }

                // Thunder lightning updates
                if (currentWeather === 'thunder' && !playerInCave) {
                    lightningFlashTimer -= delta;
                    if (lightningFlashTimer <= 0) {
                        isLightningFlashing = true;
                        lightningFlashDuration = 0.15 + Math.random() * 0.25;
                        lightningFlashTimer = 5.0 + Math.random() * 12.0; // Next flash in 5-17s
                        
                        // Play synthesized thunder sound!
                        AudioSynth.playThunder();
                    }
                    
                    if (isLightningFlashing) {
                        lightningFlashDuration -= delta;
                        if (lightningFlashDuration <= 0) {
                            isLightningFlashing = false;
                        }
                    }
                } else {
                    isLightningFlashing = false;
                }
            }
            
            // Update Quantum Cubes
            updateQuantumCubes(delta);

            // Update procedural terrain chunks around player
            updateChunks();
            
            // Update World Trees (shaking, felling, rotting)
            updateWorldTrees(delta);

            // Host updates zombies and bees
            if (isHost && gameActive) {
                updateZombies(delta);
                updateBees(delta);
            } else if (!isHost && gameActive) {
                clientZombies.forEach((mesh) => {
                    if (mesh.zombieType === 'crawling_tree' || mesh.zombieType === 'mimic_mushroom') {
                        animateCrawlingTreeMesh(mesh, mesh.crawlingTreeState || 'standing', mesh.attackAnimProgress || 0, delta, Date.now());
                    }
                });
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
                        if (mesh.children[1] && mesh.children[2]) {
                            // Only flap wings if the bee is alive (not rotated upside down)
                            if (Math.abs(mesh.rotation.x - Math.PI) > 0.01) {
                                const t = Date.now();
                                mesh.children[1].rotation.z = Math.sin(t * 0.08) * 0.6;
                                mesh.children[2].rotation.z = -Math.sin(t * 0.08) * 0.6;
                            }
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
                updatePlacementPreview(); // Update block placement outline preview
                checkTrashCans();
                
                // Turret Proximity HUD prompt & Camera lock updates
                updateTurretState(delta);

                updatePlayerBurning(delta);
                updateContinuousMining(delta);
            }

            if (gameActive) {
                updateVillagers(delta);
                updateProjectiles(delta);
                updateAnimals(delta);
                updateDroppedFoods(delta);
                updateHunger(delta);
                updateFurnaces(delta);
                updateCampfires(delta);
                updateBlockCracksDecay(delta);
                updateFishing(delta);
                updateFloatingBlocks(delta);
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

            // Spawn particles from placed fire blocks
            placedObjects.forEach(obj => {
                if (obj.type === 'fire') {
                    if (Math.random() < 0.15) {
                        spawnFireParticles(obj.pos, 1);
                    }
                }
            });

            updateFireParticles(delta);
            updateEatingParticles(delta);

            if (mapOpen) {
                drawRadarMap();
            }

            // Decay camera recoil
            camHitRecoil.lerp(new THREE.Vector3(), 0.15);
            camHitTilt = THREE.MathUtils.lerp(camHitTilt, 0, 0.15);

            // Save original camera position & rotation
            const originalCamPos = camera.position.clone();
            const originalCamRotX = camera.rotation.x;
            const originalCamRotY = camera.rotation.y;

            // Apply visual offsets to camera and zombies before rendering
            camera.position.add(camHitRecoil);
            camera.rotation.x += camHitTilt;

            // Update player model position & rotation (feet is 1.6m below head camera position)
            if (playerMeshGroup) {
                const px = originalCamPos.x;
                const py = originalCamPos.y - 1.6;
                const pz = originalCamPos.z;
                
                playerMeshGroup.position.set(px, py, pz);
                playerMeshGroup.rotation.y = originalCamRotY;
                
                if (playerHead) {
                    playerHead.rotation.x = originalCamRotX;
                }
                
                // Animate arms & legs if moving
                const isMoving = moveForces.forward || moveForces.backward || moveForces.left || moveForces.right;
                if (isMoving) {
                    const walkSpeed = 10;
                    const legAngle = Math.sin(time * walkSpeed) * 0.5;
                    if (playerLArm) playerLArm.rotation.x = -legAngle;
                    if (playerRArm) playerRArm.rotation.x = legAngle;
                    if (playerLLeg) playerLLeg.rotation.x = legAngle;
                    if (playerRLeg) playerRLeg.rotation.x = -legAngle;
                } else {
                    if (playerLArm) playerLArm.rotation.x = 0;
                    if (playerRArm) playerRArm.rotation.x = 0;
                    if (playerLLeg) playerLLeg.rotation.x = 0;
                    if (playerRLeg) playerRLeg.rotation.x = 0;
                }
            }

            if (playerMeshGroup) playerMeshGroup.visible = false;

            for (let [mesh, r] of zombieRecoilMap) {
                r.pos.lerp(new THREE.Vector3(), 0.15);
                r.rotX = THREE.MathUtils.lerp(r.rotX, 0, 0.15);
                mesh.position.add(r.pos);
                mesh.rotation.x = r.rotX;
            }

            renderer.render(scene, camera);

            // Restore camera position & rotation immediately after rendering to keep physics clean
            camera.position.copy(originalCamPos);
            camera.rotation.set(originalCamRotX, originalCamRotY, camera.rotation.z);

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

            // 2c. Check if near any cave entrance or exit
            if (!playerInCave) {
                let closestEntrance = null;
                let minEntranceDist = Infinity;
                caveEntrances.forEach(ent => {
                    const dx = camera.position.x - ent.x;
                    const dz = camera.position.z - ent.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < minEntranceDist) {
                        minEntranceDist = dist;
                        closestEntrance = ent;
                    }
                });

                if (closestEntrance && minEntranceDist < 3.0) {
                    elTurretPrompt.innerText = "PRESS [F] TO ENTER CAVE";
                    elTurretPrompt.style.display = "block";
                    elTurretPrompt.style.borderColor = "var(--magenta)";
                    elTurretPrompt.style.color = "var(--magenta)";
                    elTurretPrompt.style.textShadow = "0 0 8px rgba(255, 0, 255, 0.6)";
                    return;
                }
            } else {
                let closestExit = null;
                let minExitDist = Infinity;
                caveExits.forEach(ex => {
                    const dx = camera.position.x - ex.x;
                    const dz = camera.position.z - ex.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < minExitDist) {
                        minExitDist = dist;
                        closestExit = ex;
                    }
                });

                if (closestExit && minExitDist < 3.0) {
                    elTurretPrompt.innerText = "PRESS [F] TO EXIT CAVE";
                    elTurretPrompt.style.display = "block";
                    elTurretPrompt.style.borderColor = "var(--magenta)";
                    elTurretPrompt.style.color = "var(--magenta)";
                    elTurretPrompt.style.textShadow = "0 0 8px rgba(255, 0, 255, 0.6)";
                    return;
                }
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

            // 3b. Check if near and aiming at a crafting bench
            const aimedBench = getCraftingBenchAimTarget();
            if (aimedBench) {
                elTurretPrompt.innerText = "CLICK TO USE CRAFTING BENCH";
                elTurretPrompt.style.display = "block";
                elTurretPrompt.style.borderColor = "var(--cyan)";
                elTurretPrompt.style.color = "var(--cyan)";
                elTurretPrompt.style.textShadow = "0 0 8px rgba(0, 240, 255, 0.6)";
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

            // Cave specific atmospheric overrides
            if (playerInCave) {
                skyColor.setHex(0x000000);
                skyMat.color.copy(skyColor);
                scene.fog.color.copy(skyColor);
                renderer.setClearColor(skyColor);
                
                if (ambientLight) {
                    ambientLight.intensity = 0.05; // extremely dark
                }
                
                sunLight.intensity = 0;
                if (sunSphere) sunSphere.visible = false;
                moonLight.intensity = 0;
                if (moonSphere) moonSphere.visible = false;
                if (starField) starField.material.opacity = 0;
                
                // Ensure torch pointlight is active and positioned at the player camera
                if (!torchLight) {
                    torchLight = new THREE.PointLight(0xfff0dd, 0.85, 25.0); // warm light
                    scene.add(torchLight);
                }
                torchLight.position.copy(camera.position);
                torchLight.visible = true;
                
                // Also center sky dome and starfield on player
                if (skyMesh) skyMesh.position.copy(camera.position);
                if (starField) starField.position.copy(camera.position);
                
                return;
            } else {
                if (torchLight) {
                    torchLight.visible = false;
                }
            }

            // Apply weather-based modifiers to color/light
            let finalSunIntensity = sunIntensity;
            let finalMoonIntensity = moonIntensity;
            let finalAmbientIntensity = (cycleTime < 540) ? 0.4 : 0.55;

            if (!playerInCave) {
                if (currentWeather === 'rain') {
                    // Blend sky color to gray
                    skyColor.lerp(new THREE.Color(0x3a3d45), 0.7);
                    finalSunIntensity *= 0.45;
                    finalMoonIntensity *= 0.45;
                    finalAmbientIntensity *= 0.6;
                } else if (currentWeather === 'thunder') {
                    if (isLightningFlashing) {
                        skyColor.setHex(0xffffff);
                        finalSunIntensity = 2.0;
                        finalMoonIntensity = 2.0;
                        finalAmbientIntensity = 1.8;
                    } else {
                        // Blend sky color to dark gray
                        skyColor.lerp(new THREE.Color(0x1e2026), 0.85);
                        finalSunIntensity *= 0.2;
                        finalMoonIntensity *= 0.2;
                        finalAmbientIntensity *= 0.35;
                    }
                }
            }

            skyMat.color.copy(skyColor);
            scene.fog.color.copy(skyColor);
            renderer.setClearColor(skyColor);

            // Center sky dome and starfield on player
            if (skyMesh) skyMesh.position.copy(camera.position);
            if (starField) starField.position.copy(camera.position);

            // Set ambient light intensity dynamically
            if (ambientLight) {
                ambientLight.intensity = finalAmbientIntensity;
            }

            // Position celestial body spheres relative to player
            const px = camera ? camera.position.x : 0;
            const pz = camera ? camera.position.z : 0;

            if (cycleTime < 540) {
                sunLight.intensity = finalSunIntensity;
                sunLight.position.set(px + Math.cos(sunAngle) * 150, Math.sin(sunAngle) * 150, pz);
                sunSphere.position.copy(sunLight.position);
                sunSphere.visible = true;
                
                moonLight.intensity = 0;
                moonSphere.visible = false;
            } else {
                sunLight.intensity = 0;
                sunSphere.visible = false;
                
                moonLight.intensity = finalMoonIntensity;
                moonLight.position.set(px + Math.cos(moonAngle) * 150, Math.sin(moonAngle) * 150, pz);
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

            // Check if player is submerged (underwater)
            const pdx = camera.position.x - LAKE_CENTER_X;
            const pdz = camera.position.z - LAKE_CENTER_Z;
            const pDistToLake = Math.sqrt(pdx * pdx + pdz * pdz);
            const inQuantumLands = (camera.position.x > 1400);

            const isSubmergedOverworld = !inQuantumLands && !playerInCave && (pDistToLake < LAKE_RADIUS || getTerrainHeight(camera.position.x, camera.position.z, false) <= WATER_Y) && camera.position.y <= WATER_Y;
            const isSubmergedCave = false;
            const isSubmergedQuantum = inQuantumLands && camera.position.y <= -39.0;

            const elWaterVignette = document.getElementById('water-vignette');
            if (elWaterVignette) {
                if (isSubmergedOverworld || isSubmergedCave) {
                    elWaterVignette.className = 'active-overworld';
                } else if (isSubmergedQuantum) {
                    elWaterVignette.className = 'active-quantum';
                } else {
                    elWaterVignette.className = '';
                }
            }

            if (isSubmergedOverworld || isSubmergedCave) {
                // Underwater fog matching ocean/lake blue
                const waterFogColor = new THREE.Color(0x0a3b66); // deep water blue
                scene.fog.color.copy(waterFogColor);
                renderer.setClearColor(waterFogColor);
                scene.fog.density = 0.08; // High density fog underwater
            } else if (isSubmergedQuantum) {
                // Underwater quantum pool fog
                const quantumFogColor = new THREE.Color(0x00ff33);
                scene.fog.color.copy(quantumFogColor);
                renderer.setClearColor(quantumFogColor);
                scene.fog.density = 0.08;
            } else if (inQuantumLands) {
                // Eerie dark quantum green sky - BRIGHTENED
                const qSkyColor = new THREE.Color(0x124727); // lighter green/emerald
                skyMat.color.copy(qSkyColor);
                scene.fog.color.copy(qSkyColor);
                renderer.setClearColor(qSkyColor);
                
                // Dense fog
                scene.fog.density = 0.010; // less dense fog (was 0.022)
                
                if (ambientLight) {
                    ambientLight.intensity = 0.55; // brighter ambient (was 0.25)
                    ambientLight.color.setHex(0x39ff14); // neon/emerald green ambient glow
                }
                if (sunLight) sunLight.intensity = 0;
                if (moonLight) {
                    moonLight.intensity = 0.45; // brighter green glow (was 0.15)
                    moonLight.color.setHex(0x39ff14);
                }
                if (typeof starField !== 'undefined' && starField.material) {
                    starField.material.opacity = 0.4; // brighter stars (was 0.2)
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
            mapCtx.fillStyle = 'rgba(100, 255, 130, 0.22)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(-150), mapZ(-350), scaleR(180), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(100, 255, 130, 0.3)';
            mapCtx.stroke();

            mapCtx.fillStyle = 'rgba(100, 255, 130, 0.65)';
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

            // 5. Second Village Island (center -350, 250, radius 180) - Green Village
            mapCtx.fillStyle = 'rgba(100, 255, 130, 0.22)';
            mapCtx.beginPath();
            mapCtx.arc(mapX(-350), mapZ(250), scaleR(180), 0, 2 * Math.PI);
            mapCtx.fill();
            mapCtx.strokeStyle = 'rgba(100, 255, 130, 0.3)';
            mapCtx.stroke();

            mapCtx.fillStyle = 'rgba(100, 255, 130, 0.65)';
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
                    if (z.isDead) return;
                    if ((z.type === 'crawling_tree' || z.type === 'mimic_mushroom') && z.state === 'standing') return;
                    
                    const zx = mapX(z.mesh.position.x);
                    const zz = mapZ(z.mesh.position.z);
                    mapCtx.fillStyle = z.type === 'creeper' ? '#ff3300' : (z.type === 'skeleton' ? '#e6e6e6' : (z.type === 'crawling_tree' ? '#2d5a27' : (z.type === 'mimic_mushroom' ? '#ff00a0' : '#39ff14')));
                    mapCtx.beginPath();
                    mapCtx.arc(zx, zz, 4.5, 0, 2 * Math.PI);
                    mapCtx.fill();
                });
            } else {
                clientZombies.forEach(mesh => {
                    if ((mesh.zombieType === 'crawling_tree' || mesh.zombieType === 'mimic_mushroom') && mesh.crawlingTreeState === 'standing') return;
                    
                    const zx = mapX(mesh.position.x);
                    const zz = mapZ(mesh.position.z);
                    mapCtx.fillStyle = mesh.zombieType === 'creeper' ? '#ff3300' : (mesh.zombieType === 'skeleton' ? '#e6e6e6' : (mesh.zombieType === 'crawling_tree' ? '#2d5a27' : (mesh.zombieType === 'mimic_mushroom' ? '#ff00a0' : '#39ff14')));
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
                    ry: camera.rotation.y,
                    inCave: playerInCave
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
            const inQuantum = (camera.position.x > 1400);
            // Lock position if in turret, bush, riding a quantum cube, or riding a horse
            if (inTurret || inBush || (typeof ridingCube !== 'undefined' && ridingCube) || ridingHorse) {
                if (inBush) {
                    const bush = bushes.find(b => b.id === activeBushId);
                    if (bush) {
                        camera.position.set(bush.x, bush.y + 1.2, bush.z);
                    }
                } else if (inTurret) {
                    camera.position.set(turretPos.x, turretPos.y + 1.8, turretPos.z);
                } else if (ridingCube) {
                    // Position camera 3.2m above cube center (1.6m cube height + 1.6m eye level) so player stands ON it
                    camera.position.set(ridingCube.mesh.position.x, ridingCube.mesh.position.y + 3.2, ridingCube.mesh.position.z);
                    velocity.set(0, 0, 0);
                    knockbackVel.set(0, 0, 0);
                } else if (ridingHorse && activeHorse) {
                    camera.position.set(activeHorse.mesh.position.x, activeHorse.mesh.position.y + 1.8, activeHorse.mesh.position.z);
                    velocity.set(0, 0, 0);
                    knockbackVel.set(0, 0, 0);
                }
                return;
            }

            // Check if player is in water
            const initialTerrainY = getTerrainHeight(camera.position.x, camera.position.z, playerInCave);
            const initialPdx = camera.position.x - LAKE_CENTER_X;
            const initialPdz = camera.position.z - LAKE_CENTER_Z;
            const initialPDistToLake = Math.sqrt(initialPdx * initialPdx + initialPdz * initialPdz);
            let isPlayerInWater = false;
            if (playerInCave) {
                isPlayerInWater = false;
            } else {
                const distToDesert = Math.sqrt(Math.pow(camera.position.x - 350, 2) + Math.pow(camera.position.z + 350, 2));
                const inDesert = distToDesert < 180;
                isPlayerInWater = !inQuantum && !inDesert && (initialPDistToLake < LAKE_RADIUS || initialTerrainY <= WATER_Y) && camera.position.y < WATER_Y + 1.8;
            }

            // Apply friction decelerations
            velocity.x -= velocity.x * (isPlayerInWater ? 12.0 : 8.5) * delta; // higher friction in water
            velocity.z -= velocity.z * (isPlayerInWater ? 12.0 : 8.5) * delta;
            
            knockbackVel.x -= knockbackVel.x * 4.5 * delta;
            knockbackVel.z -= knockbackVel.z * 4.5 * delta;

            // Ladder detection
            let nearLadder = false;
            placedObjects.forEach(obj => {
                if (obj.type === 'ladder') {
                    const dx = camera.position.x - obj.pos.x;
                    const dz = camera.position.z - obj.pos.z;
                    const distXZ = Math.sqrt(dx * dx + dz * dz);
                    const py = camera.position.y - 1.6;
                    const oy = obj.pos.y;
                    if (distXZ < 0.8 && py >= oy - 0.2 && py <= oy + 1.2) {
                        nearLadder = true;
                    }
                }
            });

            // Gravity & buoyant floating & ladder climbing
            if (nearLadder) {
                if (moveForces.jump) {
                    velocity.y = 3.5; // Climb up
                } else {
                    velocity.y = Math.max(-1.5, velocity.y * 0.4); // Slide down slowly
                }
                isGrounded = true;
            } else if (isPlayerInWater) {
                // Gravity is weaker in water (buoyant effect)
                velocity.y -= 9.8 * 0.4 * delta;
                // Vertical drag
                velocity.y -= velocity.y * 4.0 * delta;

                // Swim up when holding space
                if (moveForces.jump) {
                    velocity.y = Math.min(3.5, velocity.y + 15.0 * delta);
                }
            } else {
                // Gravity depends on physics mode
                let gravityAcc = 9.8 * 2.2;
                if (physicsMode === 'moon') {
                    gravityAcc = 9.8 * 0.55;
                }
                velocity.y -= gravityAcc * delta;
            }

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

            // Constraint for deep desert holes (cannot get out if depth >= 3 digs unless towered)
            const distToDesert = Math.sqrt(Math.pow(camera.position.x - 350, 2) + Math.pow(camera.position.z + 350, 2));
            if (!playerInCave && distToDesert < 180) {
                const px = camera.position.x;
                const pz = camera.position.z;
                
                let nearestHole = null;
                let nearestDist = Infinity;
                
                if (typeof minedDesertHoles !== 'undefined' && minedDesertHoles && minedDesertHoles.size > 0) {
                    minedDesertHoles.forEach(coordKey => {
                        const parts = coordKey.split(',');
                        if (parts.length === 3) {
                            const hx = parseFloat(parts[0]);
                            const hz = parseFloat(parts[1]);
                            const depth = parseInt(parts[2]);
                            if (depth >= 3) {
                                const dist = Math.sqrt(Math.pow(px - hx, 2) + Math.pow(pz - hz, 2));
                                if (dist < nearestDist) {
                                    nearestDist = dist;
                                    nearestHole = { x: hx, z: hz, depth: depth };
                                }
                            }
                        }
                    });
                }
                
                if (nearestHole && nearestDist < 1.8) {
                    const unminedY = getTerrainHeight(px, pz, false, true); // ignoreMinedHoles = true
                    const feetY = camera.position.y - 1.6;
                    const remainingDepth = unminedY - feetY;
                    
                    if (remainingDepth > 2.2) {
                        // Player is inside a deep hole. Prevent escape horizontally
                        if (nearestDist > 1.0) {
                            const angle = Math.atan2(pz - nearestHole.z, px - nearestHole.x);
                            camera.position.x = nearestHole.x + Math.cos(angle) * 1.0;
                            camera.position.z = nearestHole.z + Math.sin(angle) * 1.0;
                            velocity.x = 0;
                            velocity.z = 0;
                        }
                    }
                }
            }

            let groundedThisFrame = nearLadder;
            let stepUpY = -Infinity;
            let shouldStepUp = false;

            // Check collision with placed blocks
            placedObjects.forEach(obj => {
                if (obj.type === 'ladder' || obj.type === 'fire') return; // Ladders and fire do not block player movement horizontally
                if (obj.type === 'door' && obj.isOpen) return; // Open doors do not block player

                const px = camera.position.x;
                const pz = camera.position.z;
                const ox = obj.pos.x;
                const oz = obj.pos.z;
                
                const widthX = (obj.type === 'crafting_bench') ? 1.6 : 0.9;
                const widthZ = (obj.type === 'crafting_bench') ? 0.7 : 0.9;
                const playerRadius = 0.4;
                
                const dx = Math.abs(px - ox);
                const dz = Math.abs(pz - oz);
                
                const limitX = widthX / 2 + playerRadius;
                const limitZ = widthZ / 2 + playerRadius;
                
                const py = camera.position.y - 1.6;
                const oy = obj.pos.y;
                const height = (obj.type === 'crafting_bench') ? 1.0 : (obj.type === 'door' ? 1.8 : ((obj.type === 'stone_slab' || obj.type === 'bed') ? 0.45 : 0.9));
                
                if (dx < limitX && dz < limitZ && py < oy + height && py + 1.8 > oy) {
                    const stepHeight = (oy + height) - py;
                    if (stepHeight > 0 && stepHeight <= 1.05) {
                        // Check if player's body would collide with anything at the stepped-up position
                        let wouldCollide = false;
                        const testPy = oy + height;
                        for (let k = 0; k < placedObjects.length; k++) {
                            const o2 = placedObjects[k];
                            if (o2 === obj) continue;
                            if (o2.type === 'ladder' || o2.type === 'fire') continue;
                            if (o2.type === 'door' && o2.isOpen) continue;
                            
                            const o2WidthX = (o2.type === 'crafting_bench') ? 1.6 : 0.9;
                            const o2WidthZ = (o2.type === 'crafting_bench') ? 0.7 : 0.9;
                            const o2LimitX = o2WidthX / 2 + playerRadius;
                            const o2LimitZ = o2WidthZ / 2 + playerRadius;
                            const o2Height = (o2.type === 'crafting_bench') ? 1.0 : (o2.type === 'door' ? 1.8 : (o2.type === 'stone_slab' ? 0.45 : 0.9));
                            
                            const o2dx = Math.abs(px - o2.pos.x);
                            const o2dz = Math.abs(pz - o2.pos.z);
                            const o2py = o2.pos.y;
                            
                            if (o2dx < o2LimitX && o2dz < o2LimitZ && testPy < o2py + o2Height && testPy + 1.8 > o2py) {
                                wouldCollide = true;
                                break;
                            }
                        }
                        
                        if (!wouldCollide) {
                            shouldStepUp = true;
                            if (oy + height > stepUpY) {
                                stepUpY = oy + height;
                            }
                            return; // skip horizontal resolution pushback for this block
                        }
                    }
                    
                    const penX = limitX - dx;
                    const penZ = limitZ - dz;
                    
                    if (penX < penZ) {
                        if (px > ox) {
                            camera.position.x += penX;
                        } else {
                            camera.position.x -= penX;
                        }
                        velocity.x = 0;
                    } else {
                        if (pz > oz) {
                            camera.position.z += penZ;
                        } else {
                            camera.position.z -= penZ;
                        }
                        velocity.z = 0;
                    }
                }
            });

            if (shouldStepUp) {
                camera.position.y = stepUpY + 1.6;
                velocity.y = 0;
                groundedThisFrame = true;
            }

            camera.position.y += velocity.y * delta;

            // Resolve vertical AABB collision with placed blocks (grounding & head bump)
            placedObjects.forEach(obj => {
                if (obj.type === 'ladder' || obj.type === 'fire') return;
                if (obj.type === 'door' && obj.isOpen) return;

                const px = camera.position.x;
                const pz = camera.position.z;
                const ox = obj.pos.x;
                const oz = obj.pos.z;

                const widthX = (obj.type === 'crafting_bench') ? 1.6 : 0.9;
                const widthZ = (obj.type === 'crafting_bench') ? 0.7 : 0.9;
                const playerRadius = 0.4;

                const dx = Math.abs(px - ox);
                const dz = Math.abs(pz - oz);

                const limitX = widthX / 2 + playerRadius;
                const limitZ = widthZ / 2 + playerRadius;

                if (dx < limitX && dz < limitZ) {
                    const py = camera.position.y - 1.6;
                    const oy = obj.pos.y;
                    const height = (obj.type === 'crafting_bench') ? 1.0 : (obj.type === 'door' ? 1.8 : ((obj.type === 'stone_slab' || obj.type === 'bed') ? 0.45 : 0.9));

                    // Falling onto block (grounding)
                    if (velocity.y <= 0) {
                        if (py >= oy + height - 0.3 && py < oy + height) {
                            if (physicsMode === 'bouncy' && velocity.y < -3.0) {
                                velocity.y = -velocity.y * 0.75;
                                AudioSynth.playBounce(camera.position);
                            } else {
                                camera.position.y = oy + height + 1.6;
                                velocity.y = 0;
                                groundedThisFrame = true;
                            }
                        }
                    }
                    // Jumping into block from below (head bump)
                    else if (velocity.y > 0) {
                        if (py + 1.8 > oy && py + 1.8 < oy + 0.3) {
                            camera.position.y = oy - 0.201; // snap head to bottom of block
                            velocity.y = 0;
                        }
                    }
                }
            });

            // Snap Y coordinate to heightmapped terrain Y
            const terrainY = getTerrainHeight(camera.position.x, camera.position.z, playerInCave);
            if (camera.position.y < terrainY + 1.6) {
                if (physicsMode === 'bouncy' && velocity.y < -3.0) {
                    velocity.y = -velocity.y * 0.75;
                    camera.position.y = terrainY + 1.6;
                    AudioSynth.playBounce(camera.position);
                } else {
                    velocity.y = 0;
                    camera.position.y = terrainY + 1.6;
                    groundedThisFrame = true;
                }
            }

            if (groundedThisFrame) {
                if (!isGrounded) {
                    const fallDistance = highestYSinceGrounded - camera.position.y;
                    if (fallDistance >= 3.0) {
                        if (!isPlayerInWater && !nearLadder && currentGameMode !== 'freedom' && physicsMode !== 'moon' && physicsMode !== 'bouncy' && !ridingBoat && !inTurret && !inBush) {
                            const damage = Math.round((fallDistance - 3.0) * 15);
                            if (damage > 0) {
                                takeDamage(damage, 0, 0, "Fell from a high place");
                            }
                        }
                    }
                }
                highestYSinceGrounded = camera.position.y;
            } else {
                if (camera.position.y > highestYSinceGrounded) {
                    highestYSinceGrounded = camera.position.y;
                }
            }

            isGrounded = groundedThisFrame;

            // Ceiling collision inside cave
            if (playerInCave) {
                const ceilingY = getCaveCeilingHeight(camera.position.x, camera.position.z);
                if (camera.position.y > ceilingY - 0.4) {
                    camera.position.y = ceilingY - 0.4;
                    if (velocity.y > 0) velocity.y = 0;
                }
            }

            // Boundary mountain colliders (keep players within 3,000,000m coordinates)
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
                // Overworld boundary clamping: 3000000m radius centered at (0, 0)
                const distFromCenter = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
                if (distFromCenter > 3000000) {
                    const angle = Math.atan2(camera.position.z, camera.position.x);
                    camera.position.x = Math.cos(angle) * 3000000;
                    camera.position.z = Math.sin(angle) * 3000000;
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
                const baseY = getTerrainHeight(250, 350, false);
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
                    const baseY = getTerrainHeight(250, 350, false);
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
            if (playerInCave) {
                isPlayerInWater = false;
            } else {
                isPlayerInWater = !inQuantum && (pDistToLake < LAKE_RADIUS || terrainY <= WATER_Y) && camera.position.y < WATER_Y + 1.8;
            }
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
                            if (z.type === 'mimic_mushroom') {
                                makeMimicMushroomFlee(z, undefined, undefined, kVel.x, kVel.z);
                            }
                            z.kx = kVel.x * 12.0;
                            z.kz = kVel.z * 12.0;
                            if (z.health <= 0) {
                                z.isDead = true;
                                z.deathTime = 0;
                                handleZombieDeathDrops(z);
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
                    if (a.rider === 'local') continue; // Don't shoot your own horse!
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
                            handleAnimalDeathDrops(a);
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

            // 6. Host-side error404 projectiles (physics and damage)
            if (isHost) {
                for (let i = errorProjectiles.length - 1; i >= 0; i--) {
                    const p = errorProjectiles[i];
                    p.pos.addScaledVector(p.vel, delta);
                    p.mesh.position.copy(p.pos);
                    
                    const terrainY = getTerrainHeight(p.pos.x, p.pos.z);
                    if (p.pos.y < terrainY) {
                        scene.remove(p.mesh);
                        errorProjectiles.splice(i, 1);
                        continue;
                    }
                    
                    // Check hit against local player (host)
                    const px = camera.position.x;
                    const py = camera.position.y;
                    const pz = camera.position.z;
                    const distToHost = p.pos.distanceTo(new THREE.Vector3(px, py - 0.5, pz));
                    if (distToHost < 2.2) {
                        const kVel = p.vel.clone().normalize().multiplyScalar(15.0);
                        takeDamage(25, kVel.x, kVel.z, "Blasted by error404!");
                        scene.remove(p.mesh);
                        errorProjectiles.splice(i, 1);
                        continue;
                    }
                    
                    // Check hit against client player (opponent)
                    if (opponentGroup && oppHealth > 0 && isConnected) {
                        const ox = opponentGroup.position.x;
                        const oy = opponentGroup.position.y;
                        const oz = opponentGroup.position.z;
                        const distToClient = p.pos.distanceTo(new THREE.Vector3(ox, oy + 1.0, oz));
                        if (distToClient < 2.2) {
                            const kVel = p.vel.clone().normalize().multiplyScalar(15.0);
                            sendNetworkMessage({
                                type: 'zombie-hit',
                                damage: 25,
                                kx: kVel.x,
                                kz: kVel.z
                            });
                            scene.remove(p.mesh);
                            errorProjectiles.splice(i, 1);
                            continue;
                        }
                    }
                    
                    // Check hit against villagers
                    let villagerHit = false;
                    for (let j = villagers.length - 1; j >= 0; j--) {
                        const v = villagers[j];
                        if (v.isDead) continue;
                        const vChestPos = v.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
                        const distToVillager = p.pos.distanceTo(vChestPos);
                        if (distToVillager < 2.2) {
                            villagerHit = true;
                            const kVel = p.vel.clone().normalize().multiplyScalar(15.0);
                            v.health = Math.max(0, v.health - 25);
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
                                damage: 25,
                                kx: kVel.x,
                                kz: kVel.z
                            });
                            scene.remove(p.mesh);
                            errorProjectiles.splice(i, 1);
                            break;
                        }
                    }
                    if (villagerHit) continue;
                }
            }

            // 7. Peer-side error404 projectiles (visuals only)
            for (let i = peerErrorProjectiles.length - 1; i >= 0; i--) {
                const p = peerErrorProjectiles[i];
                p.pos.addScaledVector(p.vel, delta);
                p.mesh.position.copy(p.pos);
                
                const terrainY = getTerrainHeight(p.pos.x, p.pos.z);
                if (p.pos.y < terrainY) {
                    scene.remove(p.mesh);
                    peerErrorProjectiles.splice(i, 1);
                }
            }
        }

        // Local FP hands and weapons animations
        function updateFirstPersonAnimations(delta) {
            const t = clock.getElapsedTime();
            firstPersonHands.position.y = Math.sin(t * 2.5) * 0.01;
            firstPersonHands.position.x = Math.cos(t * 1.25) * 0.005;

            // Eating Food Animation
            if (isEating) {
                const currentItem = hotbarItems[selectedHotbarIndex];
                if (!currentItem || !['porkchop', 'beef', 'mutton', 'chicken', 'raw_fish', 'cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'cooked_chicken', 'cooked_fish'].includes(currentItem)) {
                    isEating = false;
                    rightHand.position.set(0.35, -0.3, -0.7);
                    rightHand.rotation.set(0, 0, 0);
                } else {
                    eatingTimer += delta;
                    eatingSoundTimer += delta;
                    if (eatingSoundTimer >= 0.25) {
                        AudioSynth.playEating();
                        eatingSoundTimer = 0;
                        spawnEatingParticles(currentItem);
                    }

                    // Chewing movement & rotation toward mouth
                    const targetX = 0.1;
                    const targetY = -0.15;
                    const targetZ = -0.45;
                    
                    const chewingShakeY = Math.sin(eatingTimer * 35) * 0.03;
                    const chewingShakeX = Math.cos(eatingTimer * 20) * 0.015;
                    const chewingShakeZ = Math.sin(eatingTimer * 25) * 0.02;
                    
                    rightHand.position.set(
                        targetX + chewingShakeX,
                        targetY + chewingShakeY,
                        targetZ + chewingShakeZ
                    );
                    
                    rightHand.rotation.set(
                        0.5 + Math.sin(eatingTimer * 30) * 0.15,
                        -0.2,
                        -0.4
                    );

                    if (eatingTimer >= EAT_DURATION) {
                        isEating = false;
                        triggerEatFood();
                        rightHand.position.set(0.35, -0.3, -0.7);
                        rightHand.rotation.set(0, 0, 0);
                    }
                }
            } else if (localPunching) {
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
            } else if (opponentGroup) {
                opponentGroup.position.lerp(targetOpponentPos, 0.15);
                opponentGroup.rotation.y = lerpAngle(opponentGroup.rotation.y, targetOpponentRotY, 0.15);
                opponentGroup.visible = !opponentInvisible && (isDimensionCave(opponentInCave) === isDimensionCave(playerInCave));
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

        function playWaterSplashSound(pos) {
            AudioSynth.init();
            if (!AudioSynth.ctx) return;
            const now = AudioSynth.ctx.currentTime;
            const vol = AudioSynth.getSpatialVolume(pos, 60);
            if (vol <= 0.01) return;
            
            const osc = AudioSynth.ctx.createOscillator();
            const gain = AudioSynth.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);
            gain.gain.setValueAtTime(0.35 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
            
            osc.connect(gain);
            gain.connect(AudioSynth.ctx.destination);
            osc.start();
            osc.stop(now + 0.4);
        }

        function playFishingCatchSound(pos) {
            AudioSynth.init();
            if (!AudioSynth.ctx) return;
            const now = AudioSynth.ctx.currentTime;
            const vol = AudioSynth.getSpatialVolume(pos, 60);
            if (vol <= 0.01) return;
            
            const osc = AudioSynth.ctx.createOscillator();
            const gain = AudioSynth.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
            gain.gain.setValueAtTime(0.25 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);
            
            osc.connect(gain);
            gain.connect(AudioSynth.ctx.destination);
            osc.start();
            osc.stop(now + 0.3);
        }

        function cleanupBobber() {
            if (!activeBobber) return;
            scene.remove(activeBobber.mesh);
            scene.remove(activeBobber.lineMesh);
            if (activeBobber.fishMesh) {
                scene.remove(activeBobber.fishMesh);
            }
            activeBobber = null;
        }

        function castFishingLine() {
            if (!isRodBaited) {
                addChatMessage("Your fishing rod is not baited! Press E to bait it with String.", "system");
                return;
            }
            
            const geom = new THREE.SphereGeometry(0.08, 16, 16);
            const redMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5 });
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
            
            const bobberGroup = new THREE.Group();
            const topHalf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
            const bottomHalf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), whiteMat);
            bobberGroup.add(topHalf);
            bobberGroup.add(bottomHalf);
            
            const cameraDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            const spawnPos = camera.position.clone().addScaledVector(cameraDir, 1.2);
            bobberGroup.position.copy(spawnPos);
            scene.add(bobberGroup);
            
            const lineMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
            const lineGeom = new THREE.BufferGeometry().setFromPoints([spawnPos, spawnPos]);
            const lineMesh = new THREE.Line(lineGeom, lineMat);
            scene.add(lineMesh);
            
            const castVel = cameraDir.clone().multiplyScalar(15.0);
            castVel.y += 4.5;
            
            activeBobber = {
                mesh: bobberGroup,
                lineMesh: lineMesh,
                state: 'flying',
                pos: spawnPos,
                vel: castVel,
                fishMesh: null,
                fishTimer: 2.0 + Math.random() * 4.0,
                biteTimer: 0,
                fishSwimAngle: 0,
                fishSwimRadius: 2.0
            };
            
            AudioSynth.playWhoosh();
            addChatMessage("Cast the fishing line!", "system");
        }

        function reelFishingLine() {
            if (!activeBobber) return;
            
            if (activeBobber.state === 'biting') {
                const isJumpingBack = moveForces.backward && !isGrounded;
                
                if (isJumpingBack) {
                    playFishingCatchSound(activeBobber.pos);
                    addChatMessage("You hooked a fish! Pulling it in!", "system");
                    
                    const fishMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.8 });
                    const fishGroup = new THREE.Group();
                    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.25), fishMat);
                    fishGroup.add(body);
                    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.08), fishMat);
                    tail.position.z = -0.15;
                    fishGroup.add(tail);
                    
                    fishGroup.position.copy(activeBobber.pos);
                    scene.add(fishGroup);
                    
                    flyingFish = {
                        mesh: fishGroup,
                        start: activeBobber.pos.clone(),
                        progress: 0
                    };
                } else {
                    addChatMessage("The fish got away! You must jump backwards while reeling in to pull it out!", "system");
                }
            } else {
                addChatMessage("Reeled in the line.", "system");
            }
            
            cleanupBobber();
            isRodBaited = false;
        }

        function updateFishing(delta) {
            if (activeBobber) {
                if (activeBobber.state === 'flying') {
                    activeBobber.vel.y -= 9.8 * delta;
                    activeBobber.pos.addScaledVector(activeBobber.vel, delta);
                    activeBobber.mesh.position.copy(activeBobber.pos);
                    
                    const terrainH = getTerrainHeight(activeBobber.pos.x, activeBobber.pos.z, false);
                    if (activeBobber.pos.y <= WATER_Y) {
                        activeBobber.pos.y = WATER_Y;
                        activeBobber.vel.set(0, 0, 0);
                        activeBobber.state = 'settled';
                        playWaterSplashSound(activeBobber.pos);
                    } else if (activeBobber.pos.y <= terrainH) {
                        activeBobber.pos.y = terrainH;
                        activeBobber.vel.set(0, 0, 0);
                        activeBobber.state = 'settled';
                    }
                } else if (activeBobber.state === 'settled') {
                    const terrainH = getTerrainHeight(activeBobber.pos.x, activeBobber.pos.z, false);
                    const isWater = (terrainH <= WATER_Y);
                    
                    if (isWater) {
                        activeBobber.fishTimer -= delta;
                        if (activeBobber.fishTimer <= 0) {
                            const fishMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.8 });
                            const fishGroup = new THREE.Group();
                            const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.25), fishMat);
                            fishGroup.add(body);
                            const tail = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.08), fishMat);
                            tail.position.z = -0.15;
                            fishGroup.add(tail);
                            
                            const swimStartAngle = Math.random() * Math.PI * 2;
                            const fx = activeBobber.pos.x + Math.cos(swimStartAngle) * 2.0;
                            const fz = activeBobber.pos.z + Math.sin(swimStartAngle) * 2.0;
                            fishGroup.position.set(fx, WATER_Y - 0.15, fz);
                            scene.add(fishGroup);
                            
                            activeBobber.fishMesh = fishGroup;
                            activeBobber.state = 'luring';
                            activeBobber.fishSwimRadius = 2.0;
                            activeBobber.fishSwimAngle = swimStartAngle;
                        }
                    }
                } else if (activeBobber.state === 'luring') {
                    if (activeBobber.fishMesh) {
                        activeBobber.fishSwimAngle += delta * 2.5;
                        activeBobber.fishSwimRadius = Math.max(0, activeBobber.fishSwimRadius - delta * 0.6);
                        
                        const fx = activeBobber.pos.x + Math.cos(activeBobber.fishSwimAngle) * activeBobber.fishSwimRadius;
                        const fz = activeBobber.pos.z + Math.sin(activeBobber.fishSwimAngle) * activeBobber.fishSwimRadius;
                        activeBobber.fishMesh.position.set(fx, WATER_Y - 0.15, fz);
                        
                        activeBobber.fishMesh.lookAt(activeBobber.pos.x, WATER_Y - 0.15, activeBobber.pos.z);
                        
                        if (activeBobber.fishSwimRadius <= 0.1) {
                            activeBobber.state = 'biting';
                            activeBobber.biteTimer = 2.0;
                            playWaterSplashSound(activeBobber.pos);
                        }
                    }
                } else if (activeBobber.state === 'biting') {
                    const time = clock.getElapsedTime();
                    activeBobber.mesh.position.y = WATER_Y - 0.15 + Math.sin(time * 25.0) * 0.08;
                    activeBobber.biteTimer -= delta;
                    if (activeBobber.biteTimer <= 0) {
                        addChatMessage("The fish swam away...", "system");
                        if (activeBobber.fishMesh) {
                            scene.remove(activeBobber.fishMesh);
                            activeBobber.fishMesh = null;
                        }
                        activeBobber.mesh.position.y = WATER_Y;
                        activeBobber.state = 'settled';
                        activeBobber.fishTimer = 3.0 + Math.random() * 4.0;
                    }
                }
                
                if (activeBobber.lineMesh) {
                    const start = camera.position.clone().add(new THREE.Vector3(0.2, -0.3, -0.5).applyQuaternion(camera.quaternion));
                    const end = activeBobber.mesh.position.clone();
                    activeBobber.lineMesh.geometry.setFromPoints([start, end]);
                }
            }
            
            if (flyingFish) {
                flyingFish.progress += delta * 1.5;
                const start = flyingFish.start;
                const end = camera.position.clone().add(new THREE.Vector3(0, -0.4, -0.5).applyQuaternion(camera.quaternion));
                const current = new THREE.Vector3().lerpVectors(start, end, flyingFish.progress);
                const arcHeight = Math.sin(flyingFish.progress * Math.PI) * 2.5;
                current.y += arcHeight;
                
                flyingFish.mesh.position.copy(current);
                flyingFish.mesh.rotation.x += delta * 6.0;
                flyingFish.mesh.rotation.y += delta * 6.0;
                
                if (flyingFish.progress >= 1.0) {
                    addFoodToInventory('raw_fish');
                    scene.remove(flyingFish.mesh);
                    flyingFish = null;
                    updateInventoryUI();
                    updateHotbarUI();
                    addChatMessage("Caught a Raw Fish!", "system");
                }
            }
        }

        function handleKeyPressF() {
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen || inventoryOpen) return;

            const currentItem = hotbarItems[selectedHotbarIndex];
            if (currentItem === 'fishing_rod') {
                if (activeBobber) {
                    reelFishingLine();
                } else {
                    castFishingLine();
                }
                return;
            }
            
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
            
            // Check if near any cave entrance or exit to transition
            if (!playerInCave) {
                let closestEntrance = null;
                let minEntranceDist = Infinity;
                caveEntrances.forEach(ent => {
                    const dx = camera.position.x - ent.x;
                    const dz = camera.position.z - ent.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < minEntranceDist) {
                        minEntranceDist = dist;
                        closestEntrance = ent;
                    }
                });

                if (closestEntrance && minEntranceDist < 3.0) {
                    // Enter Cave
                    playerInCave = true;
                    const cx = closestEntrance.x;
                    const cz = closestEntrance.z;
                    const cy = getCaveFloorHeight(cx, cz) + 1.6;
                    camera.position.set(cx, cy, cz);
                    highestYSinceGrounded = camera.position.y;
                    velocity.set(0, 0, 0);
                    
                    sendNetworkMessage({
                        type: 'pos-sync',
                        x: cx,
                        y: cy - 1.6,
                        z: cz,
                        ry: camera.rotation.y,
                        inCave: true
                    });
                    
                    updateChunks();
                    addChatMessage("Entered the dark cave system.", "system");
                    return;
                }
            } else {
                let closestExit = null;
                let minExitDist = Infinity;
                caveExits.forEach(ex => {
                    const dx = camera.position.x - ex.x;
                    const dz = camera.position.z - ex.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < minExitDist) {
                        minExitDist = dist;
                        closestExit = ex;
                    }
                });

                if (closestExit && minExitDist < 3.0) {
                    // Exit Cave
                    playerInCave = false;
                    const ex = closestExit.x;
                    const ez = closestExit.z;
                    const ey = getTerrainHeight(ex, ez, false) + 1.6;
                    camera.position.set(ex, ey, ez);
                    highestYSinceGrounded = camera.position.y;
                    velocity.set(0, 0, 0);
                    
                    sendNetworkMessage({
                        type: 'pos-sync',
                        x: ex,
                        y: ey - 1.6,
                        z: ez,
                        ry: camera.rotation.y,
                        inCave: false
                    });
                    
                    updateChunks();
                    addChatMessage("Exited back to the surface.", "system");
                    return;
                }
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
                saveWorld(false);
            }
        }

        function returnHeldItemToInventory() {
            if (!heldItem) return;
            const type = heldItem.type;
            const count = heldItem.count;
            const durability = heldItem.durability !== undefined ? heldItem.durability : null;
            heldItem = null;
            
            for (let i = 0; i < count; i++) {
                addFoodToInventory(type, durability);
            }
            updateHotbarUI();
            updateInventoryUI();
            updateFloatingItemUI();
        }

        function onArmorSlotClick(slot) {
            if (heldItem) {
                const isValidArmor = heldItem.type.endsWith('_' + slot);
                const isGauntletsMatch = (slot === 'gauntlets' && (heldItem.type.endsWith('_gauntlets') || heldItem.type.endsWith('_guantlets')));
                
                if (isValidArmor || isGauntletsMatch) {
                    const temp = armorItems[slot];
                    armorItems[slot] = heldItem.type;
                    if (temp) {
                        heldItem = { type: temp, count: 1 };
                    } else {
                        heldItem = null;
                    }
                } else {
                    addChatMessage(`You can only equip ${slot} in this slot!`, "system");
                }
            } else {
                if (armorItems[slot]) {
                    heldItem = { type: armorItems[slot], count: 1 };
                    armorItems[slot] = null;
                }
            }
            updateInventoryUI();
            updateFloatingItemUI();
        }

        function onInventorySlotClick(slotType, index) {
            // Weapon slots are no longer permanent since fists/kicks are keys 1/2
            
            if (heldItem) {
                if (slotType === 'hotbar') {
                    const tempType = hotbarItems[index];
                    const tempCount = hotbarCounts[index];
                    const tempDurability = hotbarDurability[index];
                    
                    hotbarItems[index] = heldItem.type;
                    hotbarCounts[index] = heldItem.count;
                    hotbarDurability[index] = heldItem.durability !== undefined ? heldItem.durability : null;
                    
                    if (tempType) {
                        heldItem = { type: tempType, count: tempCount, durability: tempDurability };
                    } else {
                        heldItem = null;
                    }
                } else {
                    const tempType = inventoryItems[index];
                    const tempCount = inventoryCounts[index];
                    const tempDurability = inventoryDurability[index];
                    
                    inventoryItems[index] = heldItem.type;
                    inventoryCounts[index] = heldItem.count;
                    inventoryDurability[index] = heldItem.durability !== undefined ? heldItem.durability : null;
                    
                    if (tempType) {
                        heldItem = { type: tempType, count: tempCount, durability: tempDurability };
                    } else {
                        heldItem = null;
                    }
                }
            } else {
                if (slotType === 'hotbar') {
                    if (hotbarItems[index]) {
                        heldItem = { 
                            type: hotbarItems[index], 
                            count: hotbarCounts[index],
                            durability: hotbarDurability[index] !== undefined ? hotbarDurability[index] : null 
                        };
                        hotbarItems[index] = null;
                        hotbarCounts[index] = 0;
                        hotbarDurability[index] = null;
                    }
                } else {
                    if (inventoryItems[index]) {
                        heldItem = { 
                            type: inventoryItems[index], 
                            count: inventoryCounts[index],
                            durability: inventoryDurability[index] !== undefined ? inventoryDurability[index] : null 
                        };
                        inventoryItems[index] = null;
                        inventoryCounts[index] = 0;
                        inventoryDurability[index] = null;
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
            else if (item === 'cooked_porkchop') hungerRestored = 40;
            else if (item === 'beef') hungerRestored = 30;
            else if (item === 'cooked_beef') hungerRestored = 50;
            else if (item === 'mutton') hungerRestored = 15;
            else if (item === 'cooked_mutton') hungerRestored = 35;
            else if (item === 'chicken') hungerRestored = 10;
            else if (item === 'cooked_chicken') hungerRestored = 30;
            else if (item === 'raw_fish') hungerRestored = 12;
            else if (item === 'cooked_fish') hungerRestored = 25;

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
            
            if (isEating) {
                isEating = false;
                if (rightHand) {
                    rightHand.position.set(0.35, -0.3, -0.7);
                    rightHand.rotation.set(0, 0, 0);
                }
            }
            
            updateHotbarUI();
            
            const item = hotbarItems[idx];
            if (item === 'bow') {
                activeWeapon = 'bow';
            } else if (item && item.endsWith('_axe')) {
                activeWeapon = 'wooden_axe';
            } else if (item && item.endsWith('_sword')) {
                activeWeapon = 'wooden_sword';
            } else if (item && item.endsWith('_pickaxe')) {
                activeWeapon = 'wooden_pickaxe';
            } else if (item && item.endsWith('_shovel')) {
                activeWeapon = 'wooden_shovel';
            } else {
                activeWeapon = 'fists';
            }
            updateWeaponUI();
        }

        function updateHunger(delta) {
            if (!gameActive || myHealth <= 0) return;
            
            if (currentGameMode === 'freedom') {
                if (hunger !== 100) {
                    hunger = 100;
                    updateMinecraftStatsUI();
                }
                return;
            }
            
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
            
            if (hunger >= 95 && myHealth < 100) {
                if (now - lastRegenTime > 5000) {
                    myHealth = Math.min(100, myHealth + 2);
                    updateHud();
                    updateMinecraftStatsUI();
                    sendNetworkMessage({
                        type: 'health-sync',
                        health: myHealth
                    });
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
            charcoal: '🌑',
            campfire: '🔥',
            unlit_campfire: '🪵',
            fists: '✊',
            kick: '🦶',
            bow: '🏹',
            porkchop: '🥩',
            beef: '🍖',
            mutton: '🥓',
            chicken: '🍗',
            wooden_axe: '🪓',
            log: '🪵',
            crafting_bench: '🛠️',
            planks: '📦',
            sticks: '🥢',
            wooden_sword: '🗡️',
            wooden_pickaxe: '⛏️',
            coral: '🪸',
            furnace: '🔥',
            chest: '🧳',
            stone: '🪨',
            smooth_stone: '🪨',
            wool: '🧶',
            bed: '🛏️',
            raw_fish: '🐟',
            cooked_fish: '🍣',
            cooked_porkchop: '🍗',
            cooked_beef: '🥩',
            cooked_mutton: '🍖',
            cooked_chicken: '🍗',
            iron_ingot: '🪙',
            raw_iron: '🪨',
            coal: '🌑',
            leather: '💼',
            turtle_shell: '🐢',
            boat: '🛶',
            stone_stairs: '🪜',
            wooden_stairs: '🪜',
            stone_slab: '➖',
            door: '🚪',
            ladder: '🪜',
            stone_cutter: '⚙️',
            saddle: '🏇',
            wooden_shovel: '🪏',
            stone_shovel: '🪏',
            iron_shovel: '🪏',
            copper_shovel: '🪏',
            copper_pickaxe: '⛏️',
            copper_axe: '🪓',
            copper_sword: '⚔️',
            limestone: '⬜',
            flint: '☄️',
            flint_and_steel: '🔥',
            raw_copper: '🪨',
            copper_ingot: '🪙',
            sand: '🏜️',
            gunpowder: '🧂',
            tnt: '🧨',
            yellow_mushroom: '🍄',
            black_mushroom: '🍄',
            red_mushroom: '🍄',
            green_mushroom: '🍄'
        };
        
        const ITEM_NAMES = {
            yellow_mushroom: 'Yellow Mushroom',
            black_mushroom: 'Black Mushroom',
            red_mushroom: 'Red Mushroom',
            green_mushroom: 'Green Mushroom',
            charcoal: 'Charcoal',
            campfire: 'Campfire',
            unlit_campfire: 'Unlit Campfire',
            fists: 'Fists',
            kick: 'Kick',
            bow: 'Bow',
            porkchop: 'Raw Porkchop',
            beef: 'Raw Beef',
            mutton: 'Raw Mutton',
            chicken: 'Raw Chicken',
            raw_fish: 'Raw Fish',
            cooked_fish: 'Cooked Fish',
            cooked_porkchop: 'Cooked Porkchop',
            cooked_beef: 'Cooked Beef',
            cooked_mutton: 'Cooked Mutton',
            cooked_chicken: 'Cooked Chicken',
            wooden_axe: 'Wooden Axe',
            log: 'Oak Log',
            crafting_bench: 'Crafting Bench',
            planks: 'Oak Planks',
            sticks: 'Sticks',
            wooden_sword: 'Wooden Sword',
            wooden_pickaxe: 'Wooden Pickaxe',
            coral: 'Coral',
            furnace: 'Furnace',
            chest: 'Chest',
            stone: 'Stone',
            smooth_stone: 'Smooth Stone',
            wool: 'Wool',
            bed: 'Bed',
            iron_ingot: 'Iron Ingot',
            raw_iron: 'Raw Iron',
            coal: 'Coal',
            leather: 'Leather',
            turtle_shell: 'Turtle Shell',
            boat: 'Boat',
            stone_stairs: 'Stone Stairs',
            wooden_stairs: 'Wooden Stairs',
            stone_slab: 'Stone Slab',
            door: 'Door',
            ladder: 'Ladder',
            stone_cutter: 'Stone Cutter',
            saddle: 'Saddle',
            wooden_shovel: 'Wooden Shovel',
            stone_shovel: 'Stone Shovel',
            iron_shovel: 'Iron Shovel',
            copper_shovel: 'Copper Shovel',
            copper_pickaxe: 'Copper Pickaxe',
            copper_axe: 'Copper Axe',
            copper_sword: 'Copper Sword',
            limestone: 'Limestone',
            flint: 'Flint',
            flint_and_steel: 'Flint and Steel',
            raw_copper: 'Raw Copper',
            copper_ingot: 'Copper Ingot',
            sand: 'Sand',
            gunpowder: 'Gunpowder',
            tnt: 'TNT'
        };

        function getItemIconDataURL(type) {
            if (!getItemIconDataURL._iconCache) getItemIconDataURL._iconCache = {};
            if (getItemIconDataURL._iconCache[type]) return getItemIconDataURL._iconCache[type];

            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, 64, 64);
            ctx.imageSmoothingEnabled = true;

            if (type === 'porkchop') {
                ctx.fillStyle = '#ff8a9e';
                ctx.beginPath();
                ctx.ellipse(32, 34, 16, 12, Math.PI / 6, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(32, 34, 16, Math.PI * 0.8, Math.PI * 1.5);
                ctx.stroke();

                ctx.strokeStyle = '#eeeeee';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(42, 38);
                ctx.lineTo(54, 46);
                ctx.stroke();

                ctx.fillStyle = '#eeeeee';
                ctx.beginPath();
                ctx.arc(54, 46, 4, 0, 2 * Math.PI);
                ctx.fill();
            } 
            else if (type === 'beef') {
                ctx.fillStyle = '#8b1a1a';
                ctx.beginPath();
                ctx.moveTo(20, 24);
                ctx.bezierCurveTo(15, 12, 45, 12, 48, 24);
                ctx.bezierCurveTo(52, 36, 44, 48, 32, 50);
                ctx.bezierCurveTo(20, 52, 10, 36, 20, 24);
                ctx.fill();

                ctx.strokeStyle = '#fffff0';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(32, 36, 14, Math.PI * 0.1, Math.PI * 0.9);
                ctx.stroke();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(32, 22);
                ctx.lineTo(32, 44);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(24, 26);
                ctx.lineTo(40, 26);
                ctx.stroke();
            } 
            else if (type === 'mutton') {
                ctx.fillStyle = '#a0522d';
                ctx.beginPath();
                ctx.ellipse(32, 32, 18, 10, -Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(32, 32, 18, 10, -Math.PI / 4, Math.PI * 1.5, Math.PI * 2.0);
                ctx.stroke();

                ctx.strokeStyle = '#f5f5dc';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(24, 40);
                ctx.lineTo(12, 52);
                ctx.stroke();

                ctx.fillStyle = '#f5f5dc';
                ctx.beginPath();
                ctx.arc(12, 52, 3, 0, 2 * Math.PI);
                ctx.fill();
            } 
            else if (type === 'chicken') {
                ctx.strokeStyle = '#eeeeee';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(32, 32);
                ctx.lineTo(16, 48);
                ctx.stroke();

                ctx.fillStyle = '#eeeeee';
                ctx.beginPath();
                ctx.arc(14, 48, 4, 0, 2 * Math.PI);
                ctx.arc(18, 50, 4, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = '#e3a857';
                ctx.beginPath();
                ctx.arc(40, 24, 13, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(28, 34);
                ctx.lineTo(44, 14);
                ctx.lineTo(48, 30);
                ctx.fill();
            } 
            else if (type === 'raw_fish') {
                // Silver-blue raw fish
                // Draw tail fin
                ctx.fillStyle = '#3a6b93';
                ctx.beginPath();
                ctx.moveTo(12, 32);
                ctx.lineTo(2, 22);
                ctx.lineTo(6, 32);
                ctx.lineTo(2, 42);
                ctx.closePath();
                ctx.fill();

                // Draw dorsal/ventral fins
                ctx.fillStyle = '#4f8bc4';
                // dorsal (top)
                ctx.beginPath();
                ctx.moveTo(28, 24);
                ctx.quadraticCurveTo(24, 12, 16, 20);
                ctx.closePath();
                ctx.fill();
                // ventral (bottom)
                ctx.beginPath();
                ctx.moveTo(28, 40);
                ctx.quadraticCurveTo(24, 52, 18, 44);
                ctx.closePath();
                ctx.fill();

                // Draw body
                ctx.fillStyle = '#4682b4';
                ctx.beginPath();
                ctx.ellipse(28, 32, 20, 10, 0, 0, 2 * Math.PI);
                ctx.fill();

                // Belly
                ctx.fillStyle = '#e0ffff';
                ctx.beginPath();
                ctx.ellipse(28, 34, 18, 6, 0, 0, 2 * Math.PI);
                ctx.fill();

                // Eye
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(40, 30, 2.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(41, 29, 0.8, 0, 2 * Math.PI);
                ctx.fill();

                // Gill line
                ctx.strokeStyle = '#3a6b93';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(36, 32, 6, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();
            }
            else if (type === 'cooked_fish') {
                // Cooked salmon/burnt-sienna fish
                // Draw tail fin
                ctx.fillStyle = '#c85a17';
                ctx.beginPath();
                ctx.moveTo(12, 32);
                ctx.lineTo(2, 22);
                ctx.lineTo(6, 32);
                ctx.lineTo(2, 42);
                ctx.closePath();
                ctx.fill();

                // Draw dorsal/ventral fins
                ctx.fillStyle = '#ff7f50';
                // dorsal (top)
                ctx.beginPath();
                ctx.moveTo(28, 24);
                ctx.quadraticCurveTo(24, 12, 16, 20);
                ctx.closePath();
                ctx.fill();
                // ventral (bottom)
                ctx.beginPath();
                ctx.moveTo(28, 40);
                ctx.quadraticCurveTo(24, 52, 18, 44);
                ctx.closePath();
                ctx.fill();

                // Draw body
                ctx.fillStyle = '#e97451';
                ctx.beginPath();
                ctx.ellipse(28, 32, 20, 10, 0, 0, 2 * Math.PI);
                ctx.fill();

                // Belly
                ctx.fillStyle = '#ffebcd';
                ctx.beginPath();
                ctx.ellipse(28, 34, 18, 6, 0, 0, 2 * Math.PI);
                ctx.fill();

                // Eye
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(40, 30, 2.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(41, 29, 0.8, 0, 2 * Math.PI);
                ctx.fill();

                // Gill line
                ctx.strokeStyle = '#c85a17';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(36, 32, 6, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();

                // Grill/cook lines
                ctx.strokeStyle = '#8b4513';
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(24, 25);
                ctx.lineTo(20, 35);
                ctx.moveTo(30, 25);
                ctx.lineTo(26, 35);
                ctx.stroke();
            }
            else if (type === 'cooked_porkchop') {
                // Golden-brown porkchop
                ctx.fillStyle = '#cd853f';
                ctx.beginPath();
                ctx.ellipse(32, 34, 16, 12, Math.PI / 6, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(32, 34, 16, Math.PI * 0.8, Math.PI * 1.5);
                ctx.stroke();

                ctx.strokeStyle = '#d2b48c';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(42, 38);
                ctx.lineTo(54, 46);
                ctx.stroke();

                ctx.fillStyle = '#d2b48c';
                ctx.beginPath();
                ctx.arc(54, 46, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
            else if (type === 'cooked_beef') {
                // Roasted dark-brown steak
                ctx.fillStyle = '#5c4033';
                ctx.beginPath();
                ctx.moveTo(20, 24);
                ctx.bezierCurveTo(15, 12, 45, 12, 48, 24);
                ctx.bezierCurveTo(52, 36, 44, 48, 32, 50);
                ctx.bezierCurveTo(20, 52, 10, 36, 20, 24);
                ctx.fill();

                ctx.strokeStyle = '#fffff0';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(32, 36, 14, Math.PI * 0.1, Math.PI * 0.9);
                ctx.stroke();

                ctx.strokeStyle = '#eeeeee';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(32, 22);
                ctx.lineTo(32, 44);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(24, 26);
                ctx.lineTo(40, 26);
                ctx.stroke();
            }
            else if (type === 'cooked_mutton') {
                // Cooked mutton chop
                ctx.fillStyle = '#8b5a2b';
                ctx.beginPath();
                ctx.ellipse(32, 32, 18, 10, -Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(32, 32, 18, 10, -Math.PI / 4, Math.PI * 1.5, Math.PI * 2.0);
                ctx.stroke();

                ctx.strokeStyle = '#f5f5dc';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(24, 40);
                ctx.lineTo(12, 52);
                ctx.stroke();

                ctx.fillStyle = '#f5f5dc';
                ctx.beginPath();
                ctx.arc(12, 52, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
            else if (type === 'cooked_chicken') {
                // Roasted chicken drumstick
                ctx.strokeStyle = '#d2b48c';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(32, 32);
                ctx.lineTo(16, 48);
                ctx.stroke();

                ctx.fillStyle = '#d2b48c';
                ctx.beginPath();
                ctx.arc(14, 48, 4, 0, 2 * Math.PI);
                ctx.arc(18, 50, 4, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = '#8b5a2b';
                ctx.beginPath();
                ctx.arc(40, 24, 13, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(28, 34);
                ctx.lineTo(44, 14);
                ctx.lineTo(48, 30);
                ctx.fill();
            }
            else if (type === 'bow') {
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(8, 32, 22, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();

                ctx.strokeStyle = '#cccccc';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(19, 13);
                ctx.lineTo(19, 51);
                ctx.stroke();
            }
            else if (type === 'wooden_axe') {
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(15, 49);
                ctx.lineTo(45, 19);
                ctx.stroke();

                ctx.fillStyle = '#5c4033';
                ctx.beginPath();
                ctx.moveTo(40, 14);
                ctx.lineTo(52, 10);
                ctx.lineTo(48, 26);
                ctx.lineTo(36, 22);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#3d2b1f';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(52, 10);
                ctx.lineTo(48, 26);
                ctx.stroke();
            }
            else if (type === 'log') {
                ctx.fillStyle = '#5c4033';
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(16, 22, 32, 20, 4);
                } else {
                    ctx.rect(16, 22, 32, 20);
                }
                ctx.fill();

                ctx.fillStyle = '#d2b48c';
                ctx.beginPath();
                ctx.ellipse(48, 32, 6, 10, 0, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#a0522d';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(48, 32, 3, 5, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
            else if (type === 'crafting_bench') {
                ctx.fillStyle = '#8b5a2b';
                ctx.beginPath();
                ctx.moveTo(12, 40);
                ctx.lineTo(52, 40);
                ctx.lineTo(48, 52);
                ctx.lineTo(16, 52);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#d2b48c';
                ctx.fillRect(8, 30, 48, 10);

                ctx.fillStyle = '#b22222';
                ctx.fillRect(28, 16, 20, 14);

                ctx.strokeStyle = '#111111';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(33, 16);
                ctx.lineTo(33, 13);
                ctx.lineTo(43, 13);
                ctx.lineTo(43, 16);
                ctx.stroke();
            }
            else if (type === 'planks') {
                ctx.fillStyle = '#c49a6c';
                ctx.fillRect(12, 12, 40, 40);

                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(12, 25); ctx.lineTo(52, 25);
                ctx.moveTo(12, 38); ctx.lineTo(52, 38);
                ctx.moveTo(25, 12); ctx.lineTo(25, 25);
                ctx.moveTo(38, 25); ctx.lineTo(38, 38);
                ctx.moveTo(20, 38); ctx.lineTo(20, 52);
                ctx.stroke();
            }
            else if (type === 'sticks') {
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(16, 48); ctx.lineTo(44, 16);
                ctx.moveTo(24, 48); ctx.lineTo(48, 20);
                ctx.stroke();
            }
            else if (type === 'wooden_sword') {
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(16, 48); ctx.lineTo(26, 38);
                ctx.stroke();

                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(20, 34); ctx.lineTo(30, 44);
                ctx.stroke();

                ctx.strokeStyle = '#5c4033';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(24, 40); ctx.lineTo(48, 16);
                ctx.stroke();

                ctx.fillStyle = '#5c4033';
                ctx.beginPath();
                ctx.arc(48, 16, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
            else if (type === 'wooden_pickaxe') {
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(16, 48); ctx.lineTo(40, 24);
                ctx.stroke();

                ctx.strokeStyle = '#5c4033';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(44, 20, 12, Math.PI * 0.75, Math.PI * 1.75);
                ctx.stroke();
            }
            else if (type === 'stone') {
                ctx.fillStyle = '#888888';
                ctx.fillRect(12, 12, 40, 40);
                ctx.fillStyle = '#666666';
                ctx.fillRect(16, 16, 8, 8);
                ctx.fillRect(36, 28, 8, 8);
            }
            else if (type === 'smooth_stone') {
                ctx.fillStyle = '#aaaaaa';
                ctx.fillRect(12, 12, 40, 40);
                ctx.strokeStyle = '#cccccc';
                ctx.lineWidth = 2;
                ctx.strokeRect(13, 13, 38, 38);
            }
            else if (type === 'stone_cutter') {
                ctx.fillStyle = '#666666';
                ctx.fillRect(12, 28, 40, 24);
                ctx.fillStyle = '#cccccc';
                ctx.beginPath();
                ctx.arc(32, 24, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#888888';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            else if (type === 'boat') {
                ctx.fillStyle = '#8b5a2b';
                ctx.beginPath();
                ctx.moveTo(12, 36);
                ctx.lineTo(52, 36);
                ctx.lineTo(44, 48);
                ctx.lineTo(20, 48);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'stone_stairs') {
                ctx.fillStyle = '#888888';
                ctx.beginPath();
                ctx.moveTo(12, 52);
                ctx.lineTo(12, 38);
                ctx.lineTo(25, 38);
                ctx.lineTo(25, 25);
                ctx.lineTo(38, 25);
                ctx.lineTo(38, 12);
                ctx.lineTo(52, 12);
                ctx.lineTo(52, 52);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'wooden_stairs') {
                ctx.fillStyle = '#c49a6c';
                ctx.beginPath();
                ctx.moveTo(12, 52);
                ctx.lineTo(12, 38);
                ctx.lineTo(25, 38);
                ctx.lineTo(25, 25);
                ctx.lineTo(38, 25);
                ctx.lineTo(38, 12);
                ctx.lineTo(52, 12);
                ctx.lineTo(52, 52);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'stone_slab') {
                ctx.fillStyle = '#888888';
                ctx.fillRect(12, 32, 40, 20);
            }
            else if (type === 'door') {
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(16, 8, 32, 48);
                ctx.strokeStyle = '#5c4033';
                ctx.lineWidth = 3;
                ctx.strokeRect(18, 10, 28, 44);
                ctx.fillStyle = '#cccccc';
                ctx.beginPath();
                ctx.arc(42, 32, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (type === 'ladder') {
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(20, 8); ctx.lineTo(20, 56);
                ctx.moveTo(44, 8); ctx.lineTo(44, 56);
                ctx.stroke();
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(20, 20); ctx.lineTo(44, 20);
                ctx.moveTo(20, 32); ctx.lineTo(44, 32);
                ctx.moveTo(20, 44); ctx.lineTo(44, 44);
                ctx.stroke();
            }
            else if (type === 'wool') {
                ctx.fillStyle = '#f5f5f5';
                ctx.beginPath();
                ctx.arc(24, 32, 10, 0, Math.PI * 2);
                ctx.arc(40, 32, 10, 0, Math.PI * 2);
                ctx.arc(32, 24, 10, 0, Math.PI * 2);
                ctx.arc(32, 38, 10, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (type === 'bed') {
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(10, 24, 44, 20);
                ctx.fillStyle = '#b22222';
                ctx.fillRect(24, 20, 30, 20);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(12, 20, 12, 20);
            }
            else if (type === 'furnace') {
                ctx.fillStyle = '#555555';
                ctx.fillRect(12, 12, 40, 40);
                ctx.fillStyle = '#222222';
                ctx.fillRect(20, 28, 24, 16);
            }
            else if (type === 'chest') {
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(12, 14, 40, 36);
                ctx.fillStyle = '#5c4033';
                ctx.strokeRect(14, 16, 36, 32);
                ctx.fillStyle = '#cccccc';
                ctx.fillRect(29, 28, 6, 8);
            }
            else if (type === 'leather') {
                ctx.fillStyle = '#8b5a2b';
                ctx.beginPath();
                ctx.moveTo(16, 20);
                ctx.lineTo(48, 16);
                ctx.lineTo(44, 48);
                ctx.lineTo(20, 44);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'turtle_shell') {
                ctx.fillStyle = '#2e8b57';
                ctx.beginPath();
                ctx.arc(32, 36, 16, Math.PI, 0);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'charcoal') {
                ctx.fillStyle = '#262626';
                ctx.beginPath();
                ctx.moveTo(24, 28);
                ctx.lineTo(40, 18);
                ctx.lineTo(48, 32);
                ctx.lineTo(36, 46);
                ctx.lineTo(18, 38);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'campfire' || type === 'unlit_campfire' || type === 'campfire_coal' || type === 'campfire_charcoal') {
                // Draw logs (crossed brown lines)
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(18, 48);
                ctx.lineTo(46, 24);
                ctx.moveTo(46, 48);
                ctx.lineTo(18, 24);
                ctx.stroke();
                
                if (type === 'campfire' || type === 'campfire_coal' || type === 'campfire_charcoal') {
                    // Draw fire
                    ctx.fillStyle = '#ff5500';
                    ctx.beginPath();
                    ctx.moveTo(32, 14);
                    ctx.lineTo(42, 38);
                    ctx.lineTo(22, 38);
                    ctx.closePath();
                    ctx.fill();
                    
                    ctx.fillStyle = '#ffea00';
                    ctx.beginPath();
                    ctx.moveTo(32, 22);
                    ctx.lineTo(38, 38);
                    ctx.lineTo(26, 38);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            else if (type === 'coal') {
                ctx.fillStyle = '#111111';
                ctx.beginPath();
                ctx.moveTo(24, 28);
                ctx.lineTo(40, 18);
                ctx.lineTo(48, 32);
                ctx.lineTo(36, 46);
                ctx.lineTo(18, 38);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'iron_ingot') {
                ctx.fillStyle = '#a34f40'; // rust reddish-brown
                ctx.beginPath();
                ctx.moveTo(16, 38);
                ctx.lineTo(36, 22);
                ctx.lineTo(48, 26);
                ctx.lineTo(28, 42);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'copper_ingot') {
                ctx.fillStyle = '#e88d72'; // bright pinkish-orange metallic copper
                ctx.beginPath();
                ctx.moveTo(16, 38);
                ctx.lineTo(36, 22);
                ctx.lineTo(48, 26);
                ctx.lineTo(28, 42);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'raw_iron') {
                ctx.fillStyle = '#a34f40'; // rust reddish-brown
                ctx.beginPath();
                ctx.arc(26, 34, 10, 0, Math.PI * 2);
                ctx.arc(38, 28, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (type === 'raw_copper') {
                ctx.fillStyle = '#c87a68'; // raw copper reddish-brown
                ctx.beginPath();
                ctx.arc(26, 34, 10, 0, Math.PI * 2);
                ctx.arc(38, 28, 8, 0, Math.PI * 2);
                ctx.fill();
                // green oxidation specs
                ctx.fillStyle = '#4f7942';
                ctx.beginPath();
                ctx.arc(28, 32, 2.5, 0, Math.PI*2);
                ctx.arc(36, 26, 2, 0, Math.PI*2);
                ctx.fill();
            }
            else if (type === 'limestone') {
                ctx.fillStyle = '#eae6df'; // white/light cream
                ctx.fillRect(12, 12, 40, 40);
                ctx.strokeStyle = '#d7d2c9';
                ctx.lineWidth = 3;
                ctx.strokeRect(12, 12, 40, 40);
            }
            else if (type === 'flint') {
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.moveTo(32, 12);
                ctx.lineTo(48, 28);
                ctx.lineTo(40, 48);
                ctx.lineTo(24, 48);
                ctx.lineTo(16, 28);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 'flint_and_steel') {
                // Steel loop
                ctx.strokeStyle = '#aaaaaa';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(28, 32, 10, -Math.PI / 2, Math.PI / 2);
                ctx.stroke();
                // Flint piece
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(38, 36, 6, 0, Math.PI*2);
                ctx.fill();
                // Spark
                ctx.fillStyle = '#ff3300';
                ctx.beginPath();
                ctx.arc(38, 24, 3, 0, Math.PI*2);
                ctx.fill();
            }
            else if (type.endsWith('_sword')) {
                let bladeColor = '#5c4033';
                if (type.startsWith('stone_')) bladeColor = '#888888';
                else if (type.startsWith('iron_')) bladeColor = '#a34f40';
                else if (type.startsWith('copper_')) bladeColor = '#e88d72';
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(16, 48); ctx.lineTo(26, 38);
                ctx.stroke();
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(20, 34); ctx.lineTo(30, 44);
                ctx.stroke();
                ctx.strokeStyle = bladeColor;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(24, 40); ctx.lineTo(48, 16);
                ctx.stroke();
                ctx.fillStyle = bladeColor;
                ctx.beginPath();
                ctx.arc(48, 16, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
            else if (type.endsWith('_pickaxe')) {
                let headColor = '#5c4033';
                if (type.startsWith('stone_')) headColor = '#888888';
                else if (type.startsWith('iron_')) headColor = '#a34f40';
                else if (type.startsWith('copper_')) headColor = '#e88d72';
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(16, 48); ctx.lineTo(40, 24);
                ctx.stroke();
                ctx.strokeStyle = headColor;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(44, 20, 12, Math.PI * 0.75, Math.PI * 1.75);
                ctx.stroke();
            }
            else if (type.endsWith('_axe')) {
                let headColor = '#5c4033';
                if (type.startsWith('stone_')) headColor = '#888888';
                else if (type.startsWith('iron_')) headColor = '#a34f40';
                else if (type.startsWith('copper_')) headColor = '#e88d72';
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(15, 49); ctx.lineTo(45, 19);
                ctx.stroke();
                ctx.fillStyle = headColor;
                ctx.beginPath();
                ctx.moveTo(40, 14);
                ctx.lineTo(52, 10);
                ctx.lineTo(48, 26);
                ctx.lineTo(36, 22);
                ctx.closePath();
                ctx.fill();
            }
            else if (type.endsWith('_helmet')) {
                let color = '#8b5a2b';
                if (type.startsWith('turtle_')) color = '#2e8b57';
                else if (type.startsWith('iron_')) color = '#a34f40';
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(32, 34, 18, Math.PI, 0);
                ctx.fillRect(14, 34, 36, 12);
                ctx.fill();
            }
            else if (type.endsWith('_chestplate')) {
                let color = '#8b5a2b';
                if (type.startsWith('turtle_')) color = '#2e8b57';
                else if (type.startsWith('iron_')) color = '#a34f40';
                ctx.fillStyle = color;
                ctx.fillRect(16, 18, 32, 28);
                ctx.fillRect(10, 18, 44, 8);
            }
            else if (type.endsWith('_leggings')) {
                let color = '#8b5a2b';
                if (type.startsWith('turtle_')) color = '#2e8b57';
                else if (type.startsWith('iron_')) color = '#a34f40';
                ctx.fillStyle = color;
                ctx.fillRect(16, 20, 32, 24);
                ctx.clearRect(28, 32, 8, 12);
            }
            else if (type.endsWith('_boots')) {
                let color = '#8b5a2b';
                if (type.startsWith('turtle_')) color = '#2e8b57';
                else if (type.startsWith('iron_')) color = '#a34f40';
                ctx.fillStyle = color;
                ctx.fillRect(14, 28, 12, 20);
                ctx.fillRect(38, 28, 12, 20);
            }
            else if (type === 'coral') {
                ctx.fillStyle = '#ff00aa';
                ctx.fillRect(16, 16, 32, 32);
            }
            else if (type === 'saddle') {
                ctx.fillStyle = '#8b4513'; // Saddle brown
                ctx.beginPath();
                ctx.arc(32, 32, 16, 0, Math.PI, false);
                ctx.fill();
                ctx.fillRect(16, 26, 32, 6);
                
                // Gray stirrups
                ctx.strokeStyle = '#aaaaaa';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(20, 32);
                ctx.lineTo(20, 48);
                ctx.moveTo(44, 32);
                ctx.lineTo(44, 48);
                ctx.stroke();
                
                ctx.fillStyle = '#cccccc';
                ctx.fillRect(17, 48, 6, 3);
                ctx.fillRect(41, 48, 6, 3);
            }
            else if (type.endsWith('_shovel')) {
                ctx.strokeStyle = '#8b5a2b';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(16, 48); ctx.lineTo(38, 26);
                ctx.stroke();

                let headColor = '#5c4033';
                if (type.startsWith('stone_')) headColor = '#888888';
                else if (type.startsWith('iron_')) headColor = '#a34f40';
                else if (type.startsWith('copper_')) headColor = '#e88d72';

                ctx.fillStyle = headColor;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                ctx.moveTo(44, 10);
                ctx.lineTo(54, 20);
                ctx.lineTo(44, 30);
                ctx.lineTo(34, 20);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = '#5c4033';
                ctx.fillRect(36, 24, 4, 4);
            }
            else if (type === 'sand') {
                ctx.fillStyle = '#dfd5a2';
                ctx.fillRect(12, 12, 40, 40);
                
                ctx.strokeStyle = '#c2b683';
                ctx.lineWidth = 2;
                ctx.strokeRect(12, 12, 40, 40);
                
                ctx.fillStyle = '#b5a770';
                ctx.fillRect(18, 20, 3, 3);
                ctx.fillRect(34, 16, 3, 3);
                ctx.fillRect(24, 36, 3, 3);
                ctx.fillRect(40, 40, 3, 3);
                ctx.fillRect(42, 26, 3, 3);
            }
            else if (type === 'tnt') {
                ctx.fillStyle = '#cc2222';
                ctx.fillRect(12, 12, 40, 40);
                
                ctx.strokeStyle = '#881111';
                ctx.lineWidth = 2;
                ctx.strokeRect(12, 12, 40, 40);
                
                ctx.fillStyle = '#eeeeee';
                ctx.fillRect(12, 24, 40, 16);
                
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('TNT', 32, 32);
            }
            else if (type === 'gunpowder') {
                ctx.fillStyle = '#666666';
                ctx.strokeStyle = '#444444';
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                ctx.moveTo(32, 20);
                ctx.lineTo(44, 44);
                ctx.lineTo(20, 44);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = '#888888';
                ctx.fillRect(28, 36, 4, 4);
                ctx.fillRect(36, 40, 3, 3);
            }
            else {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(8, 8, 48, 48);
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(8, 8, 48, 48);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((type || '??').substring(0, 5).toUpperCase(), 32, 32);
            }

            const dataURL = canvas.toDataURL();
            getItemIconDataURL._iconCache[type] = dataURL;
            return dataURL;
        }

        function createDroppedFoodMesh(type) {
            const group = new THREE.Group();
            
            if (type === 'porkchop' || type === 'cooked_porkchop') {
                const isCooked = type === 'cooked_porkchop';
                const meatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xb5651d : 0xff8a9e, roughness: 0.7 });
                const fatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xd2b48c : 0xffffff, roughness: 0.9 });
                const boneMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xd2b48c : 0xeeeeee, roughness: 0.9 });
                
                const meat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.08), meatMat);
                meat.castShadow = true;
                group.add(meat);
                
                const fat = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.09), fatMat);
                fat.position.set(-0.1, 0, 0);
                fat.castShadow = true;
                group.add(fat);
                
                const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6), boneMat);
                bone.rotation.z = Math.PI / 3;
                bone.position.set(0.12, 0.06, 0);
                bone.castShadow = true;
                group.add(bone);
            } 
            else if (type === 'beef' || type === 'cooked_beef') {
                const isCooked = type === 'cooked_beef';
                const meatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0x5c4033 : 0x8b1a1a, roughness: 0.6 });
                const boneMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
                const fatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xcd853f : 0xfffff0, roughness: 0.8 });
                
                const meat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.08), meatMat);
                meat.castShadow = true;
                group.add(meat);
                
                const boneSpine = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.09), boneMat);
                boneSpine.position.set(0, 0, 0);
                boneSpine.castShadow = true;
                group.add(boneSpine);
                
                const boneCross = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.09), boneMat);
                boneCross.position.set(-0.06, 0.06, 0);
                boneCross.castShadow = true;
                group.add(boneCross);

                const fatBorder = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.03, 0.09), fatMat);
                fatBorder.position.set(0, -0.09, 0);
                fatBorder.castShadow = true;
                group.add(fatBorder);
            } 
            else if (type === 'mutton' || type === 'cooked_mutton') {
                const isCooked = type === 'cooked_mutton';
                const meatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0x8b5a2b : 0xa0522d, roughness: 0.7 });
                const boneMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.9 });
                const fatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xd2b48c : 0xffffff, roughness: 0.8 });
                
                const meat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.07), meatMat);
                meat.castShadow = true;
                group.add(meat);
                
                const fat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.08), fatMat);
                fat.position.set(0, 0.05, 0);
                fat.castShadow = true;
                group.add(fat);
                
                const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6), boneMat);
                bone.rotation.z = -Math.PI / 4;
                bone.position.set(-0.11, -0.05, 0);
                bone.castShadow = true;
                group.add(bone);
            } 
            else if (type === 'chicken' || type === 'cooked_chicken') {
                const isCooked = type === 'cooked_chicken';
                const meatMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0x8b5a2b : 0xe3a857, roughness: 0.7 });
                const boneMat = new THREE.MeshStandardMaterial({ color: isCooked ? 0xd2b48c : 0xeeeeee, roughness: 0.9 });
                
                const meat = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), meatMat);
                meat.scale.set(1.4, 1.0, 1.0);
                meat.position.set(0.05, 0, 0);
                meat.castShadow = true;
                group.add(meat);
                
                const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6), boneMat);
                bone.rotation.z = Math.PI / 2;
                bone.position.set(-0.08, 0, 0);
                bone.castShadow = true;
                group.add(bone);
                
                const knob1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), boneMat);
                knob1.position.set(-0.17, 0.015, 0);
                knob1.castShadow = true;
                group.add(knob1);
                
                const knob2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), boneMat);
                knob2.position.set(-0.17, -0.015, 0);
                knob2.castShadow = true;
                group.add(knob2);
            }
            else if (type === 'raw_fish' || type === 'cooked_fish') {
                const bodyColor = type === 'raw_fish' ? 0x4682b4 : 0xe97451;
                const bellyColor = type === 'raw_fish' ? 0xe0ffff : 0xffebcd;
                const tailColor = type === 'raw_fish' ? 0x3a6b93 : 0xc85a17;
                
                const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5 });
                const bellyMat = new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.5 });
                const tailMat = new THREE.MeshStandardMaterial({ color: tailColor, roughness: 0.5 });
                const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

                // Main body
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.25), bodyMat);
                body.castShadow = true;
                group.add(body);

                // Belly
                const belly = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.18), bellyMat);
                belly.position.set(0, -0.02, 0.02);
                belly.castShadow = true;
                group.add(belly);

                // Tail
                const tail = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.08), tailMat);
                tail.position.set(0, 0, -0.165);
                tail.castShadow = true;
                group.add(tail);

                // Eyes
                const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 4), eyeMat);
                eyeL.position.set(0.061, 0.01, 0.08);
                group.add(eyeL);
                
                const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 4), eyeMat);
                eyeR.position.set(-0.061, 0.01, 0.08);
                group.add(eyeR);
            }
            else if (type === 'bow') {
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const stringMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
                
                const numSegments = 5;
                const length = 0.5;
                
                for (let i = 0; i < numSegments; i++) {
                    const t1 = i / numSegments;
                    const t2 = (i + 1) / numSegments;
                    
                    const y1 = -length/2 + length * t1;
                    const y2 = -length/2 + length * t2;
                    
                    const angle1 = t1 * Math.PI;
                    const angle2 = t2 * Math.PI;
                    
                    const z1 = Math.sin(angle1) * 0.08;
                    const z2 = Math.sin(angle2) * 0.08;
                    
                    const p1 = new THREE.Vector3(0, y1, z1);
                    const p2 = new THREE.Vector3(0, y2, z2);
                    
                    const distance = p1.distanceTo(p2);
                    const woodGeo = new THREE.CylinderGeometry(0.015, 0.015, distance, 6);
                    const woodMesh = new THREE.Mesh(woodGeo, woodMat);
                    
                    const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
                    woodMesh.position.copy(midpoint);
                    
                    const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
                    const alignAxis = new THREE.Vector3(0, 1, 0);
                    const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);
                    woodMesh.quaternion.copy(quaternion);
                    
                    woodMesh.castShadow = true;
                    group.add(woodMesh);
                }
                
                const stringGeo = new THREE.CylinderGeometry(0.003, 0.003, length, 4);
                const stringMesh = new THREE.Mesh(stringGeo, stringMat);
                stringMesh.position.set(0, 0, 0);
                group.add(stringMesh);
            }
            else if (type === 'wooden_axe') {
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const axeHeadMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.1 });

                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), handleMat);
                handle.rotation.x = Math.PI / 2; // Lie along Z axis
                handle.castShadow = true;
                group.add(handle);

                const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.1), axeHeadMat);
                axeHead.position.set(-0.04, 0.03, -0.15); // Position near the end of the handle
                axeHead.castShadow = true;
                group.add(axeHead);
            }
            else if (type === 'log') {
                const barkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }); // Dark brown
                const innerWoodMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.9 }); // Tan/light wood

                // Main bark cylinder
                const logMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8), barkMat);
                logMesh.rotation.x = Math.PI / 2; // Lie flat
                logMesh.castShadow = true;
                group.add(logMesh);

                // End face caps (tan color)
                const capGeo = new THREE.CircleGeometry(0.119, 8);
                
                const cap1 = new THREE.Mesh(capGeo, innerWoodMat);
                cap1.position.set(0, 0, 0.201);
                cap1.rotation.y = 0;
                group.add(cap1);

                const cap2 = new THREE.Mesh(capGeo, innerWoodMat);
                cap2.position.set(0, 0, -0.201);
                cap2.rotation.y = Math.PI;
                group.add(cap2);
            }
            else if (type === 'wooden_sword') {
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const bladeMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.1 });
                
                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), handleMat);
                handle.rotation.x = Math.PI / 2;
                group.add(handle);
                
                const guard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), handleMat);
                guard.position.set(0, 0.01, -0.075);
                group.add(guard);
                
                const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), bladeMat);
                blade.position.set(0, 0, -0.275);
                blade.rotation.x = Math.PI / 2;
                group.add(blade);
            }
            else if (type === 'wooden_pickaxe') {
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const headMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.1 });
                
                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), handleMat);
                handle.rotation.x = Math.PI / 2;
                group.add(handle);
                
                const head = createCurvedPickaxeHeadGroup(headMat);
                head.position.set(0, 0, -0.225);
                group.add(head);
            }
            else if (type === 'planks') {
                const plankMat = new THREE.MeshStandardMaterial({ color: 0xc49a6c, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), plankMat);
                group.add(mesh);
            }
            else if (type === 'sticks') {
                const stickMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 6), stickMat);
                mesh.rotation.z = Math.PI / 4;
                group.add(mesh);
            }
            else if (type === 'crafting_bench') {
                const bench = createCraftingBenchMesh();
                bench.scale.set(0.3, 0.3, 0.3);
                group.add(bench);
            }
            else if (type === 'stone') {
                const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), stoneMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'smooth_stone') {
                const stoneMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), stoneMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'stone_cutter') {
                const baseMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 });
                const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.18), baseMat);
                base.castShadow = true;
                group.add(base);
                const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 8), bladeMat);
                blade.rotation.x = Math.PI / 2;
                blade.position.y = 0.08;
                blade.castShadow = true;
                group.add(blade);
            }
            else if (type === 'boat') {
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.14), woodMat);
                base.castShadow = true;
                group.add(base);
            }
            else if (type === 'stone_stairs' || type === 'wooden_stairs') {
                const mat = new THREE.MeshStandardMaterial({ color: type === 'stone_stairs' ? 0x888888 : 0xc49a6c, roughness: 0.8 });
                const step1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.18), mat);
                step1.castShadow = true;
                group.add(step1);
                const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.09), mat);
                step2.position.set(0, 0.09, -0.045);
                step2.castShadow = true;
                group.add(step2);
            }
            else if (type === 'stone_slab') {
                const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.18), stoneMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'door') {
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const panel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.02), woodMat);
                panel.castShadow = true;
                group.add(panel);
            }
            else if (type === 'ladder') {
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24, 4), woodMat);
                l1.position.set(-0.06, 0, 0);
                l1.castShadow = true;
                group.add(l1);
                const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24, 4), woodMat);
                l2.position.set(0.06, 0, 0);
                l2.castShadow = true;
                group.add(l2);
                for (let r = 0; r < 3; r++) {
                    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 4), woodMat);
                    rung.rotation.z = Math.PI / 2;
                    rung.position.y = -0.08 + r * 0.08;
                    rung.castShadow = true;
                    group.add(rung);
                }
            }
            else if (type === 'wool') {
                const woolMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.95 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), woolMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'bed') {
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const redMat = new THREE.MeshStandardMaterial({ color: 0xb22222, roughness: 0.8 });
                const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
                const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.28), woodMat);
                frame.castShadow = true;
                group.add(frame);
                const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.18), redMat);
                sheet.position.set(0, 0.02, 0.05);
                sheet.castShadow = true;
                group.add(sheet);
                const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.06), whiteMat);
                pillow.position.set(0, 0.02, -0.09);
                pillow.castShadow = true;
                group.add(pillow);
            }
            else if (type === 'furnace') {
                const bodyMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), bodyMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'chest') {
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const lockMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3 });
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.18), woodMat);
                base.castShadow = true;
                group.add(base);
                const lock = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.02), lockMat);
                lock.position.set(0, 0.02, 0.091);
                lock.castShadow = true;
                group.add(lock);
            }
            else if (type === 'leather') {
                const hideMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.01, 0.20), hideMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'saddle') {
                const saddleMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }); // Reddish brown
                const ironMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 });
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.16), saddleMat);
                base.castShadow = true;
                group.add(base);
                
                // Little stirrup visual details
                const stirrupL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), ironMat);
                stirrupL.position.set(-0.09, -0.04, 0);
                stirrupL.castShadow = true;
                group.add(stirrupL);
                
                const stirrupR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), ironMat);
                stirrupR.position.set(0.09, -0.04, 0);
                stirrupR.castShadow = true;
                group.add(stirrupR);
            }
            else if (type === 'turtle_shell') {
                const shellMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.5 });
                const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), shellMat);
                mesh.scale.set(1, 0.6, 1.2);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'coal') {
                const coalMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06), coalMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'iron_ingot') {
                const ironMat = new THREE.MeshStandardMaterial({ color: 0xa34f40, metalness: 0.8, roughness: 0.2 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.06), ironMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'copper_ingot') {
                const copperMat = new THREE.MeshStandardMaterial({ color: 0xe88d72, metalness: 0.8, roughness: 0.2 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.06), copperMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'raw_iron') {
                const oreMat = new THREE.MeshStandardMaterial({ color: 0xa34f40, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05), oreMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'raw_copper') {
                const oreMat = new THREE.MeshStandardMaterial({ color: 0xc87a68, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05), oreMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'limestone') {
                const mat = new THREE.MeshStandardMaterial({ color: 0xeae6df, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), mat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'flint') {
                const mat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04), mat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'flint_and_steel') {
                const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
                const flintMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
                const steelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), steelMat);
                steelMesh.position.set(-0.02, 0.04, 0);
                steelMesh.castShadow = true;
                group.add(steelMesh);
                const flintMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.03), flintMat);
                flintMesh.position.set(0.03, 0.02, 0);
                flintMesh.castShadow = true;
                group.add(flintMesh);
            }
            else if (type.endsWith('_sword')) {
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                let bladeColor = 0x5c4033;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('stone_')) bladeColor = 0x888888;
                else if (type.startsWith('iron_')) { bladeColor = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                else if (type.startsWith('copper_')) { bladeColor = 0xe88d72; metalness = 0.8; roughness = 0.2; }
                const bladeMat = new THREE.MeshStandardMaterial({ color: bladeColor, roughness: roughness, metalness: metalness });
                
                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), handleMat);
                handle.rotation.x = Math.PI / 2;
                handle.castShadow = true;
                group.add(handle);
                
                const guard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), handleMat);
                guard.position.set(0, 0.01, -0.075);
                guard.castShadow = true;
                group.add(guard);
                
                const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), bladeMat);
                blade.position.set(0, 0, -0.275);
                blade.rotation.x = Math.PI / 2;
                blade.castShadow = true;
                group.add(blade);
            }
            else if (type.endsWith('_pickaxe')) {
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                let headColor = 0x5c4033;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('stone_')) headColor = 0x888888;
                else if (type.startsWith('iron_')) { headColor = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                else if (type.startsWith('copper_')) { headColor = 0xe88d72; metalness = 0.8; roughness = 0.2; }
                const headMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: roughness, metalness: metalness });
                
                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), handleMat);
                handle.rotation.x = Math.PI / 2;
                handle.castShadow = true;
                group.add(handle);
                
                const head = createCurvedPickaxeHeadGroup(headMat);
                head.position.set(0, 0, -0.225);
                head.castShadow = true;
                group.add(head);
            }
            else if (type.endsWith('_axe')) {
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                let headColor = 0x5c4033;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('stone_')) headColor = 0x888888;
                else if (type.startsWith('iron_')) { headColor = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                else if (type.startsWith('copper_')) { headColor = 0xe88d72; metalness = 0.8; roughness = 0.2; }
                const headMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: roughness, metalness: metalness });

                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), handleMat);
                handle.rotation.x = Math.PI / 2;
                handle.castShadow = true;
                group.add(handle);

                const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.1), headMat);
                axeHead.position.set(-0.04, 0.03, -0.15);
                axeHead.castShadow = true;
                group.add(axeHead);
            }
            else if (type.endsWith('_helmet')) {
                let color = 0x8b5a2b;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('turtle_')) color = 0x2e8b57;
                else if (type.startsWith('iron_')) { color = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                const mat = new THREE.MeshStandardMaterial({ color: color, metalness: metalness, roughness: roughness });
                const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), mat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type.endsWith('_chestplate')) {
                let color = 0x8b5a2b;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('turtle_')) color = 0x2e8b57;
                else if (type.startsWith('iron_')) { color = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                const mat = new THREE.MeshStandardMaterial({ color: color, metalness: metalness, roughness: roughness });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.08), mat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type.endsWith('_leggings')) {
                let color = 0x8b5a2b;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('turtle_')) color = 0x2e8b57;
                else if (type.startsWith('iron_')) { color = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                const mat = new THREE.MeshStandardMaterial({ color: color, metalness: metalness, roughness: roughness });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.08), mat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type.endsWith('_boots')) {
                let color = 0x8b5a2b;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('turtle_')) color = 0x2e8b57;
                else if (type.startsWith('iron_')) { color = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                const mat = new THREE.MeshStandardMaterial({ color: color, metalness: metalness, roughness: roughness });
                const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), mat); b1.position.set(-0.04, 0, 0); b1.castShadow = true; group.add(b1);
                const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), mat); b2.position.set(0.04, 0, 0); b2.castShadow = true; group.add(b2);
            }
            else if (type.endsWith('_shovel')) {
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                let headColor = 0x5c4033;
                let metalness = 0.1, roughness = 0.9;
                if (type.startsWith('stone_')) headColor = 0x888888;
                else if (type.startsWith('iron_')) { headColor = 0xa34f40; metalness = 0.8; roughness = 0.2; }
                else if (type.startsWith('copper_')) { headColor = 0xe88d72; metalness = 0.8; roughness = 0.2; }
                const headMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: roughness, metalness: metalness });
                
                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8), handleMat);
                handle.rotation.x = Math.PI / 2;
                handle.castShadow = true;
                group.add(handle);
                
                const head = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.015), headMat);
                head.position.set(0, 0, -0.185);
                head.rotation.x = Math.PI / 2;
                head.castShadow = true;
                group.add(head);
            }
            else if (type === 'sand') {
                const sandMat = new THREE.MeshStandardMaterial({ color: 0xdfd5a2, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), sandMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'tnt') {
                const redMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.8 });
                const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
                const tntBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), redMat);
                tntBody.castShadow = true;
                group.add(tntBody);
                
                const tntBand = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.04, 0.165), whiteMat);
                tntBand.castShadow = true;
                group.add(tntBand);
            }
            else if (type === 'gunpowder') {
                const powderMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
                const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04), powderMat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            else if (type === 'coral') {
                const coralColors = [
                    0xff007f, // Neon Pink
                    0x00f0ff, // Neon Cyan
                    0xffea00, // Neon Yellow
                    0xff5e00, // Neon Orange
                    0xaa00ff, // Neon Purple
                    0xff00aa  // Magenta
                ];
                const coralColor = coralColors[Math.floor(Math.random() * coralColors.length)];
                const coralMat = new THREE.MeshStandardMaterial({
                    color: coralColor,
                    roughness: 0.9,
                    emissive: coralColor,
                    emissiveIntensity: 0.15
                });
                const coralType = Math.floor(Math.random() * 3);
                if (coralType === 0) {
                    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), coralMat);
                    tube.position.set(0, 0.1, 0);
                    tube.castShadow = true;
                    group.add(tube);
                } else if (coralType === 1) {
                    const baseGeo = new THREE.SphereGeometry(0.08, 8, 8);
                    const baseMesh = new THREE.Mesh(baseGeo, coralMat);
                    baseMesh.position.y = 0.06;
                    baseMesh.scale.set(1.2, 0.8, 1.2);
                    baseMesh.castShadow = true;
                    group.add(baseMesh);
                } else {
                    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), coralMat);
                    baseMesh.position.y = 0.06;
                    baseMesh.castShadow = true;
                    group.add(baseMesh);
                }
            }
            else if (type.endsWith('_mushroom')) {
                let colorHex = 0xd93838; // Red default
                if (type === 'yellow_mushroom') colorHex = 0xeeb808;
                else if (type === 'black_mushroom') colorHex = 0x151515;
                else if (type === 'green_mushroom') colorHex = 0x228b22;
                
                const stalkMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.85 });
                const capMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
                
                // Tiny stalk
                const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.14, 5), stalkMat);
                stalk.position.y = 0.07;
                stalk.castShadow = true;
                group.add(stalk);
                
                // Tiny cap
                const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
                cap.position.y = 0.12;
                cap.scale.set(1.1, 0.8, 1.1);
                cap.castShadow = true;
                group.add(cap);
            }
            else {
                let color = 0x888888;
                if (type.includes('leather')) color = 0x8b5a2b;
                else if (type.includes('turtle')) color = 0x2e8b57;
                else if (type.includes('wool')) color = 0xf5f5f5;
                else if (type.includes('iron')) color = 0xdddddd;
                else if (type.includes('stone') || type.includes('coal')) color = 0x555555;
                else if (type.includes('wood') || type.includes('plank') || type.includes('stick')) color = 0xd2b48c;
                
                const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), mat);
                mesh.castShadow = true;
                group.add(mesh);
            }
            
            return group;
        }

        function updateHotbarUI() {
            const container = document.getElementById('minecraft-hotbar');
            if (!container) return;
            
            let html = '';
            for (let i = 0; i < 9; i++) {
                const item = hotbarItems[i];
                const count = hotbarCounts[i];
                const durability = hotbarDurability[i];
                const isSelected = i === selectedHotbarIndex;
                const iconUrl = item ? getItemIconDataURL(item) : '';
                const name = item ? ITEM_NAMES[item] || '' : '';
                const countStr = (count > 1) ? count : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                
                html += `
                    <div class="hotbar-slot ${isSelected ? 'selected' : ''}" onclick="selectHotbarSlot(${i})" title="${name}">
                        ${iconUrl ? `<img class="slot-icon-img" src="${iconUrl}" style="width: 36px; height: 36px; object-fit: contain;" />` : ''}
                        ${countStr ? `<span class="slot-count">${countStr}</span>` : ''}
                        ${durabilityBar}
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        function updateInventoryUI() {
            const gridContainer = document.getElementById('inventory-grid');
            const hotbarRowContainer = document.getElementById('inventory-hotbar-row');
            if (!gridContainer || !hotbarRowContainer) return;
            
            // Auto-sync obtainedItems with current inventory/hotbar items
            for (let i = 0; i < 27; i++) {
                if (inventoryItems[i]) obtainedItems.add(inventoryItems[i]);
            }
            for (let i = 0; i < 9; i++) {
                if (hotbarItems[i]) obtainedItems.add(hotbarItems[i]);
            }
            
            let gridHTML = '';
            for (let i = 0; i < 27; i++) {
                const item = inventoryItems[i];
                const count = inventoryCounts[i];
                const durability = inventoryDurability[i];
                const iconUrl = item ? getItemIconDataURL(item) : '';
                const name = item ? ITEM_NAMES[item] || '' : '';
                const countStr = (count > 1) ? count : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                gridHTML += `
                    <div class="hotbar-slot" onclick="onInventorySlotClick('inventory', ${i})" title="${name}">
                        ${iconUrl ? `<img class="slot-icon-img" src="${iconUrl}" style="width: 36px; height: 36px; object-fit: contain;" />` : ''}
                        ${countStr ? `<span class="slot-count">${countStr}</span>` : ''}
                        ${durabilityBar}
                    </div>
                `;
            }
            gridContainer.innerHTML = gridHTML;
            
            let hotbarHTML = '';
            for (let i = 0; i < 9; i++) {
                const item = hotbarItems[i];
                const count = hotbarCounts[i];
                const durability = hotbarDurability[i];
                const iconUrl = item ? getItemIconDataURL(item) : '';
                const name = item ? ITEM_NAMES[item] || '' : '';
                const countStr = (count > 1) ? count : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                hotbarHTML += `
                    <div class="hotbar-slot" onclick="onInventorySlotClick('hotbar', ${i})" title="${name}">
                        ${iconUrl ? `<img class="slot-icon-img" src="${iconUrl}" style="width: 36px; height: 36px; object-fit: contain;" />` : ''}
                        ${countStr ? `<span class="slot-count">${countStr}</span>` : ''}
                        ${durabilityBar}
                    </div>
                `;
            }
            hotbarRowContainer.innerHTML = hotbarHTML;
            
            // Render Armor slots
            const armorRowContainer = document.getElementById('inventory-armor-row');
            if (armorRowContainer) {
                const slots = ['helmet', 'chestplate', 'leggings', 'gauntlets', 'boots'];
                const slotIcons = {
                    helmet: '🪖',
                    chestplate: '👕',
                    leggings: '👖',
                    gauntlets: '🥊',
                    boots: '🥾'
                };
                const slotLabels = {
                    helmet: 'Helmet Slot',
                    chestplate: 'Chestplate Slot',
                    leggings: 'Leggings Slot',
                    gauntlets: 'Gauntlets Slot',
                    boots: 'Boots Slot'
                };
                
                let armorHTML = '';
                slots.forEach(slot => {
                    const item = armorItems[slot];
                    const iconUrl = item ? getItemIconDataURL(item) : '';
                    const name = item ? ITEM_NAMES[item] || '' : `${slotLabels[slot]} (${slotIcons[slot]})`;
                    
                    armorHTML += `
                        <div class="hotbar-slot armor-slot" onclick="onArmorSlotClick('${slot}')" title="${name}" style="background: rgba(0, 0, 0, 0.45); border: 2px dashed rgba(0, 240, 255, 0.3); width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 6px; cursor: pointer; box-sizing: border-box;">
                            ${iconUrl ? `<img class="slot-icon-img" src="${iconUrl}" style="width: 32px; height: 32px; object-fit: contain;" />` : `<span style="font-size: 1.1rem; opacity: 0.35;">${slotIcons[slot]}</span>`}
                        </div>
                    `;
                });
                armorRowContainer.innerHTML = armorHTML;
            }
            
            updateCraftingUI();
        }

        function countItem(type) {
            let total = 0;
            for (let i = 0; i < 9; i++) {
                if (hotbarItems[i] === type) total += hotbarCounts[i];
            }
            for (let i = 0; i < 27; i++) {
                if (inventoryItems[i] === type) total += inventoryCounts[i];
            }
            return total;
        }

        function consumeItem(type, amount) {
            let remaining = amount;
            for (let i = 0; i < 27 && remaining > 0; i++) {
                if (inventoryItems[i] === type) {
                    const take = Math.min(remaining, inventoryCounts[i]);
                    inventoryCounts[i] -= take;
                    remaining -= take;
                    if (inventoryCounts[i] === 0) {
                        inventoryItems[i] = null;
                    }
                }
            }
            for (let i = 0; i < 9 && remaining > 0; i++) {
                if (hotbarItems[i] === type) {
                    const take = Math.min(remaining, hotbarCounts[i]);
                    hotbarCounts[i] -= take;
                    remaining -= take;
                    if (hotbarCounts[i] === 0) {
                        hotbarItems[i] = null;
                    }
                }
            }
        }

        function addItemToInventory(type, count) {
            let success = false;
            for (let i = 0; i < count; i++) {
                const added = addFoodToInventory(type);
                if (added) success = true;
            }
            return success;
        }

        const RECIPES = [
            {
                id: 'campfire_coal',
                name: 'Campfire (with Coal)',
                inputs: [{ type: 'log', count: 3 }, { type: 'sticks', count: 3 }, { type: 'coal', count: 1 }],
                outputs: [{ type: 'unlit_campfire', count: 1 }]
            },
            {
                id: 'campfire_charcoal',
                name: 'Campfire (with Charcoal)',
                inputs: [{ type: 'log', count: 3 }, { type: 'sticks', count: 3 }, { type: 'charcoal', count: 1 }],
                outputs: [{ type: 'unlit_campfire', count: 1 }]
            },
            {
                id: 'planks',
                name: 'Oak Planks (x4)',
                inputs: [{ type: 'log', count: 1 }],
                outputs: [{ type: 'planks', count: 4 }]
            },
            {
                id: 'sticks',
                name: 'Sticks (x5)',
                inputs: [{ type: 'planks', count: 2 }],
                outputs: [{ type: 'sticks', count: 5 }]
            },
            {
                id: 'wooden_sword',
                name: 'Wooden Sword (12 DMG)',
                inputs: [{ type: 'sticks', count: 3 }, { type: 'planks', count: 2 }],
                outputs: [{ type: 'wooden_sword', count: 1 }]
            },
            {
                id: 'wooden_pickaxe',
                name: 'Wooden Pickaxe (9 DMG)',
                inputs: [{ type: 'planks', count: 2 }, { type: 'sticks', count: 3 }],
                outputs: [{ type: 'wooden_pickaxe', count: 1 }]
            },
            {
                id: 'wooden_axe',
                name: 'Wooden Axe (10 DMG)',
                inputs: [{ type: 'sticks', count: 2 }, { type: 'planks', count: 3 }],
                outputs: [{ type: 'wooden_axe', count: 1 }]
            },
            {
                id: 'crafting_bench',
                name: 'Crafting Bench',
                inputs: [{ type: 'planks', count: 4 }],
                outputs: [{ type: 'crafting_bench', count: 1 }]
            },
            {
                id: 'stone_sword',
                name: 'Stone Sword (15 DMG)',
                inputs: [{ type: 'sticks', count: 2 }, { type: 'stone', count: 2 }],
                outputs: [{ type: 'stone_sword', count: 1 }]
            },
            {
                id: 'stone_pickaxe',
                name: 'Stone Pickaxe (11 DMG)',
                inputs: [{ type: 'stone', count: 3 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'stone_pickaxe', count: 1 }]
            },
            {
                id: 'stone_axe',
                name: 'Stone Axe (13 DMG)',
                inputs: [{ type: 'stone', count: 3 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'stone_axe', count: 1 }]
            },
            {
                id: 'iron_sword',
                name: 'Iron Sword (20 DMG)',
                inputs: [{ type: 'sticks', count: 2 }, { type: 'iron_ingot', count: 2 }],
                outputs: [{ type: 'iron_sword', count: 1 }]
            },
            {
                id: 'iron_pickaxe',
                name: 'Iron Pickaxe (14 DMG)',
                inputs: [{ type: 'iron_ingot', count: 3 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'iron_pickaxe', count: 1 }]
            },
            {
                id: 'iron_axe',
                name: 'Iron Axe (16 DMG)',
                inputs: [{ type: 'iron_ingot', count: 3 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'iron_axe', count: 1 }]
            },
            {
                id: 'furnace',
                name: 'Furnace',
                inputs: [{ type: 'stone', count: 8 }],
                outputs: [{ type: 'furnace', count: 1 }]
            },
            {
                id: 'chest',
                name: 'Chest',
                inputs: [{ type: 'planks', count: 8 }],
                outputs: [{ type: 'chest', count: 1 }]
            },
            {
                id: 'stone_cutter',
                name: 'Stone Cutter',
                inputs: [{ type: 'stone', count: 3 }, { type: 'iron_ingot', count: 1 }],
                outputs: [{ type: 'stone_cutter', count: 1 }]
            },
            {
                id: 'door',
                name: 'Wooden Door',
                inputs: [{ type: 'planks', count: 6 }],
                outputs: [{ type: 'door', count: 3 }]
            },
            {
                id: 'ladder',
                name: 'Ladder (x3)',
                inputs: [{ type: 'sticks', count: 7 }],
                outputs: [{ type: 'ladder', count: 3 }]
            },
            {
                id: 'wooden_stairs',
                name: 'Wooden Stairs (x4)',
                inputs: [{ type: 'planks', count: 6 }],
                outputs: [{ type: 'wooden_stairs', count: 4 }]
            },
            {
                id: 'stone_stairs',
                name: 'Stone Stairs (x4)',
                inputs: [{ type: 'stone', count: 6 }],
                outputs: [{ type: 'stone_stairs', count: 4 }]
            },
            {
                id: 'stone_slab',
                name: 'Stone Slab (x6)',
                inputs: [{ type: 'stone', count: 3 }],
                outputs: [{ type: 'stone_slab', count: 6 }]
            },
            {
                id: 'bed',
                name: 'Bed',
                inputs: [{ type: 'planks', count: 3 }, { type: 'wool', count: 3 }],
                outputs: [{ type: 'bed', count: 1 }]
            },
            {
                id: 'bow',
                name: 'Bow',
                inputs: [{ type: 'sticks', count: 3 }, { type: 'wool', count: 3 }],
                outputs: [{ type: 'bow', count: 1 }]
            },
            {
                id: 'leather_helmet',
                name: 'Leather Helmet',
                inputs: [{ type: 'leather', count: 5 }],
                outputs: [{ type: 'leather_helmet', count: 1 }]
            },
            {
                id: 'leather_chestplate',
                name: 'Leather Chestplate',
                inputs: [{ type: 'leather', count: 8 }],
                outputs: [{ type: 'leather_chestplate', count: 1 }]
            },
            {
                id: 'leather_leggings',
                name: 'Leather Leggings',
                inputs: [{ type: 'leather', count: 7 }],
                outputs: [{ type: 'leather_leggings', count: 1 }]
            },
            {
                id: 'leather_boots',
                name: 'Leather Boots',
                inputs: [{ type: 'leather', count: 4 }],
                outputs: [{ type: 'leather_boots', count: 1 }]
            },
            {
                id: 'turtle_helmet',
                name: 'Turtle Shell Helmet',
                inputs: [{ type: 'turtle_shell', count: 5 }],
                outputs: [{ type: 'turtle_helmet', count: 1 }]
            },
            {
                id: 'turtle_chestplate',
                name: 'Turtle Shell Chestplate',
                inputs: [{ type: 'turtle_shell', count: 8 }],
                outputs: [{ type: 'turtle_chestplate', count: 1 }]
            },
            {
                id: 'turtle_leggings',
                name: 'Turtle Shell Leggings',
                inputs: [{ type: 'turtle_shell', count: 7 }],
                outputs: [{ type: 'turtle_leggings', count: 1 }]
            },
            {
                id: 'turtle_boots',
                name: 'Turtle Shell Boots',
                inputs: [{ type: 'turtle_shell', count: 4 }],
                outputs: [{ type: 'turtle_boots', count: 1 }]
            },
            {
                id: 'iron_helmet',
                name: 'Iron Helmet',
                inputs: [{ type: 'iron_ingot', count: 5 }],
                outputs: [{ type: 'iron_helmet', count: 1 }]
            },
            {
                id: 'iron_chestplate',
                name: 'Iron Chestplate',
                inputs: [{ type: 'iron_ingot', count: 8 }],
                outputs: [{ type: 'iron_chestplate', count: 1 }]
            },
            {
                id: 'iron_leggings',
                name: 'Iron Leggings',
                inputs: [{ type: 'iron_ingot', count: 7 }],
                outputs: [{ type: 'iron_leggings', count: 1 }]
            },
            {
                id: 'iron_boots',
                name: 'Iron Boots',
                inputs: [{ type: 'iron_ingot', count: 4 }],
                outputs: [{ type: 'iron_boots', count: 1 }]
            },
            {
                id: 'saddle',
                name: 'Saddle',
                inputs: [{ type: 'leather', count: 5 }, { type: 'iron_ingot', count: 1 }],
                outputs: [{ type: 'saddle', count: 1 }]
            },
            {
                id: 'wooden_shovel',
                name: 'Wooden Shovel',
                inputs: [{ type: 'planks', count: 1 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'wooden_shovel', count: 1 }]
            },
            {
                id: 'stone_shovel',
                name: 'Stone Shovel',
                inputs: [{ type: 'stone', count: 1 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'stone_shovel', count: 1 }]
            },
            {
                id: 'iron_shovel',
                name: 'Iron Shovel',
                inputs: [{ type: 'iron_ingot', count: 1 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'iron_shovel', count: 1 }]
            },
            {
                id: 'copper_shovel',
                name: 'Copper Shovel',
                inputs: [{ type: 'copper_ingot', count: 1 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'copper_shovel', count: 1 }]
            },
            {
                id: 'copper_sword',
                name: 'Copper Sword (15 DMG)',
                inputs: [{ type: 'sticks', count: 2 }, { type: 'copper_ingot', count: 2 }],
                outputs: [{ type: 'copper_sword', count: 1 }]
            },
            {
                id: 'copper_pickaxe',
                name: 'Copper Pickaxe (11 DMG)',
                inputs: [{ type: 'copper_ingot', count: 3 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'copper_pickaxe', count: 1 }]
            },
            {
                id: 'copper_axe',
                name: 'Copper Axe (13 DMG)',
                inputs: [{ type: 'copper_ingot', count: 3 }, { type: 'sticks', count: 2 }],
                outputs: [{ type: 'copper_axe', count: 1 }]
            },
            {
                id: 'flint_and_steel',
                name: 'Flint and Steel',
                inputs: [{ type: 'flint', count: 1 }, { type: 'iron_ingot', count: 1 }],
                outputs: [{ type: 'flint_and_steel', count: 1 }]
            },
            {
                id: 'tnt',
                name: 'TNT',
                inputs: [{ type: 'gunpowder', count: 4 }, { type: 'sand', count: 4 }],
                outputs: [{ type: 'tnt', count: 1 }]
            },
            {
                id: 'boat',
                name: 'Boat',
                inputs: [{ type: 'planks', count: 5 }],
                outputs: [{ type: 'boat', count: 1 }]
            }
        ];

        function craftItem(recipeId) {
            const recipe = RECIPES.find(r => r.id === recipeId);
            if (!recipe) return;
            
            let hasMaterials = true;
            recipe.inputs.forEach(input => {
                if (countItem(input.type) < input.count) {
                    hasMaterials = false;
                }
            });
            
            if (!hasMaterials) {
                addChatMessage(`Missing materials for ${recipe.name}!`, "system");
                return;
            }
            
            recipe.inputs.forEach(input => {
                consumeItem(input.type, input.count);
            });
            
            recipe.outputs.forEach(output => {
                addItemToInventory(output.type, output.count);
            });
            
            updateHotbarUI();
            updateInventoryUI();
            updateWeaponUI();
            
            if (AudioSynth.playPickup) {
                AudioSynth.playPickup();
            } else {
                AudioSynth.playHit();
            }
            addChatMessage(`Successfully crafted ${recipe.name}!`, "system");
        }

        function isRecipeUnlocked(recipe) {
            return recipe.inputs.some(input => obtainedItems.has(input.type));
        }

        function getCraftingBenchAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestBench = null;
            let bestDist = Infinity;
            
            placedObjects.forEach(obj => {
                if (obj.type !== 'crafting_bench') return;
                
                const ox = obj.pos.x;
                const oy = obj.pos.y + 0.5;
                const oz = obj.pos.z;
                
                const dx = ox - myX;
                const dy = oy - myY;
                const dz = oz - myZ;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < 6.0) {
                    const toBench = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toBench);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestBench = obj;
                        }
                    }
                }
            });
            return bestBench;
        }

        function getStoneCutterAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestCutter = null;
            let bestDist = Infinity;
            
            placedObjects.forEach(obj => {
                if (obj.type !== 'stone_cutter') return;
                
                const ox = obj.pos.x;
                const oy = obj.pos.y + 0.5;
                const oz = obj.pos.z;
                
                const dx = ox - myX;
                const dy = oy - myY;
                const dz = oz - myZ;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < 6.0) {
                    const toCutter = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toCutter);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestCutter = obj;
                        }
                    }
                }
            });
            return bestCutter;
        }

        function getPlacedObjectAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestObj = null;
            let bestDist = Infinity;
            
            placedObjects.forEach(obj => {
                if (obj.type === 'fire') return; // Cannot aim at/mine fire blocks
                const ox = obj.pos.x;
                const oy = obj.pos.y + 0.45;
                const oz = obj.pos.z;
                
                const dx = ox - myX;
                const dy = oy - myY;
                const dz = oz - myZ;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < 6.0) {
                    const toObj = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toObj);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestObj = obj;
                        }
                    }
                }
            });
            return bestObj;
        }

        function minePlacedObject(obj) {
            if (obj.type === 'fire') return; // Cannot mine fire blocks
            if (obj.type === 'chest' && obj.chestInventoryItems) {
                for (let i = 0; i < 27; i++) {
                    const itemType = obj.chestInventoryItems[i];
                    const itemCount = obj.chestInventoryCounts[i];
                    if (itemType && itemCount > 0) {
                        for (let count = 0; count < itemCount; count++) {
                            spawnDroppedFood(itemType, obj.pos.clone().add(new THREE.Vector3(
                                (Math.random() - 0.5) * 0.4,
                                0.3 + Math.random() * 0.2,
                                (Math.random() - 0.5) * 0.4
                            )));
                        }
                    }
                }
            }
            if (obj.type === 'bed' && respawnPoint) {
                if (Math.abs(obj.pos.x - respawnPoint.x) < 0.1 &&
                    Math.abs(obj.pos.y - respawnPoint.y) < 0.1 &&
                    Math.abs(obj.pos.z - respawnPoint.z) < 0.1) {
                    respawnPoint = null;
                    addChatMessage("Respawn point reset to main spawn!", "system");
                }
            }
            scene.remove(obj.mesh);
            const index = placedObjects.indexOf(obj);
            if (index !== -1) {
                placedObjects.splice(index, 1);
            }
            spawnDroppedFood(obj.type, obj.pos.clone().add(new THREE.Vector3(0, 0.3, 0)));
            if (isConnected) {
                sendNetworkMessage({
                    type: 'break-block',
                    x: obj.pos.x,
                    y: obj.pos.y,
                    z: obj.pos.z
                });
            }
            addChatMessage(`Mined placed ${obj.type}!`, "system");
            saveWorld(false);
        }

        function removePlacedBlockAt(x, y, z) {
            const index = placedObjects.findIndex(obj => {
                return Math.abs(obj.pos.x - x) < 0.1 &&
                       Math.abs(obj.pos.y - y) < 0.1 &&
                       Math.abs(obj.pos.z - z) < 0.1;
            });
            if (index !== -1) {
                const obj = placedObjects[index];
                if (obj.type === 'bed' && respawnPoint) {
                    if (Math.abs(obj.pos.x - respawnPoint.x) < 0.1 &&
                        Math.abs(obj.pos.y - respawnPoint.y) < 0.1 &&
                        Math.abs(obj.pos.z - respawnPoint.z) < 0.1) {
                        respawnPoint = null;
                        addChatMessage("Respawn point reset to main spawn!", "system");
                        saveWorld(false);
                    }
                }
                scene.remove(obj.mesh);
                placedObjects.splice(index, 1);
            }
        }

        function updateCraftingUI() {
            const container = document.getElementById('crafting-recipes-list');
            if (!container) return;
            
            let html = '';
            RECIPES.forEach(recipe => {
                if (!isRecipeUnlocked(recipe)) return;

                let canCraft = true;
                const inputListHTML = recipe.inputs.map(input => {
                    const have = countItem(input.type);
                    const name = ITEM_NAMES[input.type] || input.type;
                    const color = have >= input.count ? '#00ffcc' : '#ff0055';
                    if (have < input.count) {
                        canCraft = false;
                    }
                    return `<span style="color: ${color}; font-size: 0.75rem;">${input.count}x ${name} (Have ${have})</span>`;
                }).join(', ');
                
                const outputName = recipe.name;
                const outputIcon = getItemIconDataURL(recipe.id);
                
                const cardBackground = canCraft ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255, 0, 0, 0.15)';
                const cardBorder = canCraft ? 'rgba(0, 240, 255, 0.35)' : 'rgba(255, 0, 0, 0.4)';
                
                html += `
                    <div style="background: ${cardBackground}; border: 1px solid ${cardBorder}; border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: all 0.2s ease;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${outputIcon}" style="width: 32px; height: 32px; object-fit: contain;" />
                            <div style="display: flex; flex-direction: column; text-align: left;">
                                <strong style="font-size: 0.85rem; color: #ffffff;">${outputName}</strong>
                                <span style="font-size: 0.7rem; color: rgba(255,255,255,0.6);">${inputListHTML}</span>
                            </div>
                        </div>
                        <button class="btn" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 4px; background: ${canCraft ? 'var(--cyan)' : 'rgba(255,255,255,0.05)'}; color: ${canCraft ? '#000000' : 'rgba(255,255,255,0.3)'}; border: 1px solid ${canCraft ? 'var(--cyan)' : 'transparent'}; cursor: ${canCraft ? 'pointer' : 'default'}; pointer-events: ${canCraft ? 'auto' : 'none'}; box-shadow: ${canCraft ? '0 0 8px var(--cyan)' : 'none'};" onclick="craftItem('${recipe.id}')">
                            Craft
                        </button>
                    </div>
                `;
            });
            
            if (html === '') {
                html = `<div style="color: rgba(255,255,255,0.4); font-size: 0.85rem; text-align: center; padding: 20px; font-style: italic;">No recipes unlocked yet. Chop trees to get wood logs!</div>`;
            }

            container.innerHTML = html;
        }

        function createCraftingBenchMesh() {
            const bench = new THREE.Group();
            
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
            const tableTopMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.85 });
            const metalMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.4, metalness: 0.8 });
            const redMat = new THREE.MeshStandardMaterial({ color: 0xb22222, roughness: 0.6 });
            const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
            const gridMat = new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.9 });
            
            // Tabletop
            const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.7), tableTopMat);
            top.position.y = 0.86;
            bench.add(top);
            
            // Trestle legs left
            const legL1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.06), woodMat);
            legL1.position.set(-0.65, 0.43, 0);
            legL1.rotation.x = 0.45;
            bench.add(legL1);
            
            const legL2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.06), woodMat);
            legL2.position.set(-0.65, 0.43, 0);
            legL2.rotation.x = -0.45;
            bench.add(legL2);

            const pinL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), blackMat);
            pinL.position.set(-0.65, 0.43, 0);
            bench.add(pinL);
            
            // Trestle legs right
            const legR1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.06), woodMat);
            legR1.position.set(0.65, 0.43, 0);
            legR1.rotation.x = 0.45;
            bench.add(legR1);
            
            const legR2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.06), woodMat);
            legR2.position.set(0.65, 0.43, 0);
            legR2.rotation.x = -0.45;
            bench.add(legR2);

            const pinR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), blackMat);
            pinR.position.set(0.65, 0.43, 0);
            bench.add(pinR);

            // Feet pads
            const footZ = 0.95/2 * Math.sin(0.45);
            const feetY = 0.02;
            const foot1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), blackMat);
            foot1.position.set(-0.65, feetY, footZ);
            bench.add(foot1);
            const foot2 = foot1.clone();
            foot2.position.set(-0.65, feetY, -footZ);
            bench.add(foot2);
            const foot3 = foot1.clone();
            foot3.position.set(0.65, feetY, footZ);
            bench.add(foot3);
            const foot4 = foot1.clone();
            foot4.position.set(0.65, feetY, -footZ);
            bench.add(foot4);
            
            // Crossbar
            const crossbar = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.05, 0.05), woodMat);
            crossbar.position.set(0, 0.43, 0);
            bench.add(crossbar);
            
            // Red Toolbox
            const boxBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.2), redMat);
            boxBody.position.set(0.2, 0.9 + 0.11, 0.05);
            bench.add(boxBody);
            
            // Handle on toolbox
            const handleTop = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.03), blackMat);
            handleTop.position.set(0.2, 0.9 + 0.22 + 0.035, 0.05);
            bench.add(handleTop);
            const handleLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.03), blackMat);
            handleLeg1.position.set(0.2 - 0.07, 0.9 + 0.22 + 0.015, 0.05);
            bench.add(handleLeg1);
            const handleLeg2 = handleLeg1.clone();
            handleLeg2.position.x = 0.2 + 0.07;
            bench.add(handleLeg2);
            
            // Brown 3x3 checker/grid board
            const gridBoard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.005, 0.45), gridMat);
            gridBoard.position.set(-0.35, 0.9 + 0.0025, 0);
            bench.add(gridBoard);
            
            // Grid lines
            for (let i = 0; i <= 3; i++) {
                const offset = -0.225 + (i * 0.15);
                const lineX = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.008, 0.45), blackMat);
                lineX.position.set(-0.35 + offset, 0.9 + 0.003, 0);
                bench.add(lineX);
                
                const lineZ = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.008, 0.01), blackMat);
                lineZ.position.set(-0.35, 0.9 + 0.003, offset);
                bench.add(lineZ);
            }
            
            // Hanging tools
            const sawBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.01), metalMat);
            sawBlade.position.set(0.45, 0.9 - 0.15, 0.351);
            bench.add(sawBlade);
            const sawHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.03), woodMat);
            sawHandle.position.set(0.45, 0.9 - 0.03, 0.351);
            bench.add(sawHandle);
            
            const chiselHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.03), woodMat);
            chiselHandle.position.set(0.55, 0.9 - 0.05, 0.351);
            bench.add(chiselHandle);
            const chiselTip = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.015), metalMat);
            chiselTip.position.set(0.55, 0.9 - 0.15, 0.351);
            bench.add(chiselTip);
            
            return bench;
        }

        function getGroundIntersectPoint(maxDist = 6.0) {
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            if (lookDir.y > 0.8) return null; // Prevent placing in empty sky
            
            const item = hotbarItems[selectedHotbarIndex];
            if (!item) return null;
            
            const widthX = (item === 'crafting_bench') ? 1.6 : 0.9;
            const widthZ = (item === 'crafting_bench') ? 0.7 : 0.9;
            const height = (item === 'crafting_bench') ? 1.0 : (item === 'door' ? 1.8 : (item === 'stone_slab' ? 0.45 : 0.9));
            
            const steps = 120;
            const stepSize = maxDist / steps;
            const origin = camera.position.clone();
            
            for (let j = 0; j < steps; j++) {
                const pt = origin.clone().addScaledVector(lookDir, j * stepSize);
                
                // 1. Check intersection with placed blocks
                for (let i = 0; i < placedObjects.length; i++) {
                    const obj = placedObjects[i];
                    const objWidthX = (obj.type === 'crafting_bench') ? 1.6 : 0.9;
                    const objWidthZ = (obj.type === 'crafting_bench') ? 0.7 : 0.9;
                    const objHeight = (obj.type === 'crafting_bench') ? 1.0 : (obj.type === 'door' ? 1.8 : (obj.type === 'stone_slab' ? 0.45 : 0.9));
                    
                    const minX = obj.pos.x - objWidthX / 2;
                    const maxX = obj.pos.x + objWidthX / 2;
                    const minZ = obj.pos.z - objWidthZ / 2;
                    const maxZ = obj.pos.z + objWidthZ / 2;
                    const minY = obj.pos.y;
                    const maxY = obj.pos.y + objHeight;
                    
                    if (pt.x >= minX && pt.x <= maxX && pt.z >= minZ && pt.z <= maxZ && pt.y >= minY && pt.y <= maxY) {
                        // Intersection detected! Find which face was hit by checking the previous step
                        const ptPrev = origin.clone().addScaledVector(lookDir, Math.max(0, j - 1) * stepSize);
                        let normal = new THREE.Vector3(0, 1, 0); // default to top face
                        
                        if (ptPrev.y >= maxY) {
                            normal.set(0, 1, 0);
                        } else if (ptPrev.y <= minY) {
                            normal.set(0, -1, 0);
                        } else if (ptPrev.x >= maxX) {
                            normal.set(1, 0, 0);
                        } else if (ptPrev.x <= minX) {
                            normal.set(-1, 0, 0);
                        } else if (ptPrev.z >= maxZ) {
                            normal.set(0, 0, 1);
                        } else if (ptPrev.z <= minZ) {
                            normal.set(0, 0, -1);
                        }
                        
                        const placePos = new THREE.Vector3();
                        if (normal.y === 1) {
                            placePos.set(obj.pos.x, obj.pos.y + objHeight, obj.pos.z);
                        } else if (normal.y === -1) {
                            placePos.set(obj.pos.x, obj.pos.y - height, obj.pos.z);
                        } else if (normal.x === 1) {
                            placePos.set(obj.pos.x + objWidthX / 2 + widthX / 2, obj.pos.y, obj.pos.z);
                        } else if (normal.x === -1) {
                            placePos.set(obj.pos.x - objWidthX / 2 - widthX / 2, obj.pos.y, obj.pos.z);
                        } else if (normal.z === 1) {
                            placePos.set(obj.pos.x, obj.pos.y, obj.pos.z + objWidthZ / 2 + widthZ / 2);
                        } else if (normal.z === -1) {
                            placePos.set(obj.pos.x, obj.pos.y, obj.pos.z - objWidthZ / 2 - widthZ / 2);
                        }
                        return placePos;
                    }
                }
                
                // 2. Check intersection with terrain height
                const terrY = getTerrainHeight(pt.x, pt.z, playerInCave);
                if (pt.y <= terrY) {
                    return new THREE.Vector3(pt.x, terrY, pt.z);
                }
            }
            return null;
        }

        function createPlacedWoolMesh() {
            const group = new THREE.Group();
            const woolMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.95 });
            
            // Central block
            const center = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), woolMat);
            center.position.y = 0.425;
            group.add(center);
            
            // Add a few small offset boxes for fluffy wool texture
            const fluffGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const offsets = [
                [0.4, 0.5, 0.2], [-0.4, 0.3, -0.3], [0.2, 0.8, -0.2], [-0.2, 0.8, 0.3],
                [0.3, 0.2, -0.4], [-0.3, 0.5, 0.4], [0.1, 0.3, 0.45], [-0.1, 0.2, -0.45]
            ];
            offsets.forEach(([ox, oy, oz]) => {
                const fluff = new THREE.Mesh(fluffGeo, woolMat);
                fluff.position.set(ox, oy, oz);
                group.add(fluff);
            });
            
            return group;
        }

        function createPlacedBedMesh() {
            const group = new THREE.Group();
            
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
            const blanketMat = new THREE.MeshStandardMaterial({ color: 0xff007f, roughness: 0.7 }); // Cozy magenta blanket
            
            // Bed frame: width 0.9, height 0.2, length 1.6
            const frame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 1.6), woodMat);
            frame.position.set(0, 0.1, 0);
            group.add(frame);
            
            // Four bed legs
            const legGeo = new THREE.BoxGeometry(0.08, 0.35, 0.08);
            const leg1 = new THREE.Mesh(legGeo, woodMat); leg1.position.set(-0.41, 0.075, -0.76); group.add(leg1);
            const leg2 = new THREE.Mesh(legGeo, woodMat); leg2.position.set(0.41, 0.075, -0.76); group.add(leg2);
            const leg3 = new THREE.Mesh(legGeo, woodMat); leg3.position.set(-0.41, 0.075, 0.76); group.add(leg3);
            const leg4 = new THREE.Mesh(legGeo, woodMat); leg4.position.set(0.41, 0.075, 0.76); group.add(leg4);
            
            // Headboard back
            const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.08), woodMat);
            headboard.position.set(0, 0.35, -0.76);
            group.add(headboard);
            
            // Pillow: width 0.76, height 0.12, length 0.35
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.12, 0.35), whiteMat);
            pillow.position.set(0, 0.26, -0.55);
            group.add(pillow);
            
            // Blanket: width 0.82, height 0.14, length 1.15
            const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.14, 1.15), blanketMat);
            blanket.position.set(0, 0.24, 0.18);
            group.add(blanket);
            
            return group;
        }

        function spawnPlacedObject(type, pos, sendNetwork = false) {
            let mesh;
            if (type === 'wool') {
                mesh = createPlacedWoolMesh();
                mesh.position.copy(pos);
            } else if (type === 'bed') {
                mesh = createPlacedBedMesh();
                mesh.rotation.y = Math.round(camera.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
                mesh.position.copy(pos);
            } else if (type === 'log') {
                const barkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
                const capMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.9 });
                const mats = [barkMat, capMat, capMat];
                mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 16), mats);
                mesh.position.copy(pos);
                mesh.position.y += 0.45;
            } else if (type === 'planks') {
                const plankMat = new THREE.MeshStandardMaterial({ color: 0xc49a6c, roughness: 0.9 });
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), plankMat);
                mesh.position.copy(pos);
                mesh.position.y += 0.45;
            } else if (type === 'crafting_bench') {
                mesh = createCraftingBenchMesh();
                mesh.position.copy(pos);
            } else if (type === 'stone') {
                const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat);
                mesh.position.copy(pos);
                mesh.position.y += 0.45;
            } else if (type === 'smooth_stone') {
                const mat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5 });
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat);
                mesh.position.copy(pos);
                mesh.position.y += 0.45;
            } else if (type === 'unlit_campfire' || type === 'campfire') {
                const group = new THREE.Group();
                const logMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
                
                const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), logMat);
                log1.rotation.z = Math.PI / 2;
                log1.rotation.y = Math.PI / 4;
                log1.position.y = 0.08;
                group.add(log1);
                
                const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), logMat);
                log2.rotation.z = Math.PI / 2;
                log2.rotation.y = -Math.PI / 4;
                log2.position.y = 0.08;
                group.add(log2);

                const coalMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
                const coal = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.15), coalMat);
                coal.position.set(0, 0.1, 0);
                group.add(coal);
                
                mesh = group;
                mesh.position.copy(pos);
            } else if (type === 'stone_cutter') {
                const group = new THREE.Group();
                const baseMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 });
                const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), baseMat);
                base.position.y = 0.25;
                group.add(base);
                const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), bladeMat);
                blade.rotation.x = Math.PI / 2;
                blade.position.y = 0.55;
                group.add(blade);
                mesh = group;
                mesh.position.copy(pos);
            } else if (type === 'boat') {
                const group = new THREE.Group();
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.7), woodMat);
                base.position.y = 0.1;
                group.add(base);
                const left = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.1), woodMat);
                left.position.set(0, 0.2, 0.35);
                group.add(left);
                const right = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.1), woodMat);
                right.position.set(0, 0.2, -0.35);
                group.add(right);
                mesh = group;
                mesh.position.copy(pos);
            } else if (type === 'stone_stairs' || type === 'wooden_stairs') {
                const group = new THREE.Group();
                const mat = new THREE.MeshStandardMaterial({ color: type === 'stone_stairs' ? 0x888888 : 0xc49a6c, roughness: 0.8 });
                const step1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.9), mat);
                step1.position.y = 0.225;
                group.add(step1);
                const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.45), mat);
                step2.position.set(0, 0.675, -0.225);
                group.add(step2);
                mesh = group;
                mesh.position.copy(pos);
            } else if (type === 'stone_slab') {
                const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.9), mat);
                mesh.position.copy(pos);
                mesh.position.y += 0.225;
            } else if (type === 'door') {
                const group = new THREE.Group();
                const mat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const panel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.1), mat);
                panel.position.y = 0.9;
                group.add(panel);
                mesh = group;
                mesh.position.copy(pos);
            } else if (type === 'ladder') {
                const group = new THREE.Group();
                const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
                const leftRail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), woodMat);
                leftRail.position.set(-0.3, 0.45, 0);
                group.add(leftRail);
                const rightRail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), woodMat);
                rightRail.position.set(0.3, 0.45, 0);
                group.add(rightRail);
                for (let r = 0; r < 4; r++) {
                    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8), woodMat);
                    rung.rotation.z = Math.PI / 2;
                    rung.position.set(0, 0.15 + r * 0.2, 0);
                    group.add(rung);
                }
                mesh = group;
                mesh.position.copy(pos);
            } else if (type === 'furnace') {
                mesh = createFurnaceMesh();
                mesh.position.copy(pos);
            } else if (type === 'chest') {
                mesh = createChestMesh();
                mesh.position.copy(pos);
            } else if (type === 'fire') {
                const group = new THREE.Group();
                mesh = group;
                mesh.position.copy(pos);
                
                if (isHost) {
                    setTimeout(() => {
                        const stillExists = placedObjects.some(obj => 
                            obj.type === 'fire' &&
                            Math.abs(obj.pos.x - pos.x) < 0.1 &&
                            Math.abs(obj.pos.y - pos.y) < 0.1 &&
                            Math.abs(obj.pos.z - pos.z) < 0.1
                        );
                        if (stillExists) {
                            removePlacedBlockAt(pos.x, pos.y, pos.z);
                            if (isConnected) {
                                sendNetworkMessage({
                                    type: 'break-block',
                                    x: pos.x,
                                    y: pos.y,
                                    z: pos.z
                                });
                            }
                            saveWorld(false);
                        }
                    }, 15000);
                }
            } else if (type === 'coral') {
                const coralColors = [
                    0xff007f, // Neon Pink
                    0x00f0ff, // Neon Cyan
                    0xffea00, // Neon Yellow
                    0xff5e00, // Neon Orange
                    0xaa00ff, // Neon Purple
                    0xff00aa  // Magenta
                ];
                
                const colorSeed = Math.floor(Math.abs(pos.x * 17 + pos.y * 31 + pos.z * 13));
                const coralColor = coralColors[colorSeed % coralColors.length];
                const coralType = colorSeed % 3;
                
                const coralMat = new THREE.MeshStandardMaterial({
                    color: coralColor,
                    roughness: 0.9,
                    emissive: coralColor,
                    emissiveIntensity: 0.15
                });
                
                const coralGroup = new THREE.Group();
                
                if (coralType === 0) {
                    const numTubes = 3 + (colorSeed % 3);
                    for (let j = 0; j < numTubes; j++) {
                        const th = 0.5 + ((colorSeed + j) % 10) * 0.08;
                        const tr = 0.1 + ((colorSeed + j) % 5) * 0.02;
                        const tube = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, th, 8), coralMat);
                        
                        const offsetX = (((colorSeed + j * 7) % 7) - 3) * 0.07;
                        const offsetZ = (((colorSeed + j * 13) % 7) - 3) * 0.07;
                        
                        tube.position.set(offsetX, th/2, offsetZ);
                        tube.rotation.x = (((colorSeed + j * 3) % 5) - 2) * 0.06;
                        tube.rotation.z = (((colorSeed + j * 9) % 5) - 2) * 0.06;
                        tube.castShadow = true;
                        coralGroup.add(tube);
                    }
                } else if (coralType === 1) {
                    const baseGeo = new THREE.SphereGeometry(0.35, 8, 8);
                    const baseMesh = new THREE.Mesh(baseGeo, coralMat);
                    baseMesh.position.y = 0.25;
                    baseMesh.scale.set(1.2, 0.8, 1.2);
                    baseMesh.castShadow = true;
                    coralGroup.add(baseMesh);
                    
                    const numBubbles = 4 + (colorSeed % 4);
                    for (let j = 0; j < numBubbles; j++) {
                        const radius = 0.15 + ((colorSeed + j) % 5) * 0.02;
                        const bub = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 8), coralMat);
                        
                        const offsetX = (((colorSeed + j * 3) % 9) - 4) * 0.06;
                        const offsetY = 0.25 + (((colorSeed + j * 7) % 5) - 2) * 0.05;
                        const offsetZ = (((colorSeed + j * 11) % 9) - 4) * 0.06;
                        
                        bub.position.set(offsetX, offsetY, offsetZ);
                        bub.castShadow = true;
                        coralGroup.add(bub);
                    }
                } else {
                    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), coralMat);
                    baseMesh.position.y = 0.3;
                    baseMesh.castShadow = true;
                    coralGroup.add(baseMesh);
                    
                    const numPlates = 2 + (colorSeed % 3);
                    for (let j = 0; j < numPlates; j++) {
                        const plateWidthX = 0.6 + ((colorSeed + j * 5) % 5) * 0.08;
                        const plateWidthZ = 0.6 + ((colorSeed + j * 7) % 5) * 0.08;
                        const plate = new THREE.Mesh(new THREE.BoxGeometry(plateWidthX, 0.08, plateWidthZ), coralMat);
                        
                        const offsetX = (((colorSeed + j * 3) % 5) - 2) * 0.04;
                        const offsetZ = (((colorSeed + j * 13) % 5) - 2) * 0.04;
                        
                        plate.position.set(offsetX, 0.2 + j * 0.25, offsetZ);
                        plate.rotation.z = (((colorSeed + j * 9) % 9) - 4) * 0.05;
                        plate.rotation.x = (((colorSeed + j * 17) % 9) - 4) * 0.05;
                        plate.castShadow = true;
                        coralGroup.add(plate);
                    }
                }
                
                mesh = coralGroup;
                mesh.position.copy(pos);
            } else if (type === 'sand') {
                const mat = new THREE.MeshStandardMaterial({ color: 0xdfd5a2, roughness: 0.9 });
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat);
                mesh.position.copy(pos);
                mesh.position.y += 0.45;
            } else if (type === 'tnt') {
                const group = new THREE.Group();
                const redMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.8 });
                const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
                const tntBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), redMat);
                tntBody.position.y = 0.45;
                group.add(tntBody);
                
                const tntBand = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.2, 0.92), whiteMat);
                tntBand.position.y = 0.45;
                group.add(tntBand);
                
                mesh = group;
                mesh.position.copy(pos);

                if (isHost) {
                    setTimeout(() => {
                        const stillExists = placedObjects.some(obj => 
                            obj.type === 'tnt' &&
                            Math.abs(obj.pos.x - pos.x) < 0.1 &&
                            Math.abs(obj.pos.y - pos.y) < 0.1 &&
                            Math.abs(obj.pos.z - pos.z) < 0.1
                        );
                        if (stillExists) {
                            createExplosionEffect(pos.x, pos.y + 0.45, pos.z, 12.0, 60.0, false);
                            removePlacedBlockAt(pos.x, pos.y, pos.z);
                            if (isConnected) {
                                sendNetworkMessage({
                                    type: 'break-block',
                                    x: pos.x,
                                    y: pos.y,
                                    z: pos.z
                                });
                                sendNetworkMessage({
                                    type: 'tnt-explode',
                                    x: pos.x,
                                    y: pos.y + 0.45,
                                    z: pos.z
                                });
                            }
                            saveWorld(false);
                        }
                    }, 5000);
                }
            }
            
            if (mesh) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(mesh);
                
                mesh.visible = true; // initially visible when placed
                const newObj = {
                    type: type,
                    mesh: mesh,
                    pos: pos.clone(),
                    inCave: isDimensionCave(playerInCave),
                    initialRotationY: mesh.rotation.y,
                    burnTimeLeft: type === 'campfire' ? 60.0 : 0
                };
                placedObjects.push(newObj);
                if (type === 'bed') {
                    respawnPoint = {
                        x: pos.x,
                        y: pos.y,
                        z: pos.z,
                        inCave: isDimensionCave(playerInCave)
                    };
                    addChatMessage("Respawn point set to placed bed!", "system");
                }
                if (type === 'campfire' || type === 'fire') {
                    addCampfireFireMesh(newObj);
                }
                
                if (sendNetwork && isConnected) {
                    sendNetworkMessage({
                        type: 'place-block',
                        blockType: type,
                        x: pos.x,
                        y: pos.y,
                        z: pos.z,
                        inCave: isDimensionCave(playerInCave)
                    });
                }
                return newObj;
            }
            return null;
        }

        function updatePlacementPreview() {
            if (!placementPreview) return;
            const item = hotbarItems[selectedHotbarIndex];
            const placeableItems = ['log', 'planks', 'crafting_bench', 'stone', 'smooth_stone', 'stone_cutter', 'boat', 'stone_stairs', 'stone_slab', 'wooden_stairs', 'door', 'ladder', 'wool', 'bed', 'furnace', 'chest', 'coral', 'sand', 'tnt', 'unlit_campfire'];
            if (!item || !placeableItems.includes(item)) {
                placementPreview.visible = false;
                return;
            }
            const placePos = getGroundIntersectPoint(6.0);
            if (!placePos) {
                placementPreview.visible = false;
                return;
            }
            const widthX = (item === 'crafting_bench') ? 1.6 : ((item === 'chest' || item === 'bed') ? 0.8 : ((item === 'unlit_campfire') ? 0.7 : 0.9));
            const widthZ = (item === 'crafting_bench') ? 0.7 : ((item === 'chest' || item === 'bed') ? 0.8 : ((item === 'unlit_campfire') ? 0.7 : 0.9));
            const height = (item === 'crafting_bench') ? 1.0 : (item === 'door' ? 1.8 : ((item === 'stone_slab' || item === 'bed') ? 0.45 : ((item === 'unlit_campfire') ? 0.25 : 0.9)));
            placementPreview.scale.set(widthX, height, widthZ);
            placementPreview.position.set(placePos.x, placePos.y + height / 2, placePos.z);
            placementPreview.visible = true;
        }

        function igniteTnt(tntObj) {
            const pos = tntObj.pos;
            createExplosionEffect(pos.x, pos.y + 0.45, pos.z, 12.0, 60.0, false);
            removePlacedBlockAt(pos.x, pos.y, pos.z);
            if (isConnected) {
                sendNetworkMessage({
                    type: 'break-block',
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                });
                sendNetworkMessage({
                    type: 'tnt-explode',
                    x: pos.x,
                    y: pos.y + 0.45,
                    z: pos.z
                });
            }
            saveWorld(false);
        }

        function tryPlaceBlock() {
            const item = hotbarItems[selectedHotbarIndex];
            const placeableItems = ['log', 'planks', 'crafting_bench', 'stone', 'smooth_stone', 'stone_cutter', 'boat', 'stone_stairs', 'stone_slab', 'wooden_stairs', 'door', 'ladder', 'wool', 'bed', 'furnace', 'chest', 'coral', 'sand', 'tnt', 'unlit_campfire'];
            if (!item || !placeableItems.includes(item)) return false;
            
            const placePos = getGroundIntersectPoint(6.0);
            if (!placePos) return false;
            
            hotbarCounts[selectedHotbarIndex]--;
            if (hotbarCounts[selectedHotbarIndex] <= 0) {
                hotbarItems[selectedHotbarIndex] = null;
                hotbarCounts[selectedHotbarIndex] = 0;
            }
            updateHotbarUI();
            updateInventoryUI();
            
            spawnPlacedObject(item, placePos, true);
            AudioSynth.playHit(placePos);
            saveWorld(false);
            return true;
        }

        function clearPlacedObjects() {
            placedObjects.forEach(obj => {
                scene.remove(obj.mesh);
            });
            placedObjects.length = 0;
            obtainedItems.clear();
            obtainedItems.add('wooden_axe');
            obtainedItems.add('crafting_bench');
        }

        function updateFloatingItemUI() {
            const floatingDiv = document.getElementById('held-item-floating');
            if (!floatingDiv) return;
            
            if (heldItem) {
                const iconSpan = document.getElementById('held-item-icon');
                if (iconSpan) {
                    const iconUrl = getItemIconDataURL(heldItem.type);
                    iconSpan.innerHTML = `<img src="${iconUrl}" style="width: 36px; height: 36px; object-fit: contain;" />`;
                }
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
                            // Player cannot go on fire
                            // myBurnTime = 10;
                            // sendNetworkMessage({ type: 'fire-state', burning: true });
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
                            if (z.type === 'mimic_mushroom') {
                                makeMimicMushroomFlee(z, ex, ez, zkDir.x, zkDir.y);
                            }
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
                                handleZombieDeathDrops(z);
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

        // --- CRAWLING TREES SECTION ---
        function createCrawlingTreeMesh() {
            const treeGroup = new THREE.Group();
            treeGroup.zombieType = 'crawling_tree';
            
            const pineFoliageMat = new THREE.MeshStandardMaterial({ color: 0x0f3b1e, roughness: 0.8 });
            const pineTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3.5, 8);
            const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
            
            // Trunk
            const trunk = new THREE.Mesh(pineTrunkGeo, pineTrunkMat);
            trunk.position.y = 1.75;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            // Leaves (cones)
            const leaves = [];
            for (let j = 0; j < 3; j++) {
                const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.6 - j * 0.4, 2.2, 8), pineFoliageMat);
                leaf.position.y = 3.0 + j * 1.3;
                leaf.castShadow = true;
                treeGroup.add(leaf);
                leaves.push(leaf);
            }
            
            // 4 Crawling Legs
            const legMat = new THREE.MeshStandardMaterial({ color: 0x2d170b, roughness: 0.9 }); // slightly darker wood
            const legGeo = new THREE.BoxGeometry(0.15, 0.8, 0.15);
            
            // Front-Left Leg
            const legFL = new THREE.Mesh(legGeo, legMat);
            legFL.position.set(-0.35, 0.4, 0.35);
            legFL.castShadow = true;
            treeGroup.add(legFL);
            
            // Front-Right Leg
            const legFR = new THREE.Mesh(legGeo, legMat);
            legFR.position.set(0.35, 0.4, 0.35);
            legFR.castShadow = true;
            treeGroup.add(legFR);
            
            // Back-Left Leg
            const legBL = new THREE.Mesh(legGeo, legMat);
            legBL.position.set(-0.35, 0.4, -0.35);
            legBL.castShadow = true;
            treeGroup.add(legBL);
            
            // Back-Right Leg
            const legBR = new THREE.Mesh(legGeo, legMat);
            legBR.position.set(0.35, 0.4, -0.35);
            legBR.castShadow = true;
            treeGroup.add(legBR);
            
            // Initialize legs as invisible (standing state)
            legFL.visible = false;
            legFR.visible = false;
            legBL.visible = false;
            legBR.visible = false;
            
            // Store references in userData
            treeGroup.userData = {
                type: 'crawling_tree',
                trunk: trunk,
                leaves: leaves,
                legFL: legFL,
                legFR: legFR,
                legBL: legBL,
                legBR: legBR
            };
            
            return treeGroup;
        }

        function createMimicMushroomMesh(colorHex) {
            const group = new THREE.Group();
            group.zombieType = 'mimic_mushroom';
            
            // Stalk (like trunk)
            const stalkMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.85 }); // light grey stalk
            const stalkGeo = new THREE.CylinderGeometry(0.2, 0.28, 2.5, 8);
            const stalk = new THREE.Mesh(stalkGeo, stalkMat);
            stalk.position.y = 1.25;
            stalk.castShadow = true;
            group.add(stalk);
            
            // Mushroom Cap
            const capMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
            const capGeo = new THREE.SphereGeometry(1.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2); // hemisphere cap
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = 2.2;
            cap.scale.set(1.1, 0.75, 1.1); // flatten it slightly
            cap.castShadow = true;
            group.add(cap);
            
            // Tiny spots on the cap (white/yellowish boxes/spheres)
            const spotMat = new THREE.MeshStandardMaterial({ color: 0xefefff, roughness: 0.8 });
            const spots = [];
            const spotGeo = new THREE.BoxGeometry(0.15, 0.08, 0.15);
            // Place 6 spots on the cap
            const spotPositions = [
                { x: 0.4, y: 2.7, z: 0.4 },
                { x: -0.4, y: 2.7, z: -0.4 },
                { x: 0.6, y: 2.5, z: -0.3 },
                { x: -0.6, y: 2.5, z: 0.3 },
                { x: 0.0, y: 2.85, z: 0.0 },
                { x: 0.2, y: 2.6, z: -0.5 },
            ];
            spotPositions.forEach(pos => {
                const spot = new THREE.Mesh(spotGeo, spotMat);
                spot.position.set(pos.x, pos.y, pos.z);
                // Rotate spots slightly to align with hemisphere
                spot.rotation.x = pos.z * 0.8;
                spot.rotation.z = -pos.x * 0.8;
                group.add(spot);
                spots.push(spot);
            });
            
            // 4 Crawling Legs
            const legMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.95 }); // lighter stalk color for legs
            const legGeo = new THREE.BoxGeometry(0.12, 0.6, 0.12);
            
            // Front-Left Leg
            const legFL = new THREE.Mesh(legGeo, legMat);
            legFL.position.set(-0.25, 0.3, 0.25);
            legFL.castShadow = true;
            group.add(legFL);
            
            // Front-Right Leg
            const legFR = new THREE.Mesh(legGeo, legMat);
            legFR.position.set(0.25, 0.3, 0.25);
            legFR.castShadow = true;
            group.add(legFR);
            
            // Back-Left Leg
            const legBL = new THREE.Mesh(legGeo, legMat);
            legBL.position.set(-0.25, 0.3, -0.25);
            legBL.castShadow = true;
            group.add(legBL);
            
            // Back-Right Leg
            const legBR = new THREE.Mesh(legGeo, legMat);
            legBR.position.set(0.25, 0.3, -0.25);
            legBR.castShadow = true;
            group.add(legBR);
            
            // Initialize legs as invisible (standing state)
            legFL.visible = false;
            legFR.visible = false;
            legBL.visible = false;
            legBR.visible = false;
            
            legFL.scale.set(0.01, 0.01, 0.01);
            legFR.scale.set(0.01, 0.01, 0.01);
            legBL.scale.set(0.01, 0.01, 0.01);
            legBR.scale.set(0.01, 0.01, 0.01);
            
            // Store references in userData so animation function can use them
            group.userData = {
                type: 'mimic_mushroom',
                trunk: stalk,
                leaves: [cap, ...spots],
                legFL: legFL,
                legFR: legFR,
                legBL: legBL,
                legBR: legBR
            };
            
            return group;
        }

        function spawnCrawlingTrees() {
            function findNearbyLand(x, z, maxDist = 30) {
                let ty = getTerrainHeight(x, z, false);
                if (ty > WATER_Y) return { x, y: ty, z };
                for (let r = 2; r <= maxDist; r += 2) {
                    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                        const tx = x + Math.cos(angle) * r;
                        const tz = z + Math.sin(angle) * r;
                        const h = getTerrainHeight(tx, tz, false);
                        if (h > WATER_Y) {
                            return { x: tx, y: h, z: tz };
                        }
                    }
                }
                return null;
            }

            // Define 12 coordinates around spawn (60, 20)
            const coords = [
                { x: 45, z: 10 },
                { x: 75, z: 15 },
                { x: 52, z: 38 },
                { x: 65, z: -5 },
                { x: 80, z: 5 },
                { x: 40, z: 25 },
                { x: 35, z: 15 },
                { x: 85, z: 25 },
                { x: 50, z: -10 },
                { x: 70, z: 40 },
                { x: 30, z: 30 },
                { x: 85, z: -5 }
            ];
            
            // Add 5 coordinates on the 2nd Pine Island (350, 650)
            const pine2Coords = [
                { x: 330, z: 620 },
                { x: 370, z: 640 },
                { x: 350, z: 670 },
                { x: 320, z: 660 },
                { x: 360, z: 630 }
            ];
            
            coords.forEach((c, idx) => {
                const land = findNearbyLand(c.x, c.z, 30);
                if (!land) return;
                
                const tx = land.x;
                const tz = land.z;
                const ty = land.y;
                
                const id = `crawling_tree_${idx}`;
                // Avoid duplicating if already exists
                if (zombies.some(z => z.id === id)) return;
                
                const mesh = createCrawlingTreeMesh();
                mesh.zombieType = 'crawling_tree';
                mesh.position.set(tx, ty, tz);
                scene.add(mesh);
                
                zombies.push({
                    id: id,
                    mesh: mesh,
                    type: 'crawling_tree',
                    x: tx,
                    y: ty,
                    z: tz,
                    startX: tx,
                    startY: ty,
                    startZ: tz,
                    inCave: false,
                    chunkKey: 'spawn_island',
                    ry: 0,
                    lastAttackTime: 0,
                    isAttacking: false,
                    attackAnimTime: 0,
                    health: 99999, // Unkillable
                    burnTime: 0,
                    kx: 0,
                    kz: 0,
                    isDead: false,
                    deathTime: 0,
                    
                    state: 'standing',
                    stateTime: 0,
                    chaseDuration: 15,
                    attackAnimProgress: 0,
                    isWandering: false,
                    wanderTargetX: 0,
                    wanderTargetZ: 0,
                    isFleeing: false,
                    nextWanderTime: Date.now() + (20000 + Math.random() * 40000)
                });
            });

            pine2Coords.forEach((c, idx) => {
                const land = findNearbyLand(c.x, c.z, 30);
                if (!land) return;
                
                const tx = land.x;
                const tz = land.z;
                const ty = land.y;
                
                const id = `crawling_tree_p2_${idx}`;
                if (zombies.some(z => z.id === id)) return;
                
                const mesh = createCrawlingTreeMesh();
                mesh.zombieType = 'crawling_tree';
                mesh.position.set(tx, ty, tz);
                scene.add(mesh);
                
                zombies.push({
                    id: id,
                    mesh: mesh,
                    type: 'crawling_tree',
                    x: tx,
                    y: ty,
                    z: tz,
                    startX: tx,
                    startY: ty,
                    startZ: tz,
                    inCave: false,
                    chunkKey: 'pine_island_2',
                    ry: 0,
                    lastAttackTime: 0,
                    isAttacking: false,
                    attackAnimTime: 0,
                    health: 99999,
                    burnTime: 0,
                    kx: 0,
                    kz: 0,
                    isDead: false,
                    deathTime: 0,
                    
                    state: 'standing',
                    stateTime: 0,
                    chaseDuration: 15,
                    attackAnimProgress: 0,
                    isWandering: false,
                    wanderTargetX: 0,
                    wanderTargetZ: 0,
                    isFleeing: false,
                    nextWanderTime: Date.now() + (20000 + Math.random() * 40000)
                });
            });
        }

        function spawnMushroomMimics() {
            function findNearbyLand(x, z, maxDist = 30) {
                let ty = getTerrainHeight(x, z, false);
                if (ty > WATER_Y) return { x, y: ty, z };
                for (let r = 2; r <= maxDist; r += 2) {
                    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                        const tx = x + Math.cos(angle) * r;
                        const tz = z + Math.sin(angle) * r;
                        const h = getTerrainHeight(tx, tz, false);
                        if (h > WATER_Y) {
                            return { x: tx, y: h, z: tz };
                        }
                    }
                }
                return null;
            }

            // Coords around Mushroom Island (520, 650)
            const coords = [
                { x: 500, z: 620 },
                { x: 540, z: 640 },
                { x: 520, z: 670 },
                { x: 490, z: 650 },
                { x: 530, z: 630 },
                { x: 510, z: 660 }
            ];
            const colors = [
                0xeeb808, // Yellow
                0x151515, // Black
                0xd93838, // Red
                0x228b22  // Green
            ];
            
            coords.forEach((c, idx) => {
                const land = findNearbyLand(c.x, c.z, 30);
                if (!land) return;
                
                const tx = land.x;
                const tz = land.z;
                const ty = land.y;
                
                const id = `mimic_mushroom_${idx}`;
                // Avoid duplicating if already exists
                if (zombies.some(z => z.id === id)) return;
                
                const colorHex = colors[Math.floor(Math.random() * colors.length)];
                const mesh = createMimicMushroomMesh(colorHex);
                mesh.zombieType = 'mimic_mushroom';
                mesh.position.set(tx, ty, tz);
                scene.add(mesh);
                
                zombies.push({
                    id: id,
                    mesh: mesh,
                    type: 'mimic_mushroom',
                    mushroomColor: colorHex,
                    x: tx,
                    y: ty,
                    z: tz,
                    startX: tx,
                    startY: ty,
                    startZ: tz,
                    inCave: false,
                    chunkKey: 'mushroom_island',
                    ry: 0,
                    lastAttackTime: 0,
                    isAttacking: false,
                    attackAnimTime: 0,
                    health: 99999, // Unkillable
                    burnTime: 0,
                    kx: 0,
                    kz: 0,
                    isDead: false,
                    deathTime: 0,
                    
                    state: 'standing',
                    stateTime: 0,
                    chaseDuration: 15,
                    attackAnimProgress: 0,
                    isWandering: false,
                    wanderTargetX: 0,
                    wanderTargetZ: 0,
                    isFleeing: false,
                    nextWanderTime: Date.now() + (20000 + Math.random() * 40000)
                });
            });
        }

        function animateCrawlingTreeMesh(mesh, state, attackAnimProgress, delta, now) {
            const { legFL, legFR, legBL, legBR, trunk, leaves } = mesh.userData;
            if (!legFL) return;
            
            const isMushroom = mesh.userData.type === 'mimic_mushroom';
            const defaultTrunkY = isMushroom ? 1.25 : 1.75;
            
            if (state === 'standing') {
                legFL.visible = false;
                legFR.visible = false;
                legBL.visible = false;
                legBR.visible = false;
                
                legFL.scale.set(0.01, 0.01, 0.01);
                legFR.scale.set(0.01, 0.01, 0.01);
                legBL.scale.set(0.01, 0.01, 0.01);
                legBR.scale.set(0.01, 0.01, 0.01);
                
                legFL.position.y = 0;
                legFR.position.y = 0;
                legBL.position.y = 0;
                legBR.position.y = 0;

                legFL.rotation.set(0, 0, 0);
                legFR.rotation.set(0, 0, 0);
                legBL.rotation.set(0, 0, 0);
                legBR.rotation.set(0, 0, 0);
                
                // Shake check: determine if mimic tree should shiver/rustle leaves
                const px = mesh.position.x;
                const pz = mesh.position.z;
                // Deterministic pseudo-random seed based on coordinates so they don't shake in sync
                const timeOffset = Math.abs(Math.sin(px * 12.9898 + pz * 78.233)) * 100000;
                const cycle = 6000 + (timeOffset % 3000); // 6 to 9 seconds cycle (slightly more frequent)
                const t = (now + timeOffset) % cycle;
                const shakeDuration = 1800; // Shakes for 1.8 seconds out of the cycle
                
                if (t < shakeDuration) {
                    const progress = t / shakeDuration;
                    const intensity = Math.sin(progress * Math.PI); // Fade in and out shake intensity
                    
                    // Shiver/tilt the entire tree mesh
                    mesh.rotation.z = Math.sin(now * 0.06) * 0.045 * intensity;
                    mesh.rotation.x = Math.cos(now * 0.055) * 0.045 * intensity;
                    trunk.position.y = defaultTrunkY;
                    trunk.rotation.set(0, 0, 0);
                    
                    // Shake the leaves/cap (rustle them dynamically)
                    if (leaves) {
                        leaves.forEach((leaf, idx) => {
                            const phase = idx * 1.5;
                            leaf.rotation.z = Math.sin(now * 0.08 + phase) * 0.16 * intensity;
                            leaf.rotation.x = Math.cos(now * 0.075 + phase) * 0.12 * intensity;
                            leaf.position.x = Math.sin(now * 0.09 + phase) * 0.12 * intensity;
                            leaf.position.z = Math.cos(now * 0.085 + phase) * 0.12 * intensity;
                        });
                    }
                } else {
                    mesh.rotation.x = 0;
                    mesh.rotation.z = 0;
                    trunk.position.y = defaultTrunkY;
                    trunk.rotation.set(0, 0, 0);
                    
                    if (leaves) {
                        leaves.forEach((leaf) => {
                            leaf.rotation.x = 0;
                            leaf.rotation.z = 0;
                            leaf.position.x = 0;
                            leaf.position.z = 0;
                        });
                    }
                }
            } else if (state === 'rising') {
                legFL.visible = true;
                legFR.visible = true;
                legBL.visible = true;
                legBR.visible = true;
                
                const scale = Math.min(1.0, (legFL.scale.x + delta * 2.0));
                legFL.scale.set(scale, scale, scale);
                legFR.scale.set(scale, scale, scale);
                legBL.scale.set(scale, scale, scale);
                legBR.scale.set(scale, scale, scale);
                
                legFL.position.y = 0.4 * scale;
                legFR.position.y = 0.4 * scale;
                legBL.position.y = 0.4 * scale;
                legBR.position.y = 0.4 * scale;

                // Angling them outwards
                legFL.rotation.set(0.2, 0, -0.2);
                legFR.rotation.set(0.2, 0, 0.2);
                legBL.rotation.set(-0.2, 0, -0.2);
                legBR.rotation.set(-0.2, 0, 0.2);
                
                mesh.rotation.z = Math.sin(now * 0.05) * 0.08;
                mesh.rotation.x = Math.cos(now * 0.05) * 0.08;

                if (leaves) {
                    leaves.forEach((leaf, idx) => {
                        const phase = idx * 1.2;
                        leaf.rotation.z = Math.sin(now * 0.08 + phase) * 0.08;
                        leaf.rotation.x = Math.cos(now * 0.08 + phase) * 0.08;
                        leaf.position.x = Math.sin(now * 0.08 + phase) * 0.03;
                        leaf.position.z = Math.cos(now * 0.08 + phase) * 0.03;
                    });
                }
            } else if (state === 'chasing' || state === 'wandering') {
                legFL.visible = true;
                legFR.visible = true;
                legBL.visible = true;
                legBR.visible = true;
                
                legFL.scale.set(1.0, 1.0, 1.0);
                legFR.scale.set(1.0, 1.0, 1.0);
                legBL.scale.set(1.0, 1.0, 1.0);
                legBR.scale.set(1.0, 1.0, 1.0);
                
                legFL.position.y = 0.4;
                legFR.position.y = 0.4;
                legBL.position.y = 0.4;
                legBR.position.y = 0.4;

                // Crawling leg animation: alternate rotation
                const speedMult = (state === 'chasing') ? 0.015 : 0.01;
                const angle = Math.sin(now * speedMult) * 0.5;
                legFL.rotation.x = 0.2 + angle;
                legBR.rotation.x = -0.2 + angle;
                legFR.rotation.x = 0.2 - angle;
                legBL.rotation.x = -0.2 - angle;
                
                legFL.rotation.z = -0.2;
                legFR.rotation.z = 0.2;
                legBL.rotation.z = -0.2;
                legBR.rotation.z = 0.2;
                
                trunk.position.y = defaultTrunkY + Math.abs(Math.sin(now * speedMult)) * 0.15;
                mesh.rotation.x = 0;
                mesh.rotation.z = 0;

                if (leaves) {
                    leaves.forEach((leaf, idx) => {
                        const phase = idx * 1.0;
                        leaf.rotation.z = Math.sin(now * speedMult + phase) * 0.05;
                        leaf.rotation.x = Math.cos(now * speedMult + phase) * 0.03 - 0.05; // slightly lean back from velocity
                        leaf.position.x = Math.sin(now * speedMult + phase) * 0.02;
                        leaf.position.z = 0;
                    });
                }
            } else if (state === 'attacking') {
                legFL.visible = true;
                legFR.visible = true;
                legBL.visible = true;
                legBR.visible = true;
                
                legFL.position.y = 0.4;
                legFR.position.y = 0.4;
                legBL.position.y = 0.4;
                legBR.position.y = 0.4;

                const tilt = Math.sin(attackAnimProgress * Math.PI) * 0.8;
                mesh.rotation.x = tilt; // Tilt entire tree forward
                
                legFL.rotation.set(0.2, 0, -0.2);
                legFR.rotation.set(0.2, 0, 0.2);
                legBL.rotation.set(-0.2, 0, -0.2);
                legBR.rotation.set(-0.2, 0, 0.2);

                if (leaves) {
                    leaves.forEach((leaf, idx) => {
                        // Lag behind the swing tilt dynamically
                        leaf.rotation.x = -tilt * 0.2 * (idx + 1);
                        leaf.rotation.z = 0;
                        leaf.position.x = 0;
                        leaf.position.z = 0;
                    });
                }
            } else if (state === 'burrowing') {
                legFL.visible = true;
                legFR.visible = true;
                legBL.visible = true;
                legBR.visible = true;
                
                const scale = Math.max(0.01, (legFL.scale.x - delta * 2.0));
                legFL.scale.set(scale, scale, scale);
                legFR.scale.set(scale, scale, scale);
                legBL.scale.set(scale, scale, scale);
                legBR.scale.set(scale, scale, scale);
                
                legFL.position.y = 0.4 * scale;
                legFR.position.y = 0.4 * scale;
                legBL.position.y = 0.4 * scale;
                legBR.position.y = 0.4 * scale;

                mesh.rotation.z = Math.sin(now * 0.05) * 0.08;
                mesh.rotation.x = Math.cos(now * 0.05) * 0.08;

                if (leaves) {
                    leaves.forEach((leaf, idx) => {
                        const phase = idx * 1.2;
                        leaf.rotation.z = Math.sin(now * 0.08 + phase) * 0.08;
                        leaf.rotation.x = Math.cos(now * 0.08 + phase) * 0.08;
                        leaf.position.x = Math.sin(now * 0.08 + phase) * 0.03;
                        leaf.position.z = Math.cos(now * 0.08 + phase) * 0.03;
                    });
                }
            }
        }

        function spawnDirtParticles(position, count = 12) {
            for (let i = 0; i < count; i++) {
                const size = 0.08 + Math.random() * 0.15;
                const geo = new THREE.BoxGeometry(size, size, size);
                const mat = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.4 ? 0x4e3629 : 0x1e3f20, // brown or dark green
                    transparent: true,
                    opacity: 0.95
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.copy(position);
                mesh.position.x += (Math.random() - 0.5) * 1.5;
                mesh.position.y += (Math.random() - 0.5) * 0.5 + 0.2;
                mesh.position.z += (Math.random() - 0.5) * 1.5;
                
                scene.add(mesh);
                
                eatingParticles.push({
                    mesh: mesh,
                    mat: mat,
                    velX: (Math.random() - 0.5) * 1.2,
                    velY: 1.0 + Math.random() * 2.0,
                    velZ: (Math.random() - 0.5) * 1.2,
                    life: 0.5 + Math.random() * 0.5
                });
            }
        }

        function makeMimicMushroomFlee(z, attackerX, attackerZ, kx, kz) {
            if (z.type !== 'mimic_mushroom') return;
            
            z.isFleeing = true;
            z.isWandering = true;
            
            if (z.state === 'standing' || z.state === 'burrowing') {
                z.state = 'rising';
                z.stateTime = 0;
                spawnDirtParticles(z.mesh.position, 12);
                AudioSynth.playClack(z.mesh.position);
            } else {
                z.state = 'wandering';
            }
            
            let fleeDirX = 0;
            let fleeDirZ = 0;
            
            if (kx !== undefined && kz !== undefined && (kx !== 0 || kz !== 0)) {
                const len = Math.sqrt(kx * kx + kz * kz);
                fleeDirX = kx / len;
                fleeDirZ = kz / len;
            } else if (attackerX !== undefined && attackerZ !== undefined) {
                const dx = z.mesh.position.x - attackerX;
                const dz = z.mesh.position.z - attackerZ;
                const len = Math.sqrt(dx * dx + dz * dz);
                if (len > 0) {
                    fleeDirX = dx / len;
                    fleeDirZ = dz / len;
                }
            }
            
            if (fleeDirX === 0 && fleeDirZ === 0) {
                const angle = Math.random() * Math.PI * 2;
                fleeDirX = Math.cos(angle);
                fleeDirZ = Math.sin(angle);
            }
            
            let foundFleeTarget = false;
            for (let d = 30.0; d >= 10.0; d -= 5.0) {
                const tx = z.mesh.position.x + fleeDirX * d;
                const tz = z.mesh.position.z + fleeDirZ * d;
                if (getTerrainHeight(tx, tz, false) > WATER_Y) {
                    z.wanderTargetX = tx;
                    z.wanderTargetZ = tz;
                    foundFleeTarget = true;
                    break;
                }
            }
            if (!foundFleeTarget) {
                for (let angleOffset = 0.4; angleOffset <= 2.0; angleOffset += 0.4) {
                    for (let sign of [-1, 1]) {
                        const angle = Math.atan2(fleeDirZ, fleeDirX) + sign * angleOffset;
                        const tx = z.mesh.position.x + Math.cos(angle) * 20.0;
                        const tz = z.mesh.position.z + Math.sin(angle) * 20.0;
                        if (getTerrainHeight(tx, tz, false) > WATER_Y) {
                            z.wanderTargetX = tx;
                            z.wanderTargetZ = tz;
                            foundFleeTarget = true;
                            break;
                        }
                    }
                    if (foundFleeTarget) break;
                }
            }
            if (!foundFleeTarget) {
                z.wanderTargetX = z.mesh.position.x + (Math.random() - 0.5) * 10;
                z.wanderTargetZ = z.mesh.position.z + (Math.random() - 0.5) * 10;
            }
        }

        function updateMimic(z, delta, now) {
            z.mesh.visible = (isDimensionCave(z.inCave) === isDimensionCave(playerInCave));
            
            // Apply knockback velocities
            z.kx = 0;
            z.kz = 0;

            const px = camera.position.x;
            const pz = camera.position.z;
            
            let targetX = px;
            let targetZ = pz;
            let targetType = 'host';
            let minDist = Infinity;
            
            const canTargetHost = myHealth > 0 && !inBush;
            if (canTargetHost) {
                minDist = Math.sqrt(Math.pow(z.mesh.position.x - px, 2) + Math.pow(z.mesh.position.z - pz, 2));
            }
            
            if (opponentGroup && oppHealth > 0 && isConnected && !opponentInvisible && !opponentInCave) {
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
            
            z.stateTime += delta;
            
            if (z.state === 'standing') {
                if (z.type === 'crawling_tree' && minDist < 8.0) {
                    z.state = 'rising';
                    z.stateTime = 0;
                    z.isWandering = false;
                    z.isFleeing = false;
                    spawnDirtParticles(z.mesh.position, 12);
                    AudioSynth.playClack(z.mesh.position);
                } else if (now >= z.nextWanderTime) {
                    // Periodic wander check: rise and settle somewhere else
                    z.state = 'rising';
                    z.stateTime = 0;
                    z.isWandering = true;
                    z.isFleeing = false;
                    
                    // Choose destination within a radius of 25 from starting point
                    if (z.type === 'mimic_mushroom' || z.type === 'crawling_tree') {
                        let foundWanderTarget = false;
                        for (let attempts = 0; attempts < 15; attempts++) {
                            const angle = Math.random() * Math.PI * 2;
                            const r = 10 + Math.random() * 20;
                            const tx = z.startX + Math.cos(angle) * r;
                            const tz = z.startZ + Math.sin(angle) * r;
                            const ty = getTerrainHeight(tx, tz, false);
                            if (ty > WATER_Y) {
                                z.wanderTargetX = tx;
                                z.wanderTargetZ = tz;
                                foundWanderTarget = true;
                                break;
                            }
                        }
                        if (!foundWanderTarget) {
                            z.wanderTargetX = z.startX;
                            z.wanderTargetZ = z.startZ;
                        }
                    } else {
                        const angle = Math.random() * Math.PI * 2;
                        const r = 10 + Math.random() * 20;
                        z.wanderTargetX = z.startX + Math.cos(angle) * r;
                        z.wanderTargetZ = z.startZ + Math.sin(angle) * r;
                    }
                    
                    spawnDirtParticles(z.mesh.position, 12);
                    AudioSynth.playClack(z.mesh.position);
                }
            } else if (z.state === 'rising') {
                if (z.stateTime >= 1.0) {
                    if (z.isWandering) {
                        z.state = 'wandering';
                    } else {
                        z.state = 'chasing';
                        z.chaseDuration = 10.0 + Math.random() * 10.0;
                    }
                    z.stateTime = 0;
                }
            } else if (z.state === 'chasing') {
                const dx = targetX - z.mesh.position.x;
                const dz = targetZ - z.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist > 0.1 && minDist !== Infinity) {
                    const speed = 3.8;
                    const vx = (dx / dist) * speed;
                    const vz = (dz / dist) * speed;
                    
                    const nextX = z.mesh.position.x + vx * delta;
                    const nextZ = z.mesh.position.z + vz * delta;
                    const nextY = getTerrainHeight(nextX, nextZ, false);
                    
                    if ((z.type === 'crawling_tree' || z.type === 'mimic_mushroom') && nextY <= WATER_Y) {
                        // Stop chasing and burrow if they hit water
                        z.state = 'burrowing';
                        z.stateTime = 0;
                        spawnDirtParticles(z.mesh.position, 8);
                    } else {
                        z.mesh.position.x = nextX;
                        z.mesh.position.z = nextZ;
                        z.mesh.position.y = nextY;
                        
                        z.ry = Math.atan2(dx, dz);
                        z.mesh.rotation.y = z.ry;
                    }
                }
                
                // Attack range check (2.5 meters) - tree mimics only
                if (z.type === 'crawling_tree' && dist < 2.5 && now - z.lastAttackTime > 1500 && minDist !== Infinity) {
                    z.state = 'attacking';
                    z.stateTime = 0;
                    z.attackAnimProgress = 0;
                    z.lastAttackTime = now;
                    
                    const kx = (targetX - z.mesh.position.x);
                    const kz = (targetZ - z.mesh.position.z);
                    const kLen = Math.sqrt(kx * kx + kz * kz);
                    const force = 12.0;
                    const kxNorm = kLen > 0 ? (kx / kLen) * force : 0;
                    const kzNorm = kLen > 0 ? (kz / kLen) * force : 0;
                    
                    if (targetType === 'host') {
                        takeDamage(23, kxNorm, kzNorm, "Smacked by a Crawling Tree!");
                    } else if (targetType === 'client') {
                        sendNetworkMessage({
                            type: 'zombie-hit',
                            damage: 23,
                            kx: kxNorm,
                            kz: kzNorm,
                            reason: "Smacked by a Crawling Tree!"
                        });
                    }
                }
                
                if (z.stateTime >= z.chaseDuration) {
                    z.state = 'burrowing';
                    z.stateTime = 0;
                    spawnDirtParticles(z.mesh.position, 8);
                }
            } else if (z.state === 'wandering') {
                // Moving towards wandering destination or fleeing
                let tx = z.wanderTargetX;
                let tz = z.wanderTargetZ;
                let speed = z.isFleeing ? 4.5 : 2.0;
                
                const dx = tx - z.mesh.position.x;
                const dz = tz - z.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                // Player detection (range 20 coordinates)
                if (minDist < 20.0) {
                    if (z.type === 'crawling_tree') {
                        // Aggressive: attack/chase
                        z.state = 'chasing';
                        z.isWandering = false;
                        z.isFleeing = false;
                        z.stateTime = 0;
                        z.chaseDuration = 15.0;
                    } else if (z.type === 'mimic_mushroom' && !z.isFleeing) {
                        // Passive: flee away in opposite direction
                        z.isFleeing = true;
                        
                        const fleeDx = z.mesh.position.x - targetX;
                        const fleeDz = z.mesh.position.z - targetZ;
                        const fleeLen = Math.sqrt(fleeDx * fleeDx + fleeDz * fleeDz);
                        
                        const fleeDirX = fleeLen > 0 ? fleeDx / fleeLen : 1;
                        const fleeDirZ = fleeLen > 0 ? fleeDz / fleeLen : 0;
                        
                        // Set new destination 25 units away opposite from player, ensuring it's on land
                        let foundFleeTarget = false;
                        for (let d = 25.0; d >= 5.0; d -= 5.0) {
                            const tx = z.mesh.position.x + fleeDirX * d;
                            const tz = z.mesh.position.z + fleeDirZ * d;
                            if (getTerrainHeight(tx, tz, false) > WATER_Y) {
                                z.wanderTargetX = tx;
                                z.wanderTargetZ = tz;
                                foundFleeTarget = true;
                                break;
                            }
                        }
                        if (!foundFleeTarget) {
                            // If straight back is water, try adjusting the angle
                            for (let angleOffset = 0.4; angleOffset <= 2.0; angleOffset += 0.4) {
                                for (let sign of [-1, 1]) {
                                    const angle = Math.atan2(fleeDirZ, fleeDirX) + sign * angleOffset;
                                    const tx = z.mesh.position.x + Math.cos(angle) * 20.0;
                                    const tz = z.mesh.position.z + Math.sin(angle) * 20.0;
                                    if (getTerrainHeight(tx, tz, false) > WATER_Y) {
                                        z.wanderTargetX = tx;
                                        z.wanderTargetZ = tz;
                                        foundFleeTarget = true;
                                        break;
                                    }
                                }
                                if (foundFleeTarget) break;
                            }
                        }
                        if (!foundFleeTarget) {
                            // Failsafe: stay put
                            z.wanderTargetX = z.mesh.position.x;
                            z.wanderTargetZ = z.mesh.position.z;
                        }
                    }
                }
                
                if (dist > 0.3) {
                    const vx = (dx / dist) * speed;
                    const vz = (dz / dist) * speed;
                    
                    const nextX = z.mesh.position.x + vx * delta;
                    const nextZ = z.mesh.position.z + vz * delta;
                    const nextY = getTerrainHeight(nextX, nextZ, false);
                    
                    if ((z.type === 'mimic_mushroom' || z.type === 'crawling_tree') && nextY <= WATER_Y) {
                        // Stop moving in this direction if it leads into water!
                        z.state = 'burrowing';
                        z.stateTime = 0;
                        spawnDirtParticles(z.mesh.position, 8);
                    } else {
                        z.mesh.position.x = nextX;
                        z.mesh.position.z = nextZ;
                        z.mesh.position.y = nextY;
                        
                        z.ry = Math.atan2(dx, dz);
                        z.mesh.rotation.y = z.ry;
                    }
                } else {
                    // Settle down
                    z.state = 'burrowing';
                    z.stateTime = 0;
                    spawnDirtParticles(z.mesh.position, 8);
                }
            } else if (z.state === 'attacking') {
                z.attackAnimProgress += delta * 2.5;
                if (z.attackAnimProgress >= 1.0) {
                    z.state = 'chasing';
                    z.stateTime = 0;
                    z.attackAnimProgress = 0;
                }
            } else if (z.state === 'burrowing') {
                z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z, false);
                
                if (z.stateTime >= 1.5) {
                    z.startX = z.mesh.position.x;
                    z.startY = z.mesh.position.y;
                    z.startZ = z.mesh.position.z;
                    z.mesh.rotation.set(0, 0, 0);
                    z.ry = 0;
                    z.state = 'standing';
                    z.stateTime = 0;
                    z.isWandering = false;
                    z.isFleeing = false;
                    z.nextWanderTime = now + (25000 + Math.random() * 45000); // 25s to 70s intervals
                    spawnDirtParticles(z.mesh.position, 10);
                }
            }
            
            z.x = z.mesh.position.x;
            z.y = z.mesh.position.y;
            z.z = z.mesh.position.z;
            
            animateCrawlingTreeMesh(z.mesh, z.state, z.attackAnimProgress, delta, now);
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
            
            const numSegments = 5;
            const length = 0.75;
            const woodMat = bowMat; // Dark brown
            const stringMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
            
            for (let i = 0; i < numSegments; i++) {
                const t1 = i / numSegments;
                const t2 = (i + 1) / numSegments;
                
                const y1 = -length/2 + length * t1;
                const y2 = -length/2 + length * t2;
                
                const angle1 = t1 * Math.PI;
                const angle2 = t2 * Math.PI;
                
                const z1 = Math.sin(angle1) * 0.12;
                const z2 = Math.sin(angle2) * 0.12;
                
                const p1 = new THREE.Vector3(0, y1, z1);
                const p2 = new THREE.Vector3(0, y2, z2);
                
                const distance = p1.distanceTo(p2);
                const segmentGeo = new THREE.CylinderGeometry(0.015, 0.015, distance, 6);
                const segmentMesh = new THREE.Mesh(segmentGeo, woodMat);
                
                const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
                segmentMesh.position.copy(midpoint);
                
                const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
                const alignAxis = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);
                segmentMesh.quaternion.copy(quaternion);
                
                segmentMesh.castShadow = true;
                bow.add(segmentMesh);
            }
            
            const stringGeo = new THREE.CylinderGeometry(0.004, 0.004, length, 4);
            const stringMesh = new THREE.Mesh(stringGeo, stringMat);
            stringMesh.position.set(0, 0, -0.06);
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
                
                // Check if player or opponent is in the desert biome
                let playerNearDesert = false;
                let targetX = 350;
                let targetZ = -350;
                
                const distHost = Math.sqrt(Math.pow(camera.position.x - 350, 2) + Math.pow(camera.position.z + 350, 2));
                const hostInDesert = (!playerInCave && distHost < 180);
                const oppInDesert = (isConnected && opponentGroup && !opponentInCave && 
                    Math.sqrt(Math.pow(opponentGroup.position.x - 350, 2) + Math.pow(opponentGroup.position.z + 350, 2)) < 180);
                
                if (hostInDesert) {
                    targetX = camera.position.x;
                    targetZ = camera.position.z;
                    playerNearDesert = true;
                } else if (oppInDesert) {
                    targetX = opponentGroup.position.x;
                    targetZ = opponentGroup.position.z;
                    playerNearDesert = true;
                }
                
                let spawnedInDesert = false;
                
                if (playerNearDesert) {
                    let attempts = 0;
                    while (attempts < 15) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 25 + Math.random() * 45; // 25m to 70m from player
                        const tx = targetX + Math.cos(angle) * dist;
                        const tz = targetZ + Math.sin(angle) * dist;
                        const dDesert = Math.sqrt(Math.pow(tx - 350, 2) + Math.pow(tz + 350, 2));
                        if (dDesert < 160) {
                            zx = tx;
                            zz = tz;
                            spawnedInDesert = true;
                            break;
                        }
                        attempts++;
                    }
                }
                
                // baseline 10% chance to spawn in the desert anyway
                if (!spawnedInDesert && Math.random() < 0.10) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * 150;
                    zx = 350 + Math.cos(angle) * dist;
                    zz = -350 + Math.sin(angle) * dist;
                    spawnedInDesert = true;
                }
                
                if (!spawnedInDesert) {
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
                }
                
                const zy = getTerrainHeight(zx, zz);
                
                // Force TNT Zombie (creeper) if inside the desert dunes biome bounds
                const distToDesertCenter = Math.sqrt(Math.pow(zx - 350, 2) + Math.pow(zz + 350, 2));
                const inDesertBiome = distToDesertCenter < 180;
                
                let type, health, mesh;
                if (inDesertBiome) {
                    type = 'creeper';
                    health = 38;
                    mesh = createCreeperMesh();
                } else {
                    const randType = Math.random();
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

        function clearZombies(forceAll = false) {
            for (let i = zombies.length - 1; i >= 0; i--) {
                if (forceAll || (zombies[i].type !== 'crawling_tree' && zombies[i].type !== 'mimic_mushroom')) {
                    scene.remove(zombies[i].mesh);
                    zombies.splice(i, 1);
                }
            }
            
            clientZombies.forEach((mesh, id) => {
                if (forceAll || (mesh.zombieType !== 'crawling_tree' && mesh.zombieType !== 'mimic_mushroom')) {
                    scene.remove(mesh);
                }
            });
            if (forceAll) {
                clientZombies.clear();
            } else {
                for (let [id, mesh] of clientZombies) {
                    if (mesh.zombieType !== 'crawling_tree' && mesh.zombieType !== 'mimic_mushroom') {
                        clientZombies.delete(id);
                    }
                }
            }
            
            if (isHost && isConnected) {
                sendNetworkMessage({ type: 'zombies-clear' });
            }
        }

        function updateZombies(delta) {
            if (!isHost || !gameActive || myHealth <= 0) return;
            
            const now = Date.now();
            
            for (let i = zombies.length - 1; i >= 0; i--) {
                const z = zombies[i];
                
                if (z.type === 'crawling_tree' || z.type === 'mimic_mushroom') {
                    updateMimic(z, delta, now);
                    continue;
                }
                
                // Hide zombies that are in a different dimension than the player
                z.mesh.visible = (isDimensionCave(z.inCave) === isDimensionCave(playerInCave));
                
                // 1. Handle death and slumping
                if (z.isDead) {
                    if (z.deathTime === undefined) z.deathTime = 0;
                    z.deathTime += delta;
                    
                    const slumpProgress = Math.min(1.0, z.deathTime / 0.8);
                    z.mesh.rotation.x = slumpProgress * (-Math.PI / 2);
                    z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z, z.inCave) + 0.15 * (1 - slumpProgress);
                    z.mesh.children[2].rotation.x = -Math.PI / 2.2 + slumpProgress * Math.PI / 2;
                    z.mesh.children[3].rotation.x = -Math.PI / 2.2 + slumpProgress * Math.PI / 2;
                    continue;
                }

                // Check if zombie enters the lake
                const zdx_lake = z.mesh.position.x - LAKE_CENTER_X;
                const zdz_lake = z.mesh.position.z - LAKE_CENTER_Z;
                const zDistToLake = Math.sqrt(zdx_lake * zdx_lake + zdz_lake * zdz_lake);
                const isZombieInLake = !z.inCave && ((zDistToLake < LAKE_RADIUS && z.mesh.position.y < WATER_Y + 0.5) || (z.mesh.position.y <= WATER_Y));

                if (isZombieInLake) {
                    z.burnTime = 0;
                }

                // 2. Daytime burning (Zombies and Skeletons burn in daylight; Creepers do not; Cave mobs do not)
                if (isDayTime && !isZombieInLake && !z.inCave && (z.type === 'zombie' || z.type === 'skeleton')) {
                    if (z.burnTime <= 0) z.burnTime = 1;
                    z.health -= 6.0 * delta;
                    spawnFireParticles(z.mesh.position, 1);
                    
                    if (z.health <= 0) {
                        z.isDead = true;
                        z.deathTime = 0;
                        handleZombieDeathDrops(z);
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
                        handleZombieDeathDrops(z);
                        continue;
                    }
                }
                
                // Apply knockback velocities
                if (z.kx || z.kz) {
                    z.mesh.position.x += z.kx * delta;
                    z.mesh.position.z += z.kz * delta;
                    z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z, z.inCave);
                    
                    z.kx -= z.kx * 4.5 * delta;
                    z.kz -= z.kz * 4.5 * delta;
                    if (Math.abs(z.kx) < 0.05) z.kx = 0;
                    if (Math.abs(z.kz) < 0.05) z.kz = 0;
                }
                
                const px = camera.position.x;
                const pz = camera.position.z;
                
                // Target Selection (nearest of Host, Opponent, or Villager in same dimension)
                let targetX = px;
                let targetZ = pz;
                let targetType = 'host';
                let minDist = Infinity;
                
                const isZombieInCave = !!z.inCave;
                const canTargetHost = (playerInCave === isZombieInCave) && myHealth > 0 && !inBush;
                
                if (canTargetHost) {
                    minDist = Math.sqrt(Math.pow(z.mesh.position.x - px, 2) + Math.pow(z.mesh.position.z - pz, 2));
                }
                
                if (opponentGroup && oppHealth > 0 && isConnected && !opponentInvisible && (opponentInCave === isZombieInCave)) {
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
                    const isVillagerInCave = !!v.inCave;
                    if (isVillagerInCave !== isZombieInCave) return;
                    const distToVillager = Math.sqrt(Math.pow(z.mesh.position.x - v.mesh.position.x, 2) + Math.pow(z.mesh.position.z - v.mesh.position.z, 2));
                    if (distToVillager < minDist) {
                        minDist = distToVillager;
                        targetX = v.mesh.position.x;
                        targetZ = v.mesh.position.z;
                        targetType = v;
                    }
                });

                // Cap night mob detection range to 16 coordinates
                if (minDist > 16.0) {
                    minDist = Infinity;
                }
                
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
                    z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z, z.inCave);
                    
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
                        z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z, z.inCave);
                        
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
                        const targetPos = new THREE.Vector3(targetX, getTerrainHeight(targetX, targetZ, z.inCave) + 1.0, targetZ);
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
                        z.mesh.position.y = getTerrainHeight(z.mesh.position.x, z.mesh.position.z, z.inCave);
                        
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
                    mushroomColor: z.mushroomColor || 0xd93838,
                    isHissing: z.isHissing || false,
                    inCave: z.inCave || false,
                    crawlingTreeState: z.state || 'standing',
                    attackAnimProgress: z.attackAnimProgress || 0
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

        function createTurtleMesh() {
            const group = new THREE.Group();
            const shellMat = new THREE.MeshStandardMaterial({ color: 0x1f5c22, roughness: 0.9 }); // Dark green
            const skinMat = new THREE.MeshStandardMaterial({ color: 0x4a9c4d, roughness: 0.8 });  // Lighter green
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

            // Shell (torso)
            const shell = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.9), shellMat);
            shell.position.y = 0.2;
            shell.castShadow = true;
            shell.receiveShadow = true;
            group.add(shell);

            // Head
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.25), skinMat);
            head.position.set(0, 0.2, 0.55);
            head.castShadow = true;
            group.add(head);

            // Flippers (4 legs, rotated/flat)
            const flipperGeo = new THREE.BoxGeometry(0.2, 0.05, 0.4);
            
            const flipperFL = new THREE.Mesh(flipperGeo, skinMat);
            flipperFL.position.set(-0.45, 0.1, 0.35);
            flipperFL.rotation.y = Math.PI / 4;
            flipperFL.castShadow = true;
            group.add(flipperFL);

            const flipperFR = new THREE.Mesh(flipperGeo, skinMat);
            flipperFR.position.set(0.45, 0.1, 0.35);
            flipperFR.rotation.y = -Math.PI / 4;
            flipperFR.castShadow = true;
            group.add(flipperFR);

            const flipperBL = new THREE.Mesh(flipperGeo, skinMat);
            flipperBL.position.set(-0.4, 0.1, -0.35);
            flipperBL.rotation.y = -Math.PI / 4;
            flipperBL.castShadow = true;
            group.add(flipperBL);

            const flipperBR = new THREE.Mesh(flipperGeo, skinMat);
            flipperBR.position.set(0.4, 0.1, -0.35);
            flipperBR.rotation.y = Math.PI / 4;
            flipperBR.castShadow = true;
            group.add(flipperBR);

            group.userData = { type: 'turtle', head: head, legFL: flipperFL, legFR: flipperFR, legBL: flipperBL, legBR: flipperBR };
            return group;
        }

        function createHorseMesh() {
            const group = new THREE.Group();
            
            // Materials
            const horseColor = 0x8b4513; // SaddleBrown (reddish brown)
            const horseMat = new THREE.MeshStandardMaterial({ color: horseColor, roughness: 0.8 });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 }); // Dark brown for hooves / mane / tail
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const saddleMat = new THREE.MeshStandardMaterial({ color: 0x802a0a, roughness: 0.7 }); // Saddle leather color
            const stirrupMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 });

            // Torso (centered around y = 0.95)
            // A horse torso is taller and longer
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 1.4), horseMat);
            torso.position.y = 0.95;
            torso.castShadow = true;
            torso.receiveShadow = true;
            group.add(torso);

            // Neck (angled up)
            const neck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.6, 0.35), horseMat);
            neck.position.set(0, 1.35, 0.55);
            neck.rotation.x = -0.3; // Angle neck forward
            neck.castShadow = true;
            group.add(neck);

            // Mane (hair along neck)
            const mane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.1), darkMat);
            mane.position.set(0, 1.45, 0.45);
            mane.rotation.x = -0.3;
            group.add(mane);

            // Head (longer head placed on neck)
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 1.55, 0.75);
            
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.55), horseMat);
            head.position.set(0, 0, 0);
            head.castShadow = true;
            headGroup.add(head);

            // Snout/Nose
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.15), darkMat);
            nose.position.set(0, -0.05, 0.3);
            nose.castShadow = true;
            headGroup.add(nose);

            // Ears
            const earGeo = new THREE.BoxGeometry(0.08, 0.16, 0.08);
            const earL = new THREE.Mesh(earGeo, horseMat);
            earL.position.set(-0.1, 0.22, -0.15);
            const earR = new THREE.Mesh(earGeo, horseMat);
            earR.position.set(0.1, 0.22, -0.15);
            headGroup.add(earL);
            headGroup.add(earR);

            // Eyes
            const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), eyeMat);
            leftEye.position.set(-0.17, 0.06, 0.15);
            const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), eyeMat);
            rightEye.position.set(0.17, 0.06, 0.15);
            headGroup.add(leftEye);
            headGroup.add(rightEye);

            group.add(headGroup);

            // Tail
            const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), darkMat);
            tail.position.set(0, 0.8, -0.75);
            tail.rotation.x = 0.1;
            tail.castShadow = true;
            group.add(tail);

            // 4 Long Legs
            const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
            const hoofGeo = new THREE.BoxGeometry(0.2, 0.1, 0.2);
            
            // FL
            const legFLGroup = new THREE.Group();
            legFLGroup.position.set(-0.25, 0.6, 0.5);
            const legFL = new THREE.Mesh(legGeo, horseMat);
            legFL.position.y = -0.325;
            legFL.castShadow = true;
            const hoofFL = new THREE.Mesh(hoofGeo, darkMat);
            hoofFL.position.y = -0.65;
            legFLGroup.add(legFL);
            legFLGroup.add(hoofFL);
            group.add(legFLGroup);

            // FR
            const legFRGroup = new THREE.Group();
            legFRGroup.position.set(0.25, 0.6, 0.5);
            const legFR = new THREE.Mesh(legGeo, horseMat);
            legFR.position.y = -0.325;
            legFR.castShadow = true;
            const hoofFR = new THREE.Mesh(hoofGeo, darkMat);
            hoofFR.position.y = -0.65;
            legFRGroup.add(legFR);
            legFRGroup.add(hoofFR);
            group.add(legFRGroup);

            // BL
            const legBLGroup = new THREE.Group();
            legBLGroup.position.set(-0.25, 0.6, -0.5);
            const legBL = new THREE.Mesh(legGeo, horseMat);
            legBL.position.y = -0.325;
            legBL.castShadow = true;
            const hoofBL = new THREE.Mesh(hoofGeo, darkMat);
            hoofBL.position.y = -0.65;
            legBLGroup.add(legBL);
            legBLGroup.add(hoofBL);
            group.add(legBLGroup);

            // BR
            const legBRGroup = new THREE.Group();
            legBRGroup.position.set(0.25, 0.6, -0.5);
            const legBR = new THREE.Mesh(legGeo, horseMat);
            legBR.position.y = -0.325;
            legBR.castShadow = true;
            const hoofBR = new THREE.Mesh(hoofGeo, darkMat);
            hoofBR.position.y = -0.65;
            legBRGroup.add(legBR);
            legBRGroup.add(hoofBR);
            group.add(legBRGroup);

            // Saddle (wrapped around torso, initially invisible)
            const saddleGroup = new THREE.Group();
            const saddleBase = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.5, 0.5), saddleMat);
            saddleBase.position.y = 0.96;
            saddleBase.position.z = -0.1;
            saddleBase.castShadow = true;
            saddleGroup.add(saddleBase);

            // Stirrup straps & metal stirrups
            const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.04), darkMat);
            strapL.position.set(-0.38, 0.65, -0.1);
            saddleGroup.add(strapL);
            const metalL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.08), stirrupMat);
            metalL.position.set(-0.38, 0.4, -0.1);
            saddleGroup.add(metalL);

            const strapR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.04), darkMat);
            strapR.position.set(0.38, 0.65, -0.1);
            saddleGroup.add(strapR);
            const metalR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.08), stirrupMat);
            metalR.position.set(0.38, 0.4, -0.1);
            saddleGroup.add(metalR);

            saddleGroup.visible = false;
            group.add(saddleGroup);

            group.userData = { type: 'horse', head: headGroup, legFL: legFLGroup, legFR: legFRGroup, legBL: legBLGroup, legBR: legBRGroup, saddle: saddleGroup };
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

        function handleAnimalDeathDrops(animal) {
            spawnDroppedFood(getFoodTypeForAnimal(animal.type), animal.mesh.position);
            if (animal.type === 'sheep') {
                spawnDroppedFood('wool', animal.mesh.position.clone().add(new THREE.Vector3(0.2, 0.2, 0.2)));
            } else if (animal.type === 'turtle') {
                spawnDroppedFood('turtle_shell', animal.mesh.position.clone().add(new THREE.Vector3(0.2, 0.2, 0.2)));
            } else if (animal.type === 'cow') {
                spawnDroppedFood('leather', animal.mesh.position.clone().add(new THREE.Vector3(0.2, 0.2, 0.2)));
            } else if (animal.type === 'horse') {
                spawnDroppedFood('leather', animal.mesh.position.clone().add(new THREE.Vector3(0.2, 0.2, 0.2)));
                if (animal.hasSaddle) {
                    spawnDroppedFood('saddle', animal.mesh.position.clone().add(new THREE.Vector3(-0.2, 0.2, -0.2)));
                }
            }
        }

        function handleZombieDeathDrops(z) {
            if (z.type === 'creeper') {
                const count = Math.floor(Math.random() * 3);
                for (let j = 0; j < count; j++) {
                    const dropPos = z.mesh.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.2, (Math.random() - 0.5) * 0.4));
                    spawnDroppedFood('gunpowder', dropPos);
                }
            }
        }

        function getFoodTypeForAnimal(type) {
            if (type === 'pig') return 'porkchop';
            if (type === 'cow') return 'beef';
            if (type === 'sheep') return 'mutton';
            if (type === 'chicken') return 'chicken';
            if (type === 'turtle') return 'raw_fish';
            if (type === 'horse') return 'leather';
            return 'porkchop';
        }

        function spawnDroppedFood(type, pos, scale = 1.0, durability = null) {
            const foodMesh = createDroppedFoodMesh(type);
            if (scale !== 1.0) {
                foodMesh.scale.multiplyScalar(scale);
            }
            foodMesh.position.copy(pos);
            foodMesh.position.y += 0.3;
            scene.add(foodMesh);

            droppedFoods.push({
                type: type,
                mesh: foodMesh,
                pos: foodMesh.position,
                spawnTime: Date.now(),
                rotY: Math.random() * Math.PI,
                durability: durability
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
                const vcx = vd.villageCenterX !== undefined ? vd.villageCenterX : vd.x;
                const vcz = vd.villageCenterZ !== undefined ? vd.villageCenterZ : vd.z;
                const inC = vd.inCave || false;
                const vy = getTerrainHeight(vd.x, vd.z, inC);
                const mesh = createVillagerMesh();
                mesh.position.set(vd.x, vy, vd.z);
                scene.add(mesh);
                
                villagers.push({
                    id: vd.id,
                    mesh: mesh,
                    x: vd.x,
                    y: vy,
                    z: vd.z,
                    villageCenterX: vcx,
                    villageCenterZ: vcz,
                    inCave: inC,
                    targetX: vcx + (Math.random() - 0.5) * 25,
                    targetZ: vcz + (Math.random() - 0.5) * 25,
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
            
            for (let i = bees.length - 1; i >= 0; i--) {
                const b = bees[i];
                b.mesh.visible = !playerInCave;
                if (b.hp <= 0) {
                    if (b.deathTime === undefined) b.deathTime = 0;
                    b.deathTime += delta;
                    if (b.mesh.position.y > getTerrainHeight(b.mesh.position.x, b.mesh.position.z)) {
                        b.mesh.position.y -= 5 * delta;
                        b.mesh.rotation.x = Math.PI; // Upside down
                    }
                    if (b.deathTime >= 1.5) {
                        scene.remove(b.mesh);
                        bees.splice(i, 1);
                    }
                    continue;
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
                        continue;
                    }
                    targetPos.set(tx, ty, tz);
                    speed = 6.0;
                    
                    if (b.pos.distanceTo(targetPos) > 0.01) {
                        b.mesh.lookAt(targetPos);
                    }
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
                            
                            if (b.pos.distanceTo(targetPos) > 0.01) {
                                b.mesh.lookAt(targetPos);
                            }
                            const dir = new THREE.Vector3().subVectors(targetPos, b.pos).normalize();
                            b.pos.addScaledVector(dir, 2.5 * delta);
                            b.mesh.position.copy(b.pos);
                        }
                    } else if (b.state === 'collect') {
                        if (!b.targetFlower) {
                            b.state = 'wander';
                        } else {
                            targetPos.copy(b.targetFlower);
                            if (b.pos.distanceTo(targetPos) > 0.01) {
                                b.mesh.lookAt(targetPos);
                            }
                            
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
                        if (b.pos.distanceTo(targetPos) > 0.01) {
                            b.mesh.lookAt(targetPos);
                        }
                        
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
            }
            
            // Handle beehive respawns
            beehives.forEach(h => {
                const count = bees.filter(b => b.hp > 0 && b.home.distanceTo(new THREE.Vector3(h.x, h.y, h.z)) < 0.1).length;
                if (count < 5) {
                    if (h.respawnTimer === undefined) h.respawnTimer = 0;
                    h.respawnTimer += delta;
                    if (h.respawnTimer >= 20.0) {
                        spawnSingleBeeForHive(h.x, h.y, h.z);
                        h.respawnTimer = 0;
                    }
                } else {
                    h.respawnTimer = 0;
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
                    v.mesh.position.y = getTerrainHeight(v.mesh.position.x, v.mesh.position.z, v.inCave) + 0.15 * (1 - slumpProgress);
                    return;
                }
                
                // Hide villagers if they are in a different dimension than the player
                v.mesh.visible = (isDimensionCave(v.inCave) === isDimensionCave(playerInCave));

                // Apply knockback velocities
                if (v.kx || v.kz) {
                    v.mesh.position.x += v.kx * delta;
                    v.mesh.position.z += v.kz * delta;
                    v.mesh.position.y = getTerrainHeight(v.mesh.position.x, v.mesh.position.z, v.inCave);
                    
                    v.kx -= v.kx * 4.5 * delta;
                    v.kz -= v.kz * 4.5 * delta;
                    if (Math.abs(v.kx) < 0.05) v.kx = 0;
                    if (Math.abs(v.kz) < 0.05) v.kz = 0;
                }
                
                const vcx = v.villageCenterX !== undefined ? v.villageCenterX : -78;
                const vcz = v.villageCenterZ !== undefined ? v.villageCenterZ : -78;
                let distToCenter = Math.sqrt(Math.pow(v.mesh.position.x - vcx, 2) + Math.pow(v.mesh.position.z - vcz, 2));
                
                // Keep villagers strictly inside their village (45m radius)
                if (distToCenter > 45) {
                    const angle = Math.atan2(v.mesh.position.z - vcz, v.mesh.position.x - vcx);
                    v.mesh.position.x = vcx + Math.cos(angle) * 45;
                    v.mesh.position.z = vcz + Math.sin(angle) * 45;
                    v.mesh.position.y = getTerrainHeight(v.mesh.position.x, v.mesh.position.z, v.inCave);
                    distToCenter = 45;
                    
                    if (v.targetX !== vcx) {
                        v.targetX = vcx;
                        v.targetZ = vcz;
                        v.waitTime = 0;
                    }
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
                    v.targetX = vcx + (Math.random() - 0.5) * 35;
                    v.targetZ = vcz + (Math.random() - 0.5) * 35;
                } else {
                    const vx = (dx / dist) * v.speed;
                    const vz = (dz / dist) * v.speed;
                    v.mesh.position.x += vx * delta;
                    v.mesh.position.z += vz * delta;
                    v.mesh.position.y = getTerrainHeight(v.mesh.position.x, v.mesh.position.z, v.inCave);
                    
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

        function spawnAnimalsInZone(type, count, cx, cz, r, health) {
            for (let c = 0; c < count; c++) {
                let ax = 0, az = 0, ay = 0;
                let foundSpot = false;
                for (let attempts = 0; attempts < 30; attempts++) {
                    ax = cx + (Math.random() - 0.5) * r * 2;
                    az = cz + (Math.random() - 0.5) * r * 2;
                    ay = getTerrainHeight(ax, az);
                    
                    if (ay < -10 || ay <= WATER_Y) {
                        continue;
                    }
                    
                    // Check distance to all existing animals
                    let tooClose = false;
                    for (let i = 0; i < animals.length; i++) {
                        const other = animals[i];
                        const dx = other.x - ax;
                        const dz = other.z - az;
                        if (dx * dx + dz * dz < 49.0) { // 7 meters minimum distance
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose) {
                        foundSpot = true;
                        break;
                    }
                }
                
                if (ay < -10 || ay <= WATER_Y) continue;
                
                let mesh;
                if (type === 'pig') mesh = createPigMesh();
                else if (type === 'cow') mesh = createCowMesh();
                else if (type === 'sheep') mesh = createSheepMesh();
                else if (type === 'chicken') mesh = createChickenMesh();
                else if (type === 'turtle') mesh = createTurtleMesh();
                else if (type === 'horse') mesh = createHorseMesh();
                
                if (!mesh) continue;
                mesh.position.set(ax, ay, az);
                scene.add(mesh);
                
                const extraFields = {};
                if (type === 'horse') {
                    extraFields.hasSaddle = false;
                    extraFields.isRidden = false;
                    extraFields.rider = null;
                }
                
                animals.push(Object.assign({
                    id: Math.random().toString(36).substr(2, 6),
                    type: type,
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
                    health: health,
                    maxHealth: health,
                    isDead: false,
                    deathTime: 0,
                    kx: 0,
                    kz: 0
                }, extraFields));
            }
        }

        function spawnInitialAnimals() {
            clearAnimals();
            
            // 1. Plains / Spawn Biome (more animals, spread out!)
            spawnAnimalsInZone('pig', 10, 70, 40, 50, 25);
            spawnAnimalsInZone('cow', 10, 90, -20, 50, 40);
            spawnAnimalsInZone('sheep', 10, 80, 70, 50, 20);
            spawnAnimalsInZone('chicken', 12, 50, -10, 40, 15);
            spawnAnimalsInZone('horse', 2, 70, 40, 50, 50); // Pretty rare horse spawn in plains

            // 2. Forest Biome
            spawnAnimalsInZone('pig', 6, -50, 50, 40, 25);
            spawnAnimalsInZone('cow', 6, -50, 50, 40, 40);
            spawnAnimalsInZone('sheep', 6, -50, 50, 40, 20);
            spawnAnimalsInZone('chicken', 6, -50, 50, 40, 15);
            spawnAnimalsInZone('horse', 1, -50, 50, 40, 50); // 1 rare horse in forest

            // 3. Cherry Biome (should have animals!)
            spawnAnimalsInZone('pig', 5, -150, -350, 80, 25);
            spawnAnimalsInZone('sheep', 8, -150, -350, 80, 20);
            spawnAnimalsInZone('chicken', 6, -150, -350, 80, 15);

            // 4. Savanna Biome (should have some animals!)
            spawnAnimalsInZone('cow', 6, -350, 250, 80, 40);
            spawnAnimalsInZone('sheep', 6, -350, 250, 80, 20);
            spawnAnimalsInZone('pig', 4, -350, 250, 80, 25);
            spawnAnimalsInZone('horse', 1, -350, 250, 80, 50); // 1 rare horse in savanna
            
            // Desert: no animals (we do not spawn any in (350, -350) zone)

            // 5. Dedicated Tropical Reef turtle spawning (spawn in reef area)
            for (let c = 0; c < 12; c++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 70;
                const ax = 0 + Math.cos(angle) * dist;
                const az = -480 + Math.sin(angle) * dist;
                const ay = getTerrainHeight(ax, az);
                
                if (ay <= WATER_Y) {
                    const swimY = ay + (WATER_Y - ay) * 0.25;
                    const mesh = createTurtleMesh();
                    mesh.position.set(ax, swimY, az);
                    scene.add(mesh);
                    
                    animals.push({
                        id: Math.random().toString(36).substr(2, 6),
                        type: 'turtle',
                        mesh: mesh,
                        x: ax,
                        y: swimY,
                        z: az,
                        spawnX: ax,
                        spawnZ: az,
                        targetX: ax + (Math.random() - 0.5) * 20,
                        targetZ: az + (Math.random() - 0.5) * 20,
                        waitTime: Math.random() * 2.0,
                        speed: 0.5 + Math.random() * 0.4, // Turtles swim slower and more gracefully!
                        health: 30,
                        maxHealth: 30,
                        isDead: false,
                        deathTime: 0,
                        kx: 0,
                        kz: 0
                    });
                }
            }
        }

        function updateAnimals(delta) {
            const now = Date.now();
            for (let i = animals.length - 1; i >= 0; i--) {
                const a = animals[i];
                a.mesh.visible = !playerInCave;
                if (a.isDead) {
                    if (a.rider === 'local') {
                        ridingHorse = false;
                        activeHorse = null;
                        a.rider = null;
                        addChatMessage("Your horse was killed!", "system");
                    }
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
                
                if (a.rider === 'local') {
                    // Update camera position to snap to horse
                    camera.position.set(a.mesh.position.x, a.mesh.position.y + 1.8, a.mesh.position.z);
                    
                    // Steer direction based on camera and WASD inputs
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
                            a.mesh.rotation.y = Math.atan2(moveVector.x, moveVector.z);
                            
                            // Horse movement speed (horses are fast!)
                            const horseSpeed = 10.0;
                            a.mesh.position.x += moveVector.x * horseSpeed * delta;
                            a.mesh.position.z += moveVector.z * horseSpeed * delta;
                        }
                    }
                    
                    // Snap Y to terrain height
                    a.mesh.position.y = getTerrainHeight(a.mesh.position.x, a.mesh.position.z);
                    
                    a.x = a.mesh.position.x;
                    a.y = a.mesh.position.y;
                    a.z = a.mesh.position.z;
                    
                    // Update legs animation
                    const walkSpeed = 15;
                    const legAngle = isMoving ? Math.sin(now * 0.01 * walkSpeed) * 0.6 : 0;
                    if (a.mesh.userData.legFL) a.mesh.userData.legFL.rotation.x = legAngle;
                    if (a.mesh.userData.legFR) a.mesh.userData.legFR.rotation.x = -legAngle;
                    if (a.mesh.userData.legBL) a.mesh.userData.legBL.rotation.x = -legAngle;
                    if (a.mesh.userData.legBR) a.mesh.userData.legBR.rotation.x = legAngle;
                    
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
                    
                    // Choose target (rejecting desert center 350, -350 with radius 180)
                    let attempts = 0;
                    let tx = a.mesh.position.x;
                    let tz = a.mesh.position.z;
                    do {
                        tx = a.mesh.position.x + (Math.random() - 0.5) * 30;
                        tz = a.mesh.position.z + (Math.random() - 0.5) * 30;
                        attempts++;
                    } while (Math.sqrt((tx - 350) ** 2 + (tz - (-350)) ** 2) < 180 && attempts < 10);
                    
                    a.targetX = tx;
                    a.targetZ = tz;
                    
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

        function addFoodToInventory(type, durability = null) {
            obtainedItems.add(type);
            const tool = isTool(type);
            
            if (!tool) {
                for (let i = 0; i < 9; i++) {
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
            }
            
            for (let i = 0; i < 9; i++) {
                if (hotbarItems[i] === null) {
                    hotbarItems[i] = type;
                    hotbarCounts[i] = 1;
                    if (tool) {
                        hotbarDurability[i] = durability !== null ? durability : getMaxDurability(type);
                    }
                    return true;
                }
            }
            
            for (let i = 0; i < 27; i++) {
                if (inventoryItems[i] === null) {
                    inventoryItems[i] = type;
                    inventoryCounts[i] = 1;
                    if (tool) {
                        inventoryDurability[i] = durability !== null ? durability : getMaxDurability(type);
                    }
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
                
                // Despawn after 5 minutes (300000 ms)
                if (now - df.spawnTime > 300000) {
                    scene.remove(df.mesh);
                    droppedFoods.splice(i, 1);
                    continue;
                }

                const dist = playerPos.distanceTo(df.pos);
                if (myHealth > 0 && dist < 1.8) {
                    const success = addFoodToInventory(df.type, df.durability);
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

        function spawnEatingParticles(foodType) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            
            const mouthPos = new THREE.Vector3();
            mouthPos.copy(camera.position);
            mouthPos.addScaledVector(dir, 0.4);
            mouthPos.y -= 0.15;
            
            let color = 0xff9ebb;
            if (foodType === 'porkchop') color = 0xff9ebb;
            else if (foodType === 'beef') color = 0x8b2500;
            else if (foodType === 'mutton') color = 0xff6a6a;
            else if (foodType === 'chicken') color = 0xcd853f;
            else if (foodType === 'raw_fish') color = 0x4682b4;
            
            const count = 5 + Math.floor(Math.random() * 4);
            for (let i = 0; i < count; i++) {
                const size = 0.015 + Math.random() * 0.02;
                const geo = new THREE.BoxGeometry(size, size, size);
                const mat = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.95
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.copy(mouthPos);
                mesh.position.x += (Math.random() - 0.5) * 0.1;
                mesh.position.y += (Math.random() - 0.5) * 0.1;
                mesh.position.z += (Math.random() - 0.5) * 0.1;
                
                scene.add(mesh);
                
                const scatter = 0.25;
                eatingParticles.push({
                    mesh: mesh,
                    mat: mat,
                    velX: dir.x * 0.2 + (Math.random() - 0.5) * scatter,
                    velY: dir.y * 0.2 + (Math.random() - 0.5) * scatter - 0.1,
                    velZ: dir.z * 0.2 + (Math.random() - 0.5) * scatter,
                    life: 0.4 + Math.random() * 0.3
                });
            }
        }

        function updateEatingParticles(delta) {
            for (let i = eatingParticles.length - 1; i >= 0; i--) {
                const p = eatingParticles[i];
                p.life -= delta;
                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    eatingParticles.splice(i, 1);
                } else {
                    p.velY -= 3.0 * delta;
                    p.mesh.position.x += p.velX * delta;
                    p.mesh.position.y += p.velY * delta;
                    p.mesh.position.z += p.velZ * delta;
                    p.mat.opacity = Math.max(0, p.life / 0.7);
                }
            }
        }

        let localPlayerWasBurning = false;
        let lastHealthSyncTime = 0;
        function updatePlayerBurning(delta) {
            const elFireVignette = document.getElementById('fire-vignette');
            
            // Check collision with placed fire blocks
            placedObjects.forEach(obj => {
                if (obj.type === 'fire') {
                    const dx = camera.position.x - obj.pos.x;
                    const dz = camera.position.z - obj.pos.z;
                    const dy = (camera.position.y - 1.0) - obj.pos.y;
                    const distH = Math.sqrt(dx * dx + dz * dz);
                    if (distH < 0.65 && Math.abs(dy) < 0.9) {
                        myBurnTime = 10.0;
                    }
                }
            });
            
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

        AudioSynth.playThunder = function(pos) {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            
            // Multiple random thuds and rumbles
            const count = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                const delay = i * (0.15 + Math.random() * 0.15);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sawtooth';
                const startFreq = 60 + Math.random() * 30;
                osc.frequency.setValueAtTime(startFreq, now + delay);
                osc.frequency.linearRampToValueAtTime(10, now + delay + 0.6 + Math.random() * 0.6);
                
                const vol = 0.5 + Math.random() * 0.5;
                gain.gain.setValueAtTime(vol * 0.6, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.6 + Math.random() * 0.6);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now + delay);
                osc.stop(now + delay + 1.2);
            }
            
            // Add a lowpass filtered white noise burst for the thunder crash
            const bufferSize = this.ctx.sampleRate * 1.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 150; // low rumble
            
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.7, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 1.4);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            
            noise.start(now);
            noise.stop(now + 1.5);
        };

        function playRainSoundLoop() {
            AudioSynth.init();
            if (!AudioSynth.ctx) return;
            if (rainSoundSource) return;
            
            const bufferSize = AudioSynth.ctx.sampleRate * 2.0; // 2 seconds of white noise
            const buffer = AudioSynth.ctx.createBuffer(1, bufferSize, AudioSynth.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            rainSoundSource = AudioSynth.ctx.createBufferSource();
            rainSoundSource.buffer = buffer;
            rainSoundSource.loop = true;
            
            const filter = AudioSynth.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            filter.Q.value = 0.5;
            
            rainSoundGain = AudioSynth.ctx.createGain();
            rainSoundGain.gain.setValueAtTime(0.04, AudioSynth.ctx.currentTime);
            
            rainSoundSource.connect(filter);
            filter.connect(rainSoundGain);
            rainSoundGain.connect(AudioSynth.ctx.destination);
            
            rainSoundSource.start();
        }

        function stopRainSoundLoop() {
            if (rainSoundSource) {
                try {
                    rainSoundSource.stop();
                } catch(e) {}
                rainSoundSource = null;
            }
            rainSoundGain = null;
        }

        function setWeather(weather) {
            currentWeather = weather;
            
            if (weather === 'rain' || weather === 'thunder') {
                playRainSoundLoop();
                if (!rainParticles) {
                    const particleCount = 2000;
                    const geom = new THREE.BufferGeometry();
                    const positions = new Float32Array(particleCount * 3);
                    const velocities = new Float32Array(particleCount);
                    
                    for (let i = 0; i < particleCount; i++) {
                        positions[i * 3] = (Math.random() - 0.5) * 50;     // X
                        positions[i * 3 + 1] = Math.random() * 35 - 10;    // Y
                        positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // Z
                        velocities[i] = 25 + Math.random() * 15;
                    }
                    
                    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    
                    const mat = new THREE.PointsMaterial({
                        color: 0x88ccff,
                        size: 0.15,
                        transparent: true,
                        opacity: 0.6,
                        depthWrite: false
                    });
                    
                    rainParticles = new THREE.Points(geom, mat);
                    rainParticles.userData = { velocities: velocities };
                    scene.add(rainParticles);
                } else {
                    rainParticles.visible = true;
                }
            } else {
                stopRainSoundLoop();
                if (rainParticles) {
                    rainParticles.visible = false;
                }
            }
        }

        function createChestMesh() {
            const group = new THREE.Group();
            
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
            const borderMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
            const latchMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
            
            // Chest body (BoxGeometry: width, height, depth)
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), woodMat);
            base.position.y = 0.25;
            group.add(base);
            
            // Chest lid: 0.8 width, 0.2 height, 0.8 depth.
            const lid = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), woodMat);
            lid.position.y = 0.6;
            lid.name = "lid";
            group.add(lid);
            
            // Corner details (borders) to make it look rustic/minecrafty
            const borderTop = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.05, 0.84), borderMat);
            borderTop.position.y = 0.5;
            group.add(borderTop);
            
            // Front Latch
            const latch = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.08), latchMat);
            latch.position.set(0, 0.5, 0.41);
            latch.name = "latch";
            group.add(latch);
            
            return group;
        }

        function getChestAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestChest = null;
            let bestDist = Infinity;
            
            placedObjects.forEach(obj => {
                if (obj.type !== 'chest') return;
                
                const dx = obj.pos.x - myX;
                const dy = (obj.pos.y + 0.45) - myY;
                const dz = obj.pos.z - myZ;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (dist < 4.0) {
                    const toObj = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toObj);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestChest = obj;
                        }
                    }
                }
            });
            return bestChest;
        }

        function getBedAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestBed = null;
            let bestDist = Infinity;
            
            placedObjects.forEach(obj => {
                if (obj.type !== 'bed') return;
                
                const dx = obj.pos.x - myX;
                const dy = (obj.pos.y + 0.225) - myY;
                const dz = obj.pos.z - myZ;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (dist < 4.0) {
                    const toObj = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toObj);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestBed = obj;
                        }
                    }
                }
            });
            return bestBed;
        }

        function getHorseAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestHorse = null;
            let bestDist = Infinity;
            
            animals.forEach(a => {
                if (a.type !== 'horse' || a.isDead) return;
                
                const dx = a.mesh.position.x - myX;
                const dy = (a.mesh.position.y + 0.5) - myY;
                const dz = a.mesh.position.z - myZ;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (dist < 4.0) {
                    const toObj = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toObj);
                    if (dot > 0.8) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestHorse = a;
                        }
                    }
                }
            });
            return bestHorse;
        }

        function trySleepInBed() {
            const totalCycleMs = CYCLE_DURATION * 1000;
            const cycleTime = ((Date.now() + timeOffset) % totalCycleMs) / 1000;
            
            const isNight = (cycleTime >= 540 || cycleTime < 30);
            
            if (!isNight) {
                addChatMessage("You can only sleep at night!", "system");
                return;
            }
            
            const fadeDiv = document.createElement('div');
            fadeDiv.style.position = 'fixed';
            fadeDiv.style.left = '0';
            fadeDiv.style.top = '0';
            fadeDiv.style.width = '100%';
            fadeDiv.style.height = '100%';
            fadeDiv.style.background = 'black';
            fadeDiv.style.opacity = '0';
            fadeDiv.style.transition = 'opacity 1s ease-in-out';
            fadeDiv.style.zIndex = '9999';
            fadeDiv.style.pointerEvents = 'none';
            document.body.appendChild(fadeDiv);
            
            setTimeout(() => {
                fadeDiv.style.opacity = '1';
            }, 50);
            
            setTimeout(() => {
                timeOffset = (30000 - (Date.now() % totalCycleMs) + totalCycleMs) % totalCycleMs;
                addChatMessage("You fell asleep...", "system");
                
                myHealth = Math.min(100, myHealth + 25);
                updateHud();
            }, 1050);
            
            setTimeout(() => {
                fadeDiv.style.opacity = '0';
            }, 2050);
            
            setTimeout(() => {
                if (document.body.contains(fadeDiv)) {
                    document.body.removeChild(fadeDiv);
                }
                addChatMessage("Good morning!", "system");
            }, 3100);
        }

        function createFurnaceMesh() {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
            
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), bodyMat);
            base.position.y = 0.45;
            group.add(base);

            // Cobblestone 3D tiles details on top, left, right, back
            const tileMatLight = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 });
            const tileMatDark = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });

            const tileDetails = [
                // Top face (y = 0.9)
                { geom: [0.3, 0.01, 0.2], pos: [0.15, 0.905, 0.15], mat: tileMatLight },
                { geom: [0.2, 0.01, 0.3], pos: [-0.2, 0.905, -0.15], mat: tileMatDark },
                { geom: [0.25, 0.01, 0.25], pos: [0.2, 0.905, -0.2], mat: tileMatLight },
                { geom: [0.15, 0.01, 0.15], pos: [-0.25, 0.905, 0.2], mat: tileMatDark },
                
                // Left face (x = -0.45)
                { geom: [0.01, 0.2, 0.3], pos: [-0.455, 0.6, 0.1], mat: tileMatLight },
                { geom: [0.01, 0.3, 0.2], pos: [-0.455, 0.25, -0.2], mat: tileMatDark },
                { geom: [0.01, 0.25, 0.25], pos: [-0.455, 0.7, -0.15], mat: tileMatLight },
                { geom: [0.01, 0.15, 0.15], pos: [-0.455, 0.3, 0.25], mat: tileMatDark },

                // Right face (x = 0.45)
                { geom: [0.01, 0.2, 0.3], pos: [0.455, 0.6, -0.1], mat: tileMatLight },
                { geom: [0.01, 0.3, 0.2], pos: [0.455, 0.25, 0.2], mat: tileMatDark },
                { geom: [0.01, 0.25, 0.25], pos: [0.455, 0.7, 0.15], mat: tileMatLight },
                { geom: [0.01, 0.15, 0.15], pos: [0.455, 0.3, -0.25], mat: tileMatDark },

                // Back face (z = -0.45)
                { geom: [0.3, 0.2, 0.01], pos: [0.1, 0.6, -0.455], mat: tileMatLight },
                { geom: [0.2, 0.3, 0.01], pos: [-0.2, 0.25, -0.455], mat: tileMatDark },
                { geom: [0.25, 0.25, 0.01], pos: [0.15, 0.25, -0.455], mat: tileMatLight },
                { geom: [0.15, 0.15, 0.01], pos: [-0.25, 0.7, -0.455], mat: tileMatDark }
            ];

            tileDetails.forEach(tile => {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(...tile.geom), tile.mat);
                mesh.position.set(...tile.pos);
                group.add(mesh);
            });

            // Front plate (z = 0.45)
            const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.03), bodyMat);
            frontPlate.position.set(0, 0.45, 0.455);
            group.add(frontPlate);

            // Front details (cobblestone border elements on front plate)
            const frontDetails = [
                { geom: [0.2, 0.1, 0.01], pos: [-0.3, 0.8, 0.47], mat: tileMatLight },
                { geom: [0.2, 0.1, 0.01], pos: [0.3, 0.8, 0.47], mat: tileMatDark },
                { geom: [0.1, 0.3, 0.01], pos: [-0.4, 0.45, 0.47], mat: tileMatDark },
                { geom: [0.1, 0.3, 0.01], pos: [0.4, 0.45, 0.47], mat: tileMatLight },
                { geom: [0.2, 0.1, 0.01], pos: [-0.3, 0.1, 0.47], mat: tileMatLight },
                { geom: [0.2, 0.1, 0.01], pos: [0.3, 0.1, 0.47], mat: tileMatDark }
            ];

            frontDetails.forEach(tile => {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(...tile.geom), tile.mat);
                mesh.position.set(...tile.pos);
                group.add(mesh);
            });

            // Top mouth slot (dark unlit arch opening)
            const mouthMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 });
            const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.02), mouthMat);
            mouth.position.set(0, 0.62, 0.47);
            group.add(mouth);

            // Bottom burner slot recess (dark backdrop)
            const burnerBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 0.02), mouthMat);
            burnerBack.position.set(0, 0.26, 0.47);
            group.add(burnerBack);

            // Fire indicator (burningIndicator)
            const fireIndicatorMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x000000, roughness: 0.5 });
            const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.015), fireIndicatorMat);
            indicator.position.set(0, 0.26, 0.475);
            indicator.name = 'burningIndicator';

            // Orange flame layer (hidden initially)
            const orangeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, roughness: 0.5 });
            const orangeFlame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.005), orangeMat);
            orangeFlame.position.set(0, -0.01, 0.005);
            orangeFlame.visible = false;
            indicator.add(orangeFlame);

            // Yellow flame layer (hidden initially)
            const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, roughness: 0.5 });
            const yellowFlame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.005), yellowMat);
            yellowFlame.position.set(0, -0.03, 0.01);
            yellowFlame.visible = false;
            indicator.add(yellowFlame);

            group.add(indicator);
            
            return group;
        }

        function getCampfireAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestCampfire = null;
            let bestDist = Infinity;
            
            placedObjects.forEach(obj => {
                if (obj.type !== 'campfire' && obj.type !== 'unlit_campfire') return;
                
                const dx = obj.pos.x - myX;
                const dy = (obj.pos.y + 0.15) - myY;
                const dz = obj.pos.z - myZ;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (dist < 4.0) {
                    const toObj = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toObj);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestCampfire = obj;
                        }
                    }
                }
            });
            return bestCampfire;
        }

        function interactWithCampfire(campfire) {
            const heldType = hotbarItems[selectedHotbarIndex];
            
            if (campfire.type === 'unlit_campfire') {
                if (heldType === 'flint_and_steel') {
                    campfire.type = 'campfire';
                    campfire.burnTimeLeft = 60.0;
                    addCampfireFireMesh(campfire);
                    AudioSynth.playHit(campfire.pos);
                    addChatMessage("Campfire lit! Keep it fed with logs, planks, sticks, coal, or charcoal.", "system");
                    useToolInHand();
                    saveWorld(false);
                } else {
                    addChatMessage("This campfire is unlit. Use Flint and Steel to light it!", "system");
                }
            } else if (campfire.type === 'campfire') {
                if (heldType && ['log', 'planks', 'sticks', 'coal', 'charcoal'].includes(heldType)) {
                    let feedAmount = 0;
                    if (heldType === 'coal' || heldType === 'charcoal') feedAmount = 60.0;
                    else if (heldType === 'log') feedAmount = 15.0;
                    else if (heldType === 'planks') feedAmount = 10.0;
                    else if (heldType === 'sticks') feedAmount = 3.0;
                    
                    if (feedAmount > 0) {
                        if (typeof campfire.burnTimeLeft === 'undefined') {
                            campfire.burnTimeLeft = 60.0;
                        }
                        campfire.burnTimeLeft = Math.min(120.0, campfire.burnTimeLeft + feedAmount);
                        
                        hotbarCounts[selectedHotbarIndex]--;
                        if (hotbarCounts[selectedHotbarIndex] <= 0) {
                            hotbarItems[selectedHotbarIndex] = null;
                            hotbarCounts[selectedHotbarIndex] = 0;
                        }
                        updateHotbarUI();
                        updateInventoryUI();
                        
                        AudioSynth.playHit(campfire.pos);
                        addChatMessage(`Fed campfire! Burn time left: ${Math.round(campfire.burnTimeLeft)}s (max 120s)`, "system");
                        saveWorld(false);
                    }
                } else {
                    const timeRemaining = Math.round(campfire.burnTimeLeft || 0);
                    addChatMessage(`Campfire is burning (${timeRemaining}s remaining). Feed it logs, planks, sticks, coal, or charcoal!`, "system");
                }
            }
        }

        function getFurnaceAimTarget() {
            const myX = camera.position.x;
            const myY = camera.position.y;
            const myZ = camera.position.z;
            const lookDir = new THREE.Vector3();
            camera.getWorldDirection(lookDir);
            
            let bestFurnace = null;
            let bestDist = Infinity;
            
            placedObjects.forEach(obj => {
                if (obj.type !== 'furnace') return;
                
                const ox = obj.pos.x;
                const oy = obj.pos.y + 0.45;
                const oz = obj.pos.z;
                
                const dx = ox - myX;
                const dy = oy - myY;
                const dz = oz - myZ;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < 6.0) {
                    const toFurnace = new THREE.Vector3(dx, dy, dz).normalize();
                    const dot = lookDir.dot(toFurnace);
                    if (dot > 0.85) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestFurnace = obj;
                        }
                    }
                }
            });
            return bestFurnace;
        }

        function isTool(type) {
            if (!type) return false;
            return type.endsWith('_axe') || type.endsWith('_pickaxe') || type.endsWith('_sword') || type.endsWith('_shovel') || type === 'bow' || type === 'flint_and_steel';
        }

        function getMaxDurability(type) {
            if (!type) return 100;
            if (type.startsWith('wooden_')) return 60;
            if (type.startsWith('stone_')) return 130;
            if (type.startsWith('copper_')) return 130;
            if (type.startsWith('iron_')) return 250;
            if (type === 'bow') return 380;
            if (type === 'flint_and_steel') return 200;
            return 100;
        }

        function getDurabilityBarHTML(item, durability) {
            if (item && isTool(item)) {
                const maxDur = getMaxDurability(item);
                const curDur = (durability !== null && durability !== undefined) ? durability : maxDur;
                const pct = Math.max(0, Math.min(100, (curDur / maxDur) * 100));
                
                let barColor = '#00ff00';
                if (pct < 25) {
                    barColor = '#ff3333';
                } else if (pct < 50) {
                    barColor = '#ffaa00';
                }
                
                return `
                    <div class="durability-bar" style="position: absolute; bottom: 2px; left: 4px; right: 4px; height: 3px; background: rgba(0,0,0,0.5); border-radius: 1px; overflow: hidden; pointer-events: none; z-index: 10;">
                        <div style="width: ${pct}%; height: 100%; background: ${barColor};"></div>
                    </div>
                `;
            }
            return '';
        }

        function initDurabilityArrays() {
            if (!inventoryDurability) {
                inventoryDurability = new Array(27).fill(null);
            }
            if (!hotbarDurability) {
                hotbarDurability = new Array(9).fill(null);
            }
            for (let i = 0; i < 27; i++) {
                if (inventoryItems[i] && isTool(inventoryItems[i]) && (inventoryDurability[i] === null || inventoryDurability[i] === undefined)) {
                    inventoryDurability[i] = getMaxDurability(inventoryItems[i]);
                }
            }
            for (let i = 0; i < 9; i++) {
                if (hotbarItems[i] && isTool(hotbarItems[i]) && (hotbarDurability[i] === null || hotbarDurability[i] === undefined)) {
                    hotbarDurability[i] = getMaxDurability(hotbarItems[i]);
                }
            }
        }

        function useToolInHand() {
            const item = hotbarItems[selectedHotbarIndex];
            if (isTool(item)) {
                if (hotbarDurability[selectedHotbarIndex] === null || hotbarDurability[selectedHotbarIndex] === undefined) {
                    hotbarDurability[selectedHotbarIndex] = getMaxDurability(item);
                }
                
                hotbarDurability[selectedHotbarIndex]--;
                
                if (hotbarDurability[selectedHotbarIndex] <= 0) {
                    hotbarItems[selectedHotbarIndex] = null;
                    hotbarCounts[selectedHotbarIndex] = 0;
                    hotbarDurability[selectedHotbarIndex] = null;
                    
                    AudioSynth.playBreak();
                    addChatMessage(`Your ${ITEM_NAMES[item] || item} broke!`, "system");
                    
                    activeWeapon = 'fists';
                    
                    updateWeaponUI();
                    updateHotbarUI();
                    updateInventoryUI();
                } else {
                    updateHotbarUI();
                }
            }
        }

        function isFuel(type) {
            return ['coal', 'charcoal', 'log', 'planks', 'sticks', 'door', 'ladder', 'wooden_stairs', 'wooden_pickaxe', 'wooden_axe', 'wooden_sword', 'wooden_shovel', 'coral'].includes(type);
        }

        function getFuelBurnTime(type) {
            if (type === 'coal' || type === 'charcoal') return 40;
            if (type === 'coral') return 12;
            if (type === 'log') return 10;
            if (type === 'planks') return 8;
            if (type === 'sticks') return 3;
            if (['door', 'ladder', 'wooden_stairs', 'wooden_pickaxe', 'wooden_axe', 'wooden_sword', 'wooden_shovel'].includes(type)) return 6;
            return 0;
        }

        function isSmeltable(type) {
            return ['log', 'raw_iron', 'raw_copper', 'limestone', 'porkchop', 'beef', 'mutton', 'chicken', 'raw_fish'].includes(type);
        }

        function getSmeltTime(type) {
            if (type === 'log') return 5;
            if (type === 'raw_iron' || type === 'raw_copper' || type === 'limestone') return 8;
            return 5;
        }

        function getSmeltOutput(type) {
            if (type === 'log') return 'charcoal';
            if (type === 'raw_iron') return 'iron_ingot';
            if (type === 'raw_copper') return 'copper_ingot';
            if (type === 'porkchop') return 'cooked_porkchop';
            if (type === 'beef') return 'cooked_beef';
            if (type === 'mutton') return 'cooked_mutton';
            if (type === 'chicken') return 'cooked_chicken';
            if (type === 'raw_fish') return 'cooked_fish';
            return null;
        }

        function updateFurnaces(delta) {
            placedObjects.forEach(obj => {
                if (obj.type !== 'furnace') return;
                
                if (!obj.furnaceState) {
                    obj.furnaceState = {
                        inputItem: null,
                        fuelItem: null,
                        outputItem: null,
                        fuelBurnTimeLeft: 0,
                        fuelMaxBurnTime: 0,
                        smeltProgress: 0,
                        pendingLimestoneOutput: null
                    };
                }
                
                const state = obj.furnaceState;
                
                if (state.fuelBurnTimeLeft > 0) {
                    state.fuelBurnTimeLeft -= delta;
                    if (state.fuelBurnTimeLeft < 0) state.fuelBurnTimeLeft = 0;
                }
                
                if (state.inputItem && state.inputItem.type === 'limestone') {
                    if (!state.pendingLimestoneOutput) {
                        const r = Math.random();
                        if (r < 0.34) {
                            state.pendingLimestoneOutput = 'flint';
                        } else if (r < 0.34 + 0.21) {
                            state.pendingLimestoneOutput = 'raw_iron';
                        } else {
                            state.pendingLimestoneOutput = 'nothing'; // slag
                        }
                    }
                } else {
                    state.pendingLimestoneOutput = null;
                }
                
                const canSmelt = state.inputItem && state.inputItem.count > 0 && isSmeltable(state.inputItem.type);
                let outputCompatible = true;
                if (canSmelt && state.outputItem) {
                    let expectedOutput = getSmeltOutput(state.inputItem.type);
                    if (state.inputItem.type === 'limestone') {
                        expectedOutput = state.pendingLimestoneOutput;
                    }
                    if (expectedOutput && expectedOutput !== 'nothing' && (state.outputItem.type !== expectedOutput || state.outputItem.count >= 64)) {
                        outputCompatible = false;
                    }
                }
                
                if (state.fuelBurnTimeLeft <= 0 && canSmelt && outputCompatible && state.fuelItem && state.fuelItem.count > 0) {
                    const burnTime = getFuelBurnTime(state.fuelItem.type);
                    if (burnTime > 0) {
                        state.fuelBurnTimeLeft = burnTime;
                        state.fuelMaxBurnTime = burnTime;
                        state.fuelItem.count--;
                        if (state.fuelItem.count <= 0) {
                            state.fuelItem = null;
                        }
                    }
                }
                
                if (state.fuelBurnTimeLeft > 0 && canSmelt && outputCompatible) {
                    const smeltTime = getSmeltTime(state.inputItem.type);
                    state.smeltProgress += delta / smeltTime;
                    
                    if (state.smeltProgress >= 1.0) {
                        state.smeltProgress = 0;
                        const inputType = state.inputItem.type;
                        let outputType = getSmeltOutput(inputType);
                        if (inputType === 'limestone') {
                            outputType = state.pendingLimestoneOutput;
                            state.pendingLimestoneOutput = null; // reset for next limestone piece
                        }
                        
                        state.inputItem.count--;
                        if (state.inputItem.count <= 0) {
                            state.inputItem = null;
                        }
                        
                        if (outputType && outputType !== 'nothing') {
                            if (!state.outputItem) {
                                state.outputItem = { type: outputType, count: 1 };
                            } else {
                                state.outputItem.count++;
                            }
                        }
                        AudioSynth.playHit(obj.pos);
                    }
                } else {
                    if (state.smeltProgress > 0) {
                        state.smeltProgress = Math.max(0, state.smeltProgress - delta * 0.2);
                    }
                }
                
                const indicator = obj.mesh.getObjectByName('burningIndicator');
                if (indicator) {
                    if (state.fuelBurnTimeLeft > 0) {
                        indicator.material.color.setHex(0xff3300); // base red-orange
                        indicator.material.emissive.setHex(0xff3300);
                        indicator.children.forEach(c => { c.visible = true; });
                    } else {
                        indicator.material.color.setHex(0x111111);
                        indicator.material.emissive.setHex(0x000000);
                        indicator.children.forEach(c => { c.visible = false; });
                    }
                }
            });
            
            if (furnaceUIOpen && activeFurnace) {
                updateFurnaceUI();
            }
        }

        function removeCampfireFireMesh(obj) {
            const existingFlames = obj.mesh.getObjectByName('campfireFlames');
            if (existingFlames) obj.mesh.remove(existingFlames);
            const existingLight = obj.mesh.getObjectByName('campfireLight');
            if (existingLight) obj.mesh.remove(existingLight);
        }

        function updateCampfires(delta) {
            placedObjects.forEach(obj => {
                if (obj.type === 'campfire' || obj.type === 'fire') {
                    if (obj.type === 'campfire') {
                        if (typeof obj.burnTimeLeft === 'undefined') {
                            obj.burnTimeLeft = 60.0;
                        }
                        obj.burnTimeLeft -= delta;
                    }
                    
                    const flames = obj.mesh.getObjectByName('campfireFlames');
                    if (flames && flames.userData && flames.userData.cubes) {
                        const cubes = flames.userData.cubes;
                        cubes.forEach(c => {
                            c.mesh.position.y += c.speed * delta;
                            
                            const time = Date.now() * 0.005;
                            c.mesh.position.x = c.offsetX + Math.sin(time + c.initialY) * 0.05;
                            c.mesh.position.z = c.offsetZ + Math.cos(time + c.initialY) * 0.05;
                            
                            const heightFraction = (c.mesh.position.y - 0.15) / 0.45;
                            const scale = Math.max(0.1, 1 - heightFraction);
                            c.mesh.scale.set(scale, scale, scale);
                            
                            if (c.mesh.position.y > 0.6) {
                                c.mesh.position.y = 0.15 + Math.random() * 0.1;
                                c.mesh.scale.set(1, 1, 1);
                            }
                        });
                    }
                    
                    const light = obj.mesh.getObjectByName('campfireLight');
                    if (light) {
                        light.intensity = 1.0 + Math.sin(Date.now() * 0.015) * 0.25;
                    }
                    
                    if (obj.type === 'campfire' && obj.burnTimeLeft <= 0) {
                        obj.burnTimeLeft = 0;
                        obj.type = 'unlit_campfire';
                        removeCampfireFireMesh(obj);
                        addChatMessage("A campfire burned out!", "system");
                        saveWorld(false);
                    }
                }
            });
        }

        function isDimensionCave(val) {
            return val === true || val === 'true';
        }

        function createCracksOverlay(w, h, d, hits) {
            const points = [];
            const numLines = hits * 5;
            
            const ew = w + 0.02;
            const eh = h + 0.02;
            const ed = d + 0.02;
            
            for (let i = 0; i < numLines; i++) {
                const face = Math.floor(Math.random() * 6);
                let x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;
                
                if (face === 0) {
                    x1 = (Math.random() - 0.5) * w;
                    z1 = (Math.random() - 0.5) * d;
                    x2 = x1 + (Math.random() - 0.5) * 0.25;
                    z2 = z1 + (Math.random() - 0.5) * 0.25;
                    y1 = y2 = eh / 2;
                } else if (face === 1) {
                    x1 = (Math.random() - 0.5) * w;
                    z1 = (Math.random() - 0.5) * d;
                    x2 = x1 + (Math.random() - 0.5) * 0.25;
                    z2 = z1 + (Math.random() - 0.5) * 0.25;
                    y1 = y2 = -eh / 2;
                } else if (face === 2) {
                    x1 = (Math.random() - 0.5) * w;
                    y1 = (Math.random() - 0.5) * h;
                    x2 = x1 + (Math.random() - 0.5) * 0.25;
                    y2 = y1 + (Math.random() - 0.5) * 0.25;
                    z1 = z2 = ed / 2;
                } else if (face === 3) {
                    x1 = (Math.random() - 0.5) * w;
                    y1 = (Math.random() - 0.5) * h;
                    x2 = x1 + (Math.random() - 0.5) * 0.25;
                    y2 = y1 + (Math.random() - 0.5) * 0.25;
                    z1 = z2 = -ed / 2;
                } else if (face === 4) {
                    y1 = (Math.random() - 0.5) * h;
                    z1 = (Math.random() - 0.5) * d;
                    x2 = ew / 2;
                    y2 = y1 + (Math.random() - 0.5) * 0.25;
                    z2 = z1 + (Math.random() - 0.5) * 0.25;
                    x1 = ew / 2;
                } else {
                    y1 = (Math.random() - 0.5) * h;
                    z1 = (Math.random() - 0.5) * d;
                    x2 = -ew / 2;
                    y2 = y1 + (Math.random() - 0.5) * 0.25;
                    z2 = z1 + (Math.random() - 0.5) * 0.25;
                    x1 = -ew / 2;
                }
                
                points.push(new THREE.Vector3(x1, y1, z1));
                points.push(new THREE.Vector3(x2, y2, z2));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xff3300,
                linewidth: 2,
                toneMapped: false
            });
            return new THREE.LineSegments(geometry, material);
        }

        function updatePlacedObjectCracks(obj) {
            if (!obj || !obj.mesh) return;
            
            const existingCracks = obj.mesh.getObjectByName('cracksOverlay');
            if (existingCracks) {
                obj.mesh.remove(existingCracks);
            }
            
            const hits = obj.hits || 0;
            if (hits <= 0) return;
            
            let w = 0.9, h = 0.9, d = 0.9;
            
            if (obj.type === 'crafting_bench') {
                w = 1.6; h = 1.0; d = 0.7;
            } else if (obj.type === 'door') {
                w = 0.8; h = 1.8; d = 0.1;
            } else if (obj.type === 'stone_slab') {
                w = 0.9; h = 0.45; d = 0.9;
            } else if (obj.type === 'bed') {
                w = 0.9; h = 0.45; d = 1.6;
            } else if (obj.type === 'chest') {
                w = 0.8; h = 0.8; d = 0.8;
            } else if (obj.type === 'furnace') {
                w = 0.9; h = 0.9; d = 0.9;
            } else if (obj.type === 'ladder') {
                w = 0.8; h = 0.9; d = 0.1;
            } else if (obj.type === 'wool') {
                w = 0.9; h = 0.9; d = 0.9;
            }
            
            const cracks = createCracksOverlay(w, h, d, hits);
            cracks.name = 'cracksOverlay';
            cracks.position.y = h / 2;
            
            obj.mesh.add(cracks);
        }

        function updateBlockCracksDecay(delta) {
            const now = Date.now();
            
            placedObjects.forEach(obj => {
                if (obj.hits > 0 && obj.lastHitTime && now - obj.lastHitTime > 5000) {
                    obj.hits = 0;
                    updatePlacedObjectCracks(obj);
                }
            });
            
            worldStones.forEach(stone => {
                if (stone.hits > 0 && stone.lastHitTime && now - stone.lastHitTime > 5000) {
                    stone.hits = 0;
                }
            });
            
            if (groundHits > 0 && lastGroundHitTime && now - lastGroundHitTime > 5000) {
                groundHits = 0;
            }
            if (groundShovelHits > 0 && lastGroundShovelHitTime && now - lastGroundShovelHitTime > 5000) {
                groundShovelHits = 0;
            }
            
            worldTrees.forEach(tree => {
                if (tree.chopClicks > 0 && tree.lastHitTime && now - tree.lastHitTime > 5000) {
                    tree.chopClicks = 0;
                }
            });
        }

        function updateContinuousMining(delta) {
            if (!isMouseDown) return;
            if (!isLocked || mapOpen || chatOpen || inventoryOpen || furnaceUIOpen || chestUIOpen) return;
            
            const item = hotbarItems[selectedHotbarIndex];
            const now = Date.now();
            
            if (now - lastWeaponSwingTime >= 400 && now - mouseDownStartTime > 200) {
                const aimedObj = getPlacedObjectAimTarget();
                const aimedStone = getStoneAimTarget();
                const aimedTree = getTreeAimTarget();
                const aimedCoral = getCoralAimTarget();
                
                let didAction = false;
                
                if (aimedObj) {
                    aimedObj.hits = (aimedObj.hits || 0) + 1;
                    aimedObj.lastHitTime = now;
                    AudioSynth.playHit(aimedObj.pos);
                    updatePlacedObjectCracks(aimedObj);
                    if (aimedObj.hits >= 3) {
                        minePlacedObject(aimedObj);
                    }
                    didAction = true;
                } else if (aimedCoral) {
                    aimedCoral.hits = (aimedCoral.hits || 0) + 1;
                    aimedCoral.lastHitTime = now;
                    AudioSynth.playHit(aimedCoral.mesh.position);
                    if (aimedCoral.hits >= 4) {
                        mineNaturalCoral(aimedCoral);
                    }
                    didAction = true;
                } else if (aimedStone) {
                    if (item === 'wooden_pickaxe' || item === 'stone_pickaxe' || item === 'copper_pickaxe' || item === 'iron_pickaxe') {
                        if ((aimedStone.type === 'iron_ore' || aimedStone.type === 'coal_ore') && item === 'wooden_pickaxe') {
                            const nowMsg = Date.now();
                            if (!aimedStone.lastWarningTime || nowMsg - aimedStone.lastWarningTime > 2000) {
                                addChatMessage("This ore requires a Stone Pickaxe or better!", "system");
                                aimedStone.lastWarningTime = nowMsg;
                            }
                            AudioSynth.playHit(aimedStone.group.position);
                        } else {
                            const increment = item === 'copper_pickaxe' ? 2 : 1;
                            aimedStone.hits = (aimedStone.hits || 0) + increment;
                            aimedStone.lastHitTime = now;
                            AudioSynth.playHit(aimedStone.group.position);
                            if (aimedStone.hits >= 10) {
                                mineNaturalStone(aimedStone);
                            }
                        }
                        didAction = true;
                    }
                } else if (aimedTree) {
                    if (item === 'wooden_axe' || item === 'stone_axe' || item === 'copper_axe' || item === 'iron_axe') {
                        if (aimedTree.isChopped) {
                            harvestLog(aimedTree);
                        } else {
                            const increment = item === 'copper_axe' ? 2 : 1;
                            aimedTree.chopClicks = (aimedTree.chopClicks || 0) + increment;
                            aimedTree.lastHitTime = now;
                            AudioSynth.playHit(aimedTree.group.position);
                            if (aimedTree.chopClicks >= 3) {
                                chopTreeDown(aimedTree);
                            }
                        }
                        didAction = true;
                    }
                } else {
                    const distToRocky = Math.sqrt(Math.pow(camera.position.x - 420, 2) + Math.pow(camera.position.z - 50, 2));
                    const distToDesert = Math.sqrt(Math.pow(camera.position.x - 350, 2) + Math.pow(camera.position.z + 350, 2));
                    const lookDir = new THREE.Vector3();
                    camera.getWorldDirection(lookDir);
                    
                    if (distToRocky < 90 && lookDir.y < -0.4) {
                        if (item === 'wooden_pickaxe' || item === 'stone_pickaxe' || item === 'copper_pickaxe' || item === 'iron_pickaxe') {
                            const increment = item === 'copper_pickaxe' ? 2 : 1;
                            groundHits = (groundHits || 0) + increment;
                            lastGroundHitTime = now;
                            AudioSynth.playHit(camera.position.clone().add(new THREE.Vector3(0, -1.5, 0)));
                            
                            if (groundHits >= 6) {
                                groundHits = 0;
                                const scale = 2.0;
                                spawnDroppedFood('stone', camera.position.clone().add(new THREE.Vector3(0, -1.0, 0)), scale);
                                addChatMessage("Mined rocky ground!", "system");
                                if (Math.random() < 0.50) {
                                    spawnDroppedFood('raw_iron', camera.position.clone().add(new THREE.Vector3(0.2, -1.0, 0.2)), scale);
                                    spawnDroppedFood('coal', camera.position.clone().add(new THREE.Vector3(-0.2, -1.0, -0.2)), scale);
                                    addChatMessage("You found raw coal and raw iron in the rocky ground!", "system");
                                }
                            }
                            didAction = true;
                        }
                    } else if (distToDesert < 180 && lookDir.y < -0.4) {
                        const hx = camera.position.x;
                        const hz = camera.position.z;
                        
                        // Helper to find existing depth
                        const prefix = `${hx.toFixed(1)},${hz.toFixed(1)},`;
                        let currentDepth = 0;
                        for (const key of minedDesertHoles) {
                            if (key.startsWith(prefix) || key === `${hx.toFixed(1)},${hz.toFixed(1)}`) {
                                const parts = key.split(',');
                                currentDepth = parts.length === 3 ? parseInt(parts[2]) : 1;
                                break;
                            }
                        }

                        if (currentDepth < 2) {
                            // Sand layer: requires shovel
                            if (item && (item === 'wooden_shovel' || item === 'stone_shovel' || item === 'copper_shovel' || item === 'iron_shovel')) {
                                const increment = item === 'copper_shovel' ? 2 : 1;
                                groundShovelHits = (groundShovelHits || 0) + increment;
                                lastGroundShovelHitTime = now;
                                AudioSynth.playHit(camera.position.clone().add(new THREE.Vector3(0, -1.5, 0)));
                                
                                if (groundShovelHits >= 3) {
                                    groundShovelHits = 0;
                                    addMinedDesertHole(hx, hz);
                                    spawnDroppedFood('sand', camera.position.clone().add(new THREE.Vector3(0, -1.0, 0)), 2.0);
                                    addChatMessage("Mined sand from the desert!", "system");
                                    updateTerrainMeshNear(hx, hz);
                                    if (isHost) {
                                        saveWorld(false);
                                    }
                                }
                                didAction = true;
                            } else if (item && (item === 'wooden_pickaxe' || item === 'stone_pickaxe' || item === 'copper_pickaxe' || item === 'iron_pickaxe')) {
                                if (now - (lastGroundHitTime || 0) > 300) {
                                    lastGroundHitTime = now;
                                    AudioSynth.playHit(camera.position.clone().add(new THREE.Vector3(0, -1.5, 0)));
                                    addChatMessage("Use a shovel to dig sand!", "system");
                                }
                                didAction = true;
                            }
                        } else {
                            // Stone layer: requires pickaxe
                            if (item && (item === 'wooden_pickaxe' || item === 'stone_pickaxe' || item === 'copper_pickaxe' || item === 'iron_pickaxe')) {
                                const increment = item === 'copper_pickaxe' ? 2 : 1;
                                groundHits = (groundHits || 0) + increment;
                                lastGroundHitTime = now;
                                AudioSynth.playHit(camera.position.clone().add(new THREE.Vector3(0, -1.5, 0)));
                                
                                if (groundHits >= 6) {
                                    groundHits = 0;
                                    addMinedDesertHole(hx, hz);
                                    
                                    const spawnPos = camera.position.clone().add(new THREE.Vector3(0, -1.0, 0));
                                    const rand = Math.random();
                                    if (rand < 0.15) {
                                        spawnDroppedFood('raw_iron', spawnPos, 2.0);
                                        addChatMessage("You mined raw iron from the desert stone!", "system");
                                    } else if (rand < 0.30) {
                                        spawnDroppedFood('coal', spawnPos, 2.0);
                                        addChatMessage("You mined coal from the desert stone!", "system");
                                    } else if (rand < 0.45) {
                                        spawnDroppedFood('raw_copper', spawnPos, 2.0);
                                        addChatMessage("You mined raw copper from the desert stone!", "system");
                                    } else if (rand < 0.55) {
                                        spawnDroppedFood('limestone', spawnPos, 2.0);
                                        addChatMessage("You mined limestone from the desert stone!", "system");
                                    } else {
                                        spawnDroppedFood('stone', spawnPos, 2.0);
                                        addChatMessage("Mined stone from the desert!", "system");
                                    }
                                    
                                    updateTerrainMeshNear(hx, hz);
                                    if (isHost) {
                                        saveWorld(false);
                                    }
                                }
                                didAction = true;
                            } else if (item && (item === 'wooden_shovel' || item === 'stone_shovel' || item === 'copper_shovel' || item === 'iron_shovel')) {
                                if (now - (lastGroundShovelHitTime || 0) > 300) {
                                    lastGroundShovelHitTime = now;
                                    AudioSynth.playHit(camera.position.clone().add(new THREE.Vector3(0, -1.5, 0)));
                                    addChatMessage("You hit stone! Use a pickaxe to mine stone.", "system");
                                }
                                didAction = true;
                            }
                        }
                    }
                }
                
                if (didAction) {
                    lastWeaponSwingTime = now;
                    triggerWeaponSwing(item || 'fists');
                } else if (!item) {
                    lastWeaponSwingTime = now;
                    triggerPunch();
                    const punchObj = getPlacedObjectAimTarget();
                    if (punchObj) {
                        punchObj.hits = (punchObj.hits || 0) + 1;
                        punchObj.lastHitTime = now;
                        AudioSynth.playHit(punchObj.pos);
                        updatePlacedObjectCracks(punchObj);
                        if (punchObj.hits >= 3) {
                            minePlacedObject(punchObj);
                        }
                    }
                }
            }
        }

        function handleKeyEInteraction() {
            if (ridingHorse) {
                ridingHorse = false;
                if (activeHorse) {
                    activeHorse.isRidden = false;
                    activeHorse.rider = null;
                    activeHorse.mesh.position.y = getTerrainHeight(activeHorse.mesh.position.x, activeHorse.mesh.position.z);
                    camera.position.y += 1.0;
                    activeHorse = null;
                }
                addChatMessage("Dismounted horse.", "system");
                return true;
            }

            if (chestUIOpen) {
                closeChestUI();
                return true;
            }
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen || inventoryOpen) return false;

            const currentItem = hotbarItems[selectedHotbarIndex];
            if (currentItem === 'fishing_rod') {
                let stringIndex = -1;
                let isHotbar = false;
                for (let i = 0; i < 9; i++) {
                    if (hotbarItems[i] === 'string' && hotbarCounts[i] > 0) {
                        stringIndex = i;
                        isHotbar = true;
                        break;
                    }
                }
                if (stringIndex === -1) {
                    for (let i = 0; i < 27; i++) {
                        if (inventoryItems[i] === 'string' && inventoryCounts[i] > 0) {
                            stringIndex = i;
                            break;
                        }
                    }
                }
                
                if (stringIndex !== -1) {
                    if (isHotbar) {
                        hotbarCounts[stringIndex]--;
                        if (hotbarCounts[stringIndex] <= 0) hotbarItems[stringIndex] = null;
                    } else {
                        inventoryCounts[stringIndex]--;
                        if (inventoryCounts[stringIndex] <= 0) inventoryItems[stringIndex] = null;
                    }
                    isRodBaited = true;
                    updateHotbarUI();
                    updateInventoryUI();
                    AudioSynth.playWhoosh();
                    addChatMessage("Fishing rod baited! Press F to cast.", "system");
                } else {
                    addChatMessage("You need String to bait the fishing rod! Craft string from Wool.", "system");
                }
                return true;
            }
 
            if (furnaceUIOpen) {
                closeFurnaceUI();
                return true;
            }
 
            if (ridingBoat) {
                ridingBoat = false;
                camera.position.y += 1.0;
                activeBoat = null;
                addChatMessage("Exited the boat.", "system");
                return true;
            }
 
            let closestBoat = null;
            let minBoatDist = Infinity;
            placedObjects.forEach(obj => {
                if (obj.type === 'boat') {
                    const dx = camera.position.x - obj.pos.x;
                    const dy = camera.position.y - obj.pos.y;
                    const dz = camera.position.z - obj.pos.z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist < minBoatDist) {
                        minBoatDist = dist;
                        closestBoat = obj;
                    }
                }
            });
 
            if (closestBoat && minBoatDist < 4.0) {
                ridingBoat = true;
                activeBoat = closestBoat;
                addChatMessage("Riding boat! WASD to steer, Space, F or E to dismount.", "system");
                return true;
            }
 
            const aimedChest = getChestAimTarget();
            if (aimedChest) {
                openChestUI(aimedChest);
                return true;
            }
 
            const aimedFurnace = getFurnaceAimTarget();
            if (aimedFurnace) {
                openFurnaceUI(aimedFurnace);
                return true;
            }
 
            const aimedCampfire = getCampfireAimTarget();
            if (aimedCampfire) {
                interactWithCampfire(aimedCampfire);
                return true;
            }

            const aimedBed = getBedAimTarget();
            if (aimedBed) {
                respawnPoint = {
                    x: aimedBed.pos.x,
                    y: aimedBed.pos.y,
                    z: aimedBed.pos.z,
                    inCave: isDimensionCave(aimedBed.inCave)
                };
                addChatMessage("Respawn point set!", "system");
                saveWorld(false);
                trySleepInBed();
                return true;
            }

            const aimedHorse = getHorseAimTarget();
            if (aimedHorse) {
                if (!aimedHorse.hasSaddle) {
                    if (currentItem === 'saddle') {
                        hotbarCounts[selectedHotbarIndex]--;
                        if (hotbarCounts[selectedHotbarIndex] <= 0) {
                            hotbarItems[selectedHotbarIndex] = null;
                            hotbarCounts[selectedHotbarIndex] = 0;
                            selectHotbarSlot(selectedHotbarIndex);
                        } else {
                            updateHotbarUI();
                        }
                        aimedHorse.hasSaddle = true;
                        if (aimedHorse.mesh.userData.saddle) {
                            aimedHorse.mesh.userData.saddle.visible = true;
                        }
                        AudioSynth.playPickup();
                        addChatMessage("Placed saddle on the horse! Press E again to ride.", "system");
                        return true;
                    } else {
                        addChatMessage("You need a Saddle to ride this horse! Craft one with 5 Leather and 1 Iron Ingot.", "system");
                        return true;
                    }
                } else {
                    ridingHorse = true;
                    activeHorse = aimedHorse;
                    aimedHorse.isRidden = true;
                    aimedHorse.rider = 'local';
                    aimedHorse.waitTime = 0;
                    addChatMessage("Riding horse! WASD to steer, Press E to dismount.", "system");
                    return true;
                }
            }
 
            return false;
        }

        function openChestUI(chest) {
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen || inventoryOpen) return;
            
            activeChest = chest;
            chestUIOpen = true;
            
            // Lid animation
            const lidMesh = chest.mesh.getObjectByName("lid");
            const latchMesh = chest.mesh.getObjectByName("latch");
            if (lidMesh) {
                lidMesh.rotation.x = -Math.PI / 3;
                lidMesh.position.y = 0.65;
                lidMesh.position.z = -0.15;
            }
            if (latchMesh) {
                latchMesh.rotation.x = -Math.PI / 3;
                latchMesh.position.y = 0.55;
                latchMesh.position.z = 0.35;
            }
            
            if (!activeChest.chestInventoryItems) {
                activeChest.chestInventoryItems = new Array(27).fill(null);
                activeChest.chestInventoryCounts = new Array(27).fill(0);
            }
            if (!activeChest.chestInventoryDurability) {
                activeChest.chestInventoryDurability = new Array(27).fill(null);
            }
            
            const overlay = document.getElementById('chest-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
            }
            
            exitPointerLock();
            
            moveForces.forward = false;
            moveForces.backward = false;
            moveForces.left = false;
            moveForces.right = false;
            
            drawChestPlayerInventory();
            updateChestUI();
        }

        function closeChestUI() {
            const overlay = document.getElementById('chest-overlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
            
            if (heldItem) {
                returnHeldItemToInventory();
            }
            
            if (activeChest) {
                // Restore lid position
                const lidMesh = activeChest.mesh.getObjectByName("lid");
                const latchMesh = activeChest.mesh.getObjectByName("latch");
                if (lidMesh) {
                    lidMesh.rotation.x = 0;
                    lidMesh.position.y = 0.6;
                    lidMesh.position.z = 0;
                }
                if (latchMesh) {
                    latchMesh.rotation.x = 0;
                    latchMesh.position.y = 0.5;
                    latchMesh.position.z = 0.41;
                }
            }
            
            activeChest = null;
            chestUIOpen = false;
            
            requestPointerLock();
            saveWorld(false);
        }

        function drawChestPlayerInventory() {
            const container = document.getElementById('chest-player-inventory');
            if (!container) return;
            
            let html = '';
            for (let i = 0; i < 27; i++) {
                const item = inventoryItems[i];
                const count = inventoryCounts[i];
                const durability = inventoryDurability[i];
                const icon = item ? getItemIconDataURL(item) : '';
                const iconHTML = item ? `<img src="${icon}" class="slot-icon" />` : '';
                const countHTML = (item && count > 1) ? `<span class="slot-count">${count}</span>` : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                
                html += `
                    <div class="inventory-slot" onclick="onChestInventoryClick('inventory', ${i})" style="width: 50px; height: 50px; border: 1px solid rgba(255, 0, 127, 0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); position: relative; cursor: pointer;">
                        ${iconHTML}
                        ${countHTML}
                        ${durabilityBar}
                    </div>
                `;
            }
            html += `<div style="grid-column: span 9; height: 10px;"></div>`;
            for (let i = 0; i < 9; i++) {
                const item = hotbarItems[i];
                const count = hotbarCounts[i];
                const durability = hotbarDurability[i];
                const icon = item ? getItemIconDataURL(item) : '';
                const iconHTML = item ? `<img src="${icon}" class="slot-icon" />` : '';
                const countHTML = (item && count > 1) ? `<span class="slot-count">${count}</span>` : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                
                const highlight = i === selectedHotbarIndex ? 'border-color: var(--magenta); box-shadow: 0 0 8px rgba(255, 0, 127, 0.4);' : '';
                
                html += `
                    <div class="inventory-slot" onclick="onChestInventoryClick('hotbar', ${i})" style="width: 50px; height: 50px; border: 1px solid rgba(255, 0, 127, 0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); position: relative; cursor: pointer; ${highlight}">
                        ${iconHTML}
                        ${countHTML}
                        ${durabilityBar}
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        function updateChestUI() {
            const container = document.getElementById('chest-slots-grid');
            if (!container || !activeChest) return;
            
            let html = '';
            const items = activeChest.chestInventoryItems || [];
            const counts = activeChest.chestInventoryCounts || [];
            const durabilities = activeChest.chestInventoryDurability || (activeChest.chestInventoryDurability = new Array(27).fill(null));
            
            for (let i = 0; i < 27; i++) {
                const item = items[i];
                const count = counts[i];
                const durability = durabilities[i];
                const icon = item ? getItemIconDataURL(item) : '';
                const iconHTML = item ? `<img src="${icon}" class="slot-icon" style="width: 32px; height: 32px; object-fit: contain;" />` : '';
                const countHTML = (item && count > 1) ? `<span class="slot-count">${count}</span>` : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                
                html += `
                    <div class="inventory-slot" onclick="onChestSlotClick(${i})" style="width: 50px; height: 50px; border: 1px solid rgba(255, 0, 127, 0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); position: relative; cursor: pointer;">
                        ${iconHTML}
                        ${countHTML}
                        ${durabilityBar}
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        function onChestSlotClick(index) {
            if (!activeChest) return;
            const items = activeChest.chestInventoryItems;
            const counts = activeChest.chestInventoryCounts;
            const durabilities = activeChest.chestInventoryDurability || (activeChest.chestInventoryDurability = new Array(27).fill(null));
            
            const tool = isTool(heldItem?.type);
            
            if (heldItem) {
                // Place item into chest slot
                const tempType = items[index];
                const tempCount = counts[index];
                const tempDurability = durabilities[index];
                
                if (!tempType) {
                    items[index] = heldItem.type;
                    counts[index] = heldItem.count;
                    durabilities[index] = heldItem.durability !== undefined ? heldItem.durability : null;
                    heldItem = null;
                } else if (tempType === heldItem.type && !tool) {
                    const canAdd = 64 - tempCount;
                    const toAdd = Math.min(canAdd, heldItem.count);
                    counts[index] += toAdd;
                    heldItem.count -= toAdd;
                    if (heldItem.count <= 0) heldItem = null;
                } else {
                    items[index] = heldItem.type;
                    counts[index] = heldItem.count;
                    durabilities[index] = heldItem.durability !== undefined ? heldItem.durability : null;
                    heldItem = { type: tempType, count: tempCount, durability: tempDurability };
                }
            } else {
                // Pick item up from chest slot
                if (items[index]) {
                    heldItem = { 
                        type: items[index], 
                        count: counts[index], 
                        durability: durabilities[index] !== undefined ? durabilities[index] : null 
                    };
                    items[index] = null;
                    counts[index] = 0;
                    durabilities[index] = null;
                }
            }
            
            updateChestUI();
            drawChestPlayerInventory();
            updateFloatingItemUI();
        }

        function onChestInventoryClick(type, index) {
            onInventorySlotClick(type, index);
            drawChestPlayerInventory();
            updateChestUI();
        }

        function openFurnaceUI(furnace) {
            if (!gameActive || myHealth <= 0 || mapOpen || chatOpen || inventoryOpen) return;
            
            activeFurnace = furnace;
            furnaceUIOpen = true;
            
            if (!activeFurnace.furnaceState) {
                activeFurnace.furnaceState = {
                    inputItem: null,
                    fuelItem: null,
                    outputItem: null,
                    fuelBurnTimeLeft: 0,
                    fuelMaxBurnTime: 0,
                    smeltProgress: 0
                };
            }
            
            const overlay = document.getElementById('furnace-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
            }
            
            exitPointerLock();
            
            moveForces.forward = false;
            moveForces.backward = false;
            moveForces.left = false;
            moveForces.right = false;
            
            drawFurnacePlayerInventory();
            updateFurnaceUI();
        }

        function closeFurnaceUI() {
            const overlay = document.getElementById('furnace-overlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
            
            if (heldItem) {
                returnHeldItemToInventory();
            }
            
            activeFurnace = null;
            furnaceUIOpen = false;
            
            requestPointerLock();
            saveWorld(false);
        }

        function onFurnaceSlotClick(slotName) {
            if (!activeFurnace) return;
            const state = activeFurnace.furnaceState;
            
            if (slotName === 'input') {
                if (heldItem) {
                    if (isSmeltable(heldItem.type)) {
                        if (!state.inputItem) {
                            state.inputItem = { type: heldItem.type, count: heldItem.count };
                            heldItem = null;
                        } else if (state.inputItem.type === heldItem.type) {
                            const canAdd = 64 - state.inputItem.count;
                            const toAdd = Math.min(canAdd, heldItem.count);
                            state.inputItem.count += toAdd;
                            heldItem.count -= toAdd;
                            if (heldItem.count <= 0) heldItem = null;
                        } else {
                            const temp = state.inputItem;
                            state.inputItem = { type: heldItem.type, count: heldItem.count };
                            heldItem = temp;
                        }
                    } else {
                        addChatMessage("This item cannot be smelted/cooked!", "system");
                    }
                } else {
                    if (state.inputItem) {
                        heldItem = { type: state.inputItem.type, count: state.inputItem.count };
                        state.inputItem = null;
                    }
                }
            } else if (slotName === 'fuel') {
                if (heldItem) {
                    if (isFuel(heldItem.type)) {
                        const tool = isTool(heldItem.type);
                        if (!state.fuelItem) {
                            state.fuelItem = { type: heldItem.type, count: heldItem.count, durability: heldItem.durability !== undefined ? heldItem.durability : null };
                            heldItem = null;
                        } else if (state.fuelItem.type === heldItem.type && !tool) {
                            const canAdd = 64 - state.fuelItem.count;
                            const toAdd = Math.min(canAdd, heldItem.count);
                            state.fuelItem.count += toAdd;
                            heldItem.count -= toAdd;
                            if (heldItem.count <= 0) heldItem = null;
                        } else {
                            const temp = state.fuelItem;
                            state.fuelItem = { type: heldItem.type, count: heldItem.count, durability: heldItem.durability !== undefined ? heldItem.durability : null };
                            heldItem = temp;
                        }
                    } else {
                        addChatMessage("This item cannot be used as fuel!", "system");
                    }
                } else {
                    if (state.fuelItem) {
                        heldItem = { type: state.fuelItem.type, count: state.fuelItem.count, durability: state.fuelItem.durability !== undefined ? state.fuelItem.durability : null };
                        state.fuelItem = null;
                    }
                }
            } else if (slotName === 'output') {
                if (state.outputItem) {
                    if (heldItem) {
                        if (heldItem.type === state.outputItem.type) {
                            const canAdd = 64 - heldItem.count;
                            const toAdd = Math.min(canAdd, state.outputItem.count);
                            heldItem.count += toAdd;
                            state.outputItem.count -= toAdd;
                            if (state.outputItem.count <= 0) state.outputItem = null;
                        } else {
                            addChatMessage("Your hands are full with a different item!", "system");
                        }
                    } else {
                        heldItem = { type: state.outputItem.type, count: state.outputItem.count };
                        state.outputItem = null;
                    }
                }
            }
            
            updateFurnaceUI();
            drawFurnacePlayerInventory();
            updateFloatingItemUI();
        }

        function onFurnaceInventoryClick(type, index) {
            onInventorySlotClick(type, index);
            drawFurnacePlayerInventory();
        }

        function drawFurnacePlayerInventory() {
            const container = document.getElementById('furnace-player-inventory');
            if (!container) return;
            
            let html = '';
            for (let i = 0; i < 27; i++) {
                const item = inventoryItems[i];
                const count = inventoryCounts[i];
                const durability = inventoryDurability[i];
                const icon = item ? getItemIconDataURL(item) : '';
                const iconHTML = item ? `<img src="${icon}" class="slot-icon" />` : '';
                const countHTML = (item && count > 1) ? `<span class="slot-count">${count}</span>` : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                
                html += `
                    <div class="inventory-slot" onclick="onFurnaceInventoryClick('inventory', ${i})" style="width: 50px; height: 50px; border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); position: relative; cursor: pointer;">
                        ${iconHTML}
                        ${countHTML}
                        ${durabilityBar}
                    </div>
                `;
            }
            html += `<div style="grid-column: span 9; height: 10px;"></div>`;
            for (let i = 0; i < 9; i++) {
                const item = hotbarItems[i];
                const count = hotbarCounts[i];
                const durability = hotbarDurability[i];
                const icon = item ? getItemIconDataURL(item) : '';
                const iconHTML = item ? `<img src="${icon}" class="slot-icon" />` : '';
                const countHTML = (item && count > 1) ? `<span class="slot-count">${count}</span>` : '';
                const durabilityBar = getDurabilityBarHTML(item, durability);
                
                const highlight = i === selectedHotbarIndex ? 'border-color: var(--cyan); box-shadow: 0 0 8px rgba(0, 240, 255, 0.4);' : '';
                
                html += `
                    <div class="inventory-slot" onclick="onFurnaceInventoryClick('hotbar', ${i})" style="width: 50px; height: 50px; border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); position: relative; cursor: pointer; ${highlight}">
                        ${iconHTML}
                        ${countHTML}
                        ${durabilityBar}
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        function updateFurnaceUI() {
            if (!activeFurnace || !activeFurnace.furnaceState) return;
            const state = activeFurnace.furnaceState;
            
            const inputIconSpan = document.getElementById('furnace-input-icon');
            const inputCountSpan = document.getElementById('furnace-input-count');
            if (state.inputItem) {
                inputIconSpan.innerHTML = `<img src="${getItemIconDataURL(state.inputItem.type)}" style="width: 32px; height: 32px; object-fit: contain;" />`;
                inputCountSpan.innerText = state.inputItem.count > 1 ? state.inputItem.count : '';
            } else {
                inputIconSpan.innerHTML = '';
                inputCountSpan.innerText = '';
            }
            
            const fuelIconSpan = document.getElementById('furnace-fuel-icon');
            const fuelCountSpan = document.getElementById('furnace-fuel-count');
            if (state.fuelItem) {
                const durBar = getDurabilityBarHTML(state.fuelItem.type, state.fuelItem.durability);
                fuelIconSpan.innerHTML = `
                    <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <img src="${getItemIconDataURL(state.fuelItem.type)}" style="width: 32px; height: 32px; object-fit: contain;" />
                        ${durBar}
                    </div>
                `;
                fuelCountSpan.innerText = state.fuelItem.count > 1 ? state.fuelItem.count : '';
            } else {
                fuelIconSpan.innerHTML = '';
                fuelCountSpan.innerText = '';
            }
            
            const outputIconSpan = document.getElementById('furnace-output-icon');
            const outputCountSpan = document.getElementById('furnace-output-count');
            if (state.outputItem) {
                outputIconSpan.innerHTML = `<img src="${getItemIconDataURL(state.outputItem.type)}" style="width: 32px; height: 32px; object-fit: contain;" />`;
                outputCountSpan.innerText = state.outputItem.count > 1 ? state.outputItem.count : '';
            } else {
                outputIconSpan.innerHTML = '';
                outputCountSpan.innerText = '';
            }
            
            const progressFill = document.getElementById('furnace-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${state.smeltProgress * 100}%`;
            }
            
            const flameDiv = document.getElementById('furnace-flame');
            if (flameDiv) {
                if (state.fuelBurnTimeLeft > 0) {
                    flameDiv.style.opacity = '1.0';
                    flameDiv.style.textShadow = '0 0 10px rgba(255, 100, 0, 0.8)';
                } else {
                    flameDiv.style.opacity = '0.25';
                    flameDiv.style.textShadow = 'none';
                }
            }
        }

    Object.assign(window, {
        toggleInventoryOverlay,
        onInventorySlotClick,
        onArmorSlotClick,
        selectHotbarSlot,
        craftItem,
        closeFurnaceUI,
        onFurnaceSlotClick,
        onFurnaceInventoryClick,
        onChestInventoryClick,
        onChestSlotClick,
        closeChestUI,
    });

    function autoSaveAndExit(force = false) {
        if (!gameActive) return;
        
        const pauseMenu = document.getElementById('pause-menu');
        const ingameSettings = document.getElementById('in-game-settings-screen');
        const isPauseMenuOpen = pauseMenu && pauseMenu.style.display === 'flex';
        const isIngameSettingsOpen = ingameSettings && ingameSettings.style.display === 'flex';
        
        if (!force && (isPauseMenuOpen || isIngameSettingsOpen)) {
            return;
        }

        saveWorld(false);
        gameActive = false;
        exitPointerLock();
        
        if (pauseMenu) pauseMenu.style.display = 'none';
        
        if (elHud) elHud.style.display = 'none';
        if (elCrosshair) elCrosshair.style.display = 'none';
        if (elLobby) elLobby.style.display = 'flex';
        
        resetGameScene();
        renderSavesList();
    }

    function handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            autoSaveAndExit(false);
        }
    }

    function handleBlur() {
        autoSaveAndExit(false);
    }

    function handleUnload() {
        autoSaveAndExit(true);
    }

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    // Expose internal state and actions for testing
    if (typeof window !== 'undefined') {
        (window as any).__gameTestAPI = {
            // Getters/setters for internal state
            get myHealth() { return myHealth; },
            set myHealth(v) { myHealth = v; },
            get hunger() { return hunger; },
            set hunger(v) { hunger = v; },
            get currentGameMode() { return currentGameMode; },
            set currentGameMode(v) { currentGameMode = v; },
            get cheatsEnabled() { return cheatsEnabled; },
            set cheatsEnabled(v) { cheatsEnabled = v; },
            get physicsMode() { return physicsMode; },
            set physicsMode(v) { physicsMode = v; },
            get currentWorldName() { return currentWorldName; },
            set currentWorldName(v) { currentWorldName = v; },
            get inventoryItems() { return inventoryItems; },
            get inventoryCounts() { return inventoryCounts; },
            get hotbarItems() { return hotbarItems; },
            get hotbarCounts() { return hotbarCounts; },
            get gameActive() { return gameActive; },
            set gameActive(v) { gameActive = v; },
            get isLocked() { return isLocked; },
            set isLocked(v) { isLocked = v; },
            get zombies() { return zombies; },
            get placedObjects() { return placedObjects; },
            get respawnPoint() { return respawnPoint; },
            set respawnPoint(v) { respawnPoint = v; },
            get playerInCave() { return playerInCave; },
            set playerInCave(v) { playerInCave = v; },
            get isGrounded() { return isGrounded; },
            set isGrounded(v) { isGrounded = v; },
            get camera() { return camera; },

            // Internal functions
            takeDamage,
            respawnPlayer,
            startNewWorld,
            autoSaveAndExit,
            sendChatMessage,
            countItem,
            addFoodToInventory,
            isRecipeUnlocked,
            RECIPES,
            getTerrainHeight,
            getNoiseTerrainHeight,
            getSavedWorlds,
            saveWorldsList,
            triggerNightCommand,
            triggerDayCommand,
        };
    }

    renderSavesList();
    initPeer();

    return () => {
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', handleUnload);
        window.removeEventListener('beforeunload', handleUnload);

        if (peer) {
            try {
                peer.destroy();
            } catch (e) {}
        }
        if (reconnectInterval) clearInterval(reconnectInterval);
        delete window.toggleInventoryOverlay;
        delete window.onInventorySlotClick;
        delete window.onArmorSlotClick;
        delete window.selectHotbarSlot;
        delete window.craftItem;
        delete window.closeFurnaceUI;
        delete window.onFurnaceSlotClick;
        delete window.onFurnaceInventoryClick;
        delete window.onChestInventoryClick;
        delete window.onChestSlotClick;
        delete window.closeChestUI;
        delete (window as any).__gameTestAPI;
    };
}