export const gameShellHtml = `<div id="canvas-container"></div>
    <div id="damage-vignette"></div>
    <div id="fire-vignette"></div>
    <div id="water-vignette"></div>
    <div id="click-lock-prompt" style="position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); font-family: 'Orbitron', sans-serif; font-size: 0.9rem; color: var(--cyan); text-shadow: var(--text-glow); background: rgba(5,5,10,0.6); padding: 8px 16px; border-radius: 4px; pointer-events: none; z-index: 100; border: 1px dashed var(--cyan); display: none;">
        CLICK SCREEN TO CAPTURE MOUSE
    </div>
    <div id="turret-prompt">
        PRESS [E] TO ENTER TURRET
    </div>

    <!-- Start Screen -->
    <div id="start-screen" class="overlay interactive" style="display: flex; background-image: linear-gradient(rgba(5, 6, 15, 0.4), rgba(5, 6, 15, 0.85)), url('/survivalism_start_bg.png'); background-size: cover; background-position: center; z-index: 200;">
        <div class="glass-panel" style="max-width: 500px; padding: 40px; box-shadow: 0 0 50px rgba(0, 240, 255, 0.2);">
            <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; color: var(--magenta); text-shadow: var(--magenta-glow); text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 4px;">Version 2.0</h3>
            <h1 style="font-size: 3.5rem; margin-bottom: 20px;">Surv<span>ivalism</span></h1>
            <p style="margin-bottom: 40px; line-height: 1.6; font-size: 1.05rem; color: #b0b5c0;">Explore, build, and survive in an infinite 3D voxel world. Discover hidden caves, rich biomes, and tropical coral reefs.</p>
            <button id="btn-enter-game" class="btn btn-cyan" style="font-family: 'Orbitron', sans-serif; letter-spacing: 2px; width: 100%; font-size: 1.2rem; padding: 15px 30px; text-transform: uppercase;">Enter Game</button>
        </div>
    </div>

    <!-- Home Screen (replaces lobby) -->
    <div id="lobby" class="overlay interactive" style="display: none; background: radial-gradient(circle, #0e111e 0%, #05060f 100%); z-index: 190;">
        <div class="glass-panel" style="max-width: 850px; width: 95%; display: flex; flex-direction: row; gap: 40px; align-items: stretch; padding: 35px; text-align: left;">
            <!-- Left Side: Navigation / Info -->
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h1 style="font-size: 2.8rem; text-align: left; margin-bottom: 10px;">Surv<span>ivalism</span></h1>
                    <p style="color: #8a90a0; font-size: 0.9rem; line-height: 1.5; margin-bottom: 30px;">An immersive open-world sandbox voxel game.</p>
                    
                    <button id="btn-show-new-game" class="btn btn-cyan" style="width: 100%; margin-bottom: 15px; font-family: 'Orbitron', sans-serif; letter-spacing: 1px; font-size: 1.05rem; padding: 12px 24px;">➕ New Game</button>
                    <button id="btn-customize-player" class="btn btn-orange" style="width: 100%; font-family: 'Orbitron', sans-serif; letter-spacing: 1px; font-size: 1.05rem; padding: 12px 24px; border: 1px solid rgba(255, 165, 0, 0.4); background: rgba(255, 165, 0, 0.05); color: #ffa500; text-shadow: 0 0 5px rgba(255, 165, 0, 0.3); transition: all 0.3s ease; border-radius: 8px; cursor: pointer;">👤 Customize Character</button>
                </div>
                
                <div style="font-size: 0.75rem; color: #5a6070; font-family: monospace; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                    Survivalism Engine v2.0<br>
                    Powered by Three.js & WebGL
                </div>
            </div>
            
            <!-- Vertical Divider -->
            <div style="width: 1px; background: rgba(255, 255, 255, 0.05); margin: 0 5px;"></div>
            
            <!-- Right Side: Saves List -->
            <div style="flex: 1.2; display: flex; flex-direction: column;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; color: var(--cyan); text-shadow: var(--text-glow); text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px;">Your Worlds</h3>
                <div id="saves-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; max-height: 380px; padding-right: 5px;">
                    <!-- Dynamically populated list of saved worlds -->
                </div>
            </div>
        </div>
    </div>

    <!-- New Game Settings Screen -->
    <div id="new-game-settings-screen" class="overlay interactive" style="display: none; background: radial-gradient(circle, #0e111e 0%, #05060f 100%); z-index: 180;">
        <div class="glass-panel" style="max-width: 550px; padding: 35px; text-align: left;">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 2rem; color: var(--cyan); text-shadow: var(--text-glow); margin-bottom: 25px; text-transform: uppercase; text-align: center;">World Settings</h2>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- World Name Input -->
                <div class="input-group" style="text-align: left; margin: 0; display: flex; flex-direction: column;">
                    <label style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 6px; letter-spacing: 0.5px;">World Name</label>
                    <input id="setting-world-name" class="text-input" type="text" value="New World" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(0, 240, 255, 0.2); color: white; padding: 12px; border-radius: 8px; font-size: 1rem; outline: none;">
                </div>
                
                <!-- Game Mode Toggle -->
                <div style="display: flex; flex-direction: column;">
                    <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 8px; letter-spacing: 0.5px;">Game Mode</label>
                    <div style="display: flex; gap: 15px;">
                        <button id="btn-mode-survival" class="btn btn-secondary active" style="flex: 1; padding: 10px; font-size: 0.9rem; border: 1px solid var(--cyan); background: rgba(0, 240, 255, 0.1); color: var(--cyan);">Survival Mode<div style="font-size: 0.7rem; color: #8a90a0; margin-top: 3px; font-family: sans-serif; text-transform: none; font-weight: normal;">Standard hunger and dangers</div></button>
                        <button id="btn-mode-freedom" class="btn btn-secondary" style="flex: 1; padding: 10px; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); color: #8a90a0;">Freedom Mode<div style="font-size: 0.7rem; color: #8a90a0; margin-top: 3px; font-family: sans-serif; text-transform: none; font-weight: normal;">No hunger, explore freely</div></button>
                    </div>
                </div>
                
                
                <!-- Cheats Enable/Disable Toggle -->
                <div style="display: flex; flex-direction: column;">
                    <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 8px; letter-spacing: 0.5px;">Cheats (/tp, /night)</label>
                    <div style="display: flex; gap: 15px;">
                        <button id="btn-cheats-disabled" class="btn btn-secondary active" style="flex: 1; padding: 10px; font-size: 0.9rem; border: 1px solid var(--cyan); background: rgba(0, 240, 255, 0.1); color: var(--cyan);">Cheats Disabled</button>
                        <button id="btn-cheats-enabled" class="btn btn-secondary" style="flex: 1; padding: 10px; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); color: #8a90a0;">Cheats Enabled</button>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button id="btn-cancel-new-game" class="btn btn-secondary" style="flex: 1; padding: 12px;">Cancel</button>
                <button id="btn-start-new-game" class="btn btn-cyan" style="flex: 1.5; padding: 12px; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">Create & Start</button>
            </div>
        </div>
    </div>

    <!-- Customize Player Screen -->
    <div id="customize-screen" class="overlay interactive" style="display: none;">
        <div class="glass-panel" style="max-width: 650px; padding: 30px;">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 2rem; color: var(--cyan); text-shadow: var(--text-glow); margin-bottom: 20px; text-transform: uppercase;">Customize Character</h2>
            
            <div style="display: flex; flex-direction: row; gap: 25px; flex-wrap: wrap; text-align: left;">
                <!-- Options (Left) -->
                <div style="flex: 1.2; min-width: 280px; display: flex; flex-direction: column; gap: 15px;">
                    <!-- Skin Tone -->
                    <div>
                        <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 6px; letter-spacing: 0.5px;">Skin Tone</label>
                        <div class="color-picker-group" data-category="skin" style="display: flex; gap: 8px;">
                            <button class="color-swatch active" data-color="#ffdbac" style="background-color: #ffdbac;"></button>
                            <button class="color-swatch" data-color="#f1c27d" style="background-color: #f1c27d;"></button>
                            <button class="color-swatch" data-color="#e0ac69" style="background-color: #e0ac69;"></button>
                            <button class="color-swatch" data-color="#c68642" style="background-color: #c68642;"></button>
                            <button class="color-swatch" data-color="#8d5524" style="background-color: #8d5524;"></button>
                            <button class="color-swatch" data-color="#2ecc71" style="background-color: #2ecc71;"></button>
                        </div>
                    </div>

                    <!-- Hair Color -->
                    <div>
                        <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 6px; letter-spacing: 0.5px;">Hair Color</label>
                        <div class="color-picker-group" data-category="hair" style="display: flex; gap: 8px;">
                            <button class="color-swatch active" data-color="#2c1d11" style="background-color: #2c1d11;"></button>
                            <button class="color-swatch" data-color="#111111" style="background-color: #111111;"></button>
                            <button class="color-swatch" data-color="#e9c46a" style="background-color: #e9c46a;"></button>
                            <button class="color-swatch" data-color="#e76f51" style="background-color: #e76f51;"></button>
                            <button class="color-swatch" data-color="#00f0ff" style="background-color: #00f0ff;"></button>
                        </div>
                    </div>

                    <!-- Eye Color -->
                    <div>
                        <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 6px; letter-spacing: 0.5px;">Eye Color</label>
                        <div class="color-picker-group" data-category="eye" style="display: flex; gap: 8px;">
                            <button class="color-swatch active" data-color="#0a1128" style="background-color: #0a1128;"></button>
                            <button class="color-swatch" data-color="#3b82f6" style="background-color: #3b82f6;"></button>
                            <button class="color-swatch" data-color="#10b981" style="background-color: #10b981;"></button>
                            <button class="color-swatch" data-color="#ff0055" style="background-color: #ff0055;"></button>
                            <button class="color-swatch" data-color="#eab308" style="background-color: #eab308;"></button>
                        </div>
                    </div>

                    <!-- Shirt Color -->
                    <div>
                        <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 6px; letter-spacing: 0.5px;">Shirt Color</label>
                        <div class="color-picker-group" data-category="shirt" style="display: flex; gap: 8px;">
                            <button class="color-swatch active" data-color="#2b6cb0" style="background-color: #2b6cb0;"></button>
                            <button class="color-swatch" data-color="#e53e3e" style="background-color: #e53e3e;"></button>
                            <button class="color-swatch" data-color="#319795" style="background-color: #319795;"></button>
                            <button class="color-swatch" data-color="#805ad5" style="background-color: #805ad5;"></button>
                            <button class="color-swatch" data-color="#1a202c" style="background-color: #1a202c;"></button>
                        </div>
                    </div>

                    <!-- Pants Color -->
                    <div>
                        <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 6px; letter-spacing: 0.5px;">Pants Color</label>
                        <div class="color-picker-group" data-category="pants" style="display: flex; gap: 8px;">
                            <button class="color-swatch active" data-color="#2d3748" style="background-color: #2d3748;"></button>
                            <button class="color-swatch" data-color="#1a365d" style="background-color: #1a365d;"></button>
                            <button class="color-swatch" data-color="#744210" style="background-color: #744210;"></button>
                            <button class="color-swatch" data-color="#171923" style="background-color: #171923;"></button>
                            <button class="color-swatch" data-color="#edf2f7" style="background-color: #edf2f7;"></button>
                        </div>
                    </div>
                </div>

                <!-- Preview (Right) -->
                <div style="flex: 0.8; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(5, 5, 10, 0.5); border: 1px solid rgba(0, 240, 255, 0.1); border-radius: 12px; padding: 15px; position: relative;">
                    <span style="position: absolute; top: 8px; left: 10px; font-family: 'Orbitron', sans-serif; font-size: 0.65rem; color: var(--cyan); letter-spacing: 1px;">3D Preview</span>
                    <div id="character-preview-canvas" style="width: 200px; height: 260px; overflow: hidden; border-radius: 8px; cursor: grab;"></div>
                </div>
            </div>

            <!-- Footer Buttons -->
            <button id="btn-save-customize" class="btn btn-cyan" style="margin-top: 25px; width: 100%;">Save & Return</button>
        </div>
    </div>

    <!-- In-Game HUD -->
    <div id="hud">
        <div class="hud-header">
            <!-- Player Health -->
            <div class="health-card player-card">
                <div class="health-name">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--cyan); box-shadow:0 0 6px var(--cyan);"></span>
                    YOU
                </div>
                <div class="health-bar-bg">
                    <div id="player-health-fill" class="health-bar-fill" style="width: 100%;"></div>
                </div>
                <div id="player-health-text" class="health-val">100 HP</div>
            </div>

            <!-- Opponent Health -->
            <div class="health-card opponent-card">
                <div class="health-name">
                    OPPONENT
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--magenta); box-shadow:0 0 6px var(--magenta);"></span>
                </div>
                <div class="health-bar-bg">
                    <div id="opponent-health-fill" class="health-bar-fill" style="width: 100%;"></div>
                </div>
                <div id="opponent-health-text" class="health-val">100 HP</div>
            </div>
        </div>

        <!-- Weapon Active HUD -->
        <div id="weapon-hud">
            <div>WEAPON: <span id="active-weapon-name">FISTS</span></div>
            <div style="font-size:0.65rem; color:#8a90a0;">[1] Hit | [2] Kick | [3-9] Slots</div>
        </div>

        <!-- Time & Cycle HUD -->
        <div id="time-hud">
            <div id="time-cycle-phase">DAYTIME</div>
            <div id="time-cycle-timer" style="font-size:0.7rem; color:#8a90a0; font-family:monospace;">00:00</div>
        </div>

        <div class="hud-footer">
            <div id="hud-controls-tip" class="controls-tip" style="display: none;">
                <div><span>1</span> HIT (Punch)</div>
                <div><span>2</span> KICK (Foot Kick)</div>
                <div><span>3-9</span> HOTBAR SLOTS</div>
                <div><span>M</span> EAT HELD FOOD (HOLD)</div>
                <div><span>N</span> RADAR MAP</div>
                <div><span>WASD</span> MOVE</div>
                <div><span>SPACE</span> JUMP</div>
            </div>
            <div id="hud-instructions-prompt" style="font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: #8a90a0; background: rgba(10,12,22,0.6); padding: 6px 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05);">
                Press <span style="color: var(--cyan); font-weight:800;">[I]</span> for Controls
            </div>
        </div>
    </div>

    <!-- Chat UI Overlay -->
    <div id="chat-container">
        <div id="chat-log"></div>
        <input type="text" id="chat-input" placeholder="Press Enter to send, Esc to close..." maxlength="80" autocomplete="off" />
    </div>

    <!-- Tactical Map Overlay Screen -->
    <div id="map-overlay" class="overlay">
        <div class="map-panel">
            <div class="map-title">TACTICAL RADAR</div>
            <div id="map-canvas-container">
                <canvas id="map-canvas" width="500" height="500"></canvas>
            </div>
            <p style="font-size: 0.75rem; color: #8a90a0; margin-bottom: 20px;">
                <span style="color:var(--cyan)">●</span> YOU &nbsp;&nbsp;&nbsp; 
                <span style="color:var(--magenta)">●</span> OPPONENT &nbsp;&nbsp;&nbsp; 
                <span style="color:#ff0055">●</span> TRASH CAN &nbsp;&nbsp;&nbsp; 
                <span style="color:#ffea00">●</span> TURRET &nbsp;&nbsp;&nbsp;
                <span style="color:#39ff14">●</span> ZOMBIE &nbsp;&nbsp;&nbsp;
                <span style="color:#208040">■</span> FOREST &nbsp;&nbsp;&nbsp; 
                <span style="color:#b4a05a">■</span> SAVANNA &nbsp;&nbsp;&nbsp; 
                <span style="color:#785028">■</span> VILLAGE
            </p>
            <button id="btn-close-map" class="btn btn-cyan" style="margin-bottom:0;">Close Radar [M]</button>
        </div>
    </div>

    <!-- Crosshair -->
    <div id="crosshair">
        <div id="crosshair-dot"></div>
    </div>

    <!-- Game Over Screen -->
    <div id="game-over" class="overlay interactive">
        <div class="glass-panel game-over-panel">
            <h2 id="game-over-title" class="title-win">VICTORY</h2>
            <p id="game-over-subtitle">You threw the opponent into the trash!</p>
            <button id="btn-rematch" class="btn btn-cyan">Request Rematch</button>
            <div id="rematch-status" class="status" style="margin-top: 10px; color: var(--yellow);"></div>
        </div>
    </div>

    <!-- Minecraft Active HUD -->
    <div id="minecraft-hud">
        <div id="minecraft-status-bars">
            <div id="minecraft-health"></div>
            <div id="minecraft-hunger"></div>
        </div>
        <div id="minecraft-hotbar"></div>
    </div>

    <!-- Large Inventory Overlay -->
    <div id="large-inventory-overlay">
        <div class="inventory-panel" style="max-width: 900px; width: 95%; display: flex; flex-direction: row; gap: 30px; align-items: stretch; justify-content: center;">
            <!-- Left Side: Inventory & Hotbar -->
            <div style="display: flex; flex-direction: column; gap: 20px; flex: 1.2;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="inventory-title" style="margin: 0;">Inventory</h2>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: #8a90a0;">Armor:</span>
                        <div id="inventory-armor-row" style="display: flex; gap: 8px;"></div>
                    </div>
                </div>
                <div id="inventory-grid" class="inventory-grid-container"></div>
                <div class="inventory-divider"></div>
                <div class="inventory-hotbar-label">Hotbar</div>
                <div id="inventory-hotbar-row" class="inventory-grid-container"></div>
                <button id="btn-close-inventory" class="btn btn-cyan" style="margin-top: 10px; width: 100%;" onclick="toggleInventoryOverlay()">Close Inventory [E]</button>
            </div>
            
            <!-- Vertical Divider -->
            <div style="width: 2px; background: rgba(0, 240, 255, 0.2); box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);"></div>
            
            <!-- Right Side: Crafting Panel -->
            <div style="display: flex; flex-direction: column; gap: 15px; flex: 0.9; min-width: 320px;">
                <h2 class="inventory-title" style="color: #ffa500; text-shadow: 0 0 8px rgba(255, 165, 0, 0.6);">Crafting</h2>
                <div id="crafting-recipes-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto; padding-right: 5px;">
                    <!-- Recipe entries will be generated here -->
                </div>
            </div>
        </div>
    </div>
    <div id="toast"></div>

    <!-- Furnace Overlay Screen -->
    <div id="furnace-overlay" class="overlay interactive" style="display: none;">
        <div class="glass-panel" style="max-width: 600px; padding: 25px; display: flex; flex-direction: column; gap: 15px; border: 1px solid var(--orange);">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; color: var(--orange); text-shadow: 0 0 10px rgba(255, 165, 0, 0.6); margin: 0; text-transform: uppercase;">Smelting Furnace</h2>
            
            <div style="display: flex; flex-direction: row; gap: 20px; align-items: center; justify-content: center; background: rgba(5, 5, 10, 0.4); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 165, 0, 0.2);">
                <!-- Input Slot -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                    <span style="font-size: 0.75rem; color: #8a90a0; font-family: 'Orbitron', sans-serif;">Input</span>
                    <div id="furnace-input-slot" class="inventory-slot" onclick="onFurnaceSlotClick('input')" style="width: 64px; height: 64px; border: 2px dashed rgba(255, 165, 0, 0.4); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; cursor: pointer; background: rgba(0,0,0,0.3); position: relative;">
                        <span id="furnace-input-icon"></span>
                        <span id="furnace-input-count" style="position: absolute; bottom: 4px; right: 6px; font-size: 0.75rem; font-weight: bold; color: white;"></span>
                    </div>
                </div>
                
                <!-- Smelt/Progress Column -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <!-- Fuel Slot -->
                    <div id="furnace-fuel-slot" class="inventory-slot" onclick="onFurnaceSlotClick('fuel')" style="width: 56px; height: 56px; border: 2px dashed rgba(255, 165, 0, 0.4); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; cursor: pointer; background: rgba(0,0,0,0.3); position: relative;">
                        <span id="furnace-fuel-icon"></span>
                        <span id="furnace-fuel-count" style="position: absolute; bottom: 4px; right: 6px; font-size: 0.7rem; font-weight: bold; color: white;"></span>
                    </div>
                    <span style="font-size: 0.7rem; color: #8a90a0; font-family: 'Orbitron', sans-serif;">Fuel</span>
                    <!-- Flame progress -->
                    <div style="font-size: 1.5rem; line-height: 1; height: 24px; opacity: 0.25;" id="furnace-flame">🔥</div>
                    <div style="width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; border: 1px solid rgba(255, 165, 0, 0.3);">
                        <div id="furnace-progress-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #ffaa00, #ff5500); transition: width 0.1s linear;"></div>
                    </div>
                </div>
                
                <!-- Output Slot -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                    <span style="font-size: 0.75rem; color: #8a90a0; font-family: 'Orbitron', sans-serif;">Output</span>
                    <div id="furnace-output-slot" class="inventory-slot" onclick="onFurnaceSlotClick('output')" style="width: 64px; height: 64px; border: 2px solid var(--orange); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; cursor: pointer; background: rgba(255, 165, 0, 0.05); position: relative;">
                        <span id="furnace-output-icon"></span>
                        <span id="furnace-output-count" style="position: absolute; bottom: 4px; right: 6px; font-size: 0.75rem; font-weight: bold; color: white;"></span>
                    </div>
                </div>
            </div>

            <!-- Player inventory grid inside the furnace for clicking items to deposit -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <span style="font-size: 0.8rem; color: #ffffff; text-align: left; font-family: 'Orbitron', sans-serif;">Click items in your inventory to load them:</span>
                <div id="furnace-player-inventory" class="inventory-grid-container" style="max-height: 200px; overflow-y: auto; display: grid; grid-template-columns: repeat(9, 1fr); gap: 5px;"></div>
            </div>

            <button id="btn-close-furnace" class="btn btn-orange" style="margin-top: 10px; width: 100%;" onclick="closeFurnaceUI()">Close Furnace [E]</button>
        </div>
    </div>

    <!-- Chest Overlay Screen -->
    <div id="chest-overlay" class="overlay interactive" style="display: none;">
        <div class="glass-panel" style="max-width: 600px; padding: 25px; display: flex; flex-direction: column; gap: 15px; border: 1px solid var(--magenta);">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; color: var(--magenta); text-shadow: 0 0 10px rgba(255, 0, 127, 0.6); margin: 0; text-transform: uppercase;">Storage Chest</h2>
            
            <div style="display: flex; flex-direction: column; gap: 10px; background: rgba(5, 5, 10, 0.4); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 0, 127, 0.2);">
                <span style="font-size: 0.85rem; color: #8a90a0; font-family: 'Orbitron', sans-serif; text-align: left;">Chest Storage (27 Slots)</span>
                <div id="chest-slots-grid" style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 6px; justify-content: center;">
                    <!-- Chest slots populated dynamically -->
                </div>
            </div>

            <!-- Player inventory grid inside the chest for clicking items to deposit -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <span style="font-size: 0.8rem; color: #ffffff; text-align: left; font-family: 'Orbitron', sans-serif;">Your Inventory (Click items to move):</span>
                <div id="chest-player-inventory" class="inventory-grid-container" style="max-height: 200px; overflow-y: auto; display: grid; grid-template-columns: repeat(9, 1fr); gap: 5px;"></div>
            </div>

            <button id="btn-close-chest" class="btn btn-magenta" style="margin-top: 10px; width: 100%;" onclick="closeChestUI()">Close Chest [E]</button>
        </div>
    </div>

    <!-- Held Item Floating tracking cursor -->
    <div id="held-item-floating">
        <span id="held-item-icon" class="slot-icon"></span>
        <span id="held-item-count" class="slot-count"></span>
    </div>

    <!-- Pause Menu -->
    <div id="pause-menu" class="overlay interactive" style="display: none; background: rgba(5, 5, 10, 0.65); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 1000;">
        <div class="glass-panel" style="max-width: 400px; padding: 35px; box-shadow: 0 0 40px rgba(0, 240, 255, 0.15); display: flex; flex-direction: column; gap: 15px;">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 2rem; color: var(--cyan); text-shadow: var(--text-glow); margin-bottom: 20px; text-transform: uppercase;">Game Paused</h2>
            
            <button id="btn-resume-game" class="btn btn-cyan" style="width: 100%; font-family: 'Orbitron', sans-serif; font-size: 1.05rem; padding: 12px 24px;">Continue Game</button>
            <button id="btn-pause-settings" class="btn btn-secondary" style="width: 100%; font-family: 'Orbitron', sans-serif; font-size: 1.05rem; padding: 12px 24px; border: 1px solid rgba(0, 240, 255, 0.4); background: rgba(0, 240, 255, 0.05); color: var(--cyan); text-shadow: 0 0 5px rgba(0, 240, 255, 0.3);">Settings</button>
            <button id="btn-save-quit" class="btn btn-magenta" style="width: 100%; font-family: 'Orbitron', sans-serif; font-size: 1.05rem; padding: 12px 24px; border: 1px solid rgba(255, 0, 127, 0.4); background: rgba(255, 0, 127, 0.05); color: var(--magenta); text-shadow: var(--magenta-glow);">Save & Quit</button>
        </div>
    </div>

    <!-- In-Game Settings Screen -->
    <div id="in-game-settings-screen" class="overlay interactive" style="display: none; background: rgba(5, 5, 10, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 1010;">
        <div class="glass-panel" style="max-width: 450px; padding: 35px; text-align: left; box-shadow: 0 0 40px rgba(255, 165, 0, 0.15);">
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #ffa500; text-shadow: 0 0 10px rgba(255, 165, 0, 0.6); margin-bottom: 25px; text-transform: uppercase; text-align: center;">Settings</h2>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Cheats Enable/Disable Toggle -->
                <div style="display: flex; flex-direction: column;">
                    <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 8px; letter-spacing: 0.5px;">Cheats (/tp, /night)</label>
                    <div style="display: flex; gap: 15px;">
                        <button id="btn-ingame-cheats-disabled" class="btn btn-secondary" style="flex: 1; padding: 10px; font-size: 0.9rem;">Disabled</button>
                        <button id="btn-ingame-cheats-enabled" class="btn btn-secondary" style="flex: 1; padding: 10px; font-size: 0.9rem;">Enabled</button>
                    </div>
                </div>
                
                <!-- Physics Enable/Disable Toggle -->
                <div style="display: flex; flex-direction: column;">
                    <label style="display: block; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--white); margin-bottom: 8px; letter-spacing: 0.5px;">Physics (Blocks Fall/Bend)</label>
                    <div style="display: flex; gap: 15px;">
                        <button id="btn-physics-disabled" class="btn btn-secondary" style="flex: 1; padding: 10px; font-size: 0.9rem;">Off</button>
                        <button id="btn-physics-enabled" class="btn btn-secondary" style="flex: 1; padding: 10px; font-size: 0.9rem;">On</button>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <button id="btn-close-ingame-settings" class="btn btn-orange" style="width: 100%; margin-top: 30px; padding: 12px; font-family: 'Orbitron', sans-serif; letter-spacing: 1px; border: 1px solid rgba(255, 165, 0, 0.4); background: rgba(255, 165, 0, 0.05); color: #ffa500; text-shadow: 0 0 5px rgba(255, 165, 0, 0.3); transition: all 0.3s ease; border-radius: 8px; cursor: pointer;">Back to Pause Menu</button>
        </div>
    </div>`;