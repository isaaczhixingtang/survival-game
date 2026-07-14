import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initNeonBruiser } from '@/game/neonBruiser';
import { gameShellHtml } from '@/game/gameShell';

// Mock WebRTC APIs to prevent PeerJS from throwing browser incompatibility errors
global.RTCPeerConnection = class MockRTCPeerConnection {
  close() {}
  createDataChannel() { return {}; }
} as any;
global.RTCSessionDescription = class {} as any;
global.RTCIceCandidate = class {} as any;

// Mock Pointer Lock APIs missing in jsdom
document.exitPointerLock = (() => {}) as any;
HTMLDivElement.prototype.requestPointerLock = (() => {}) as any;

// Mock WebGLRenderer to bypass missing WebGL context in jsdom
vi.mock('three', async (importActual) => {
  const actual = await importActual<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: class MockWebGLRenderer {
      setSize() {}
      setPixelRatio() {}
      shadowMap = { enabled: false, type: 0 };
      toneMapping = 0;
      domElement = document.createElement('canvas');
      render() {}
      setClearColor() {}
      dispose() {}
    }
  };
});

import * as THREE from 'three';

// Mock Web Audio API classes for sound synthesizers
class MockAudioNode {
  connect() {}
  disconnect() {}
}
class MockAudioParam {
  value = 0;
  setValueAtTime() { return this; }
  linearRampToValueAtTime() { return this; }
  exponentialRampToValueAtTime() { return this; }
  setTargetAtTime() { return this; }
  setValueCurveAtTime() { return this; }
  cancelScheduledValues() { return this; }
}
class MockOscillator extends MockAudioNode {
  frequency = new MockAudioParam();
  detune = new MockAudioParam();
  type = 'sine';
  start() {}
  stop() {}
}
class MockGain extends MockAudioNode {
  gain = new MockAudioParam();
}

class MockBiquadFilterNode extends MockAudioNode {
  type = 'lowpass';
  frequency = new MockAudioParam();
  Q = new MockAudioParam();
  gain = new MockAudioParam();
}

class MockAudioBuffer {
  length = 0;
  sampleRate = 44100;
  numberOfChannels = 1;
  constructor(channels: number, length: number, sampleRate: number) {
    this.length = length;
    this.sampleRate = sampleRate;
    this.numberOfChannels = channels;
  }
  getChannelData() { return new Float32Array(this.length); }
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  destination = new MockAudioNode();
  createOscillator() { return new MockOscillator(); }
  createGain() { return new MockGain(); }
  createBiquadFilter() { return new MockBiquadFilterNode(); }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
  createBufferSource() {
    return {
      buffer: null,
      connect() {},
      start() {},
      stop() {},
    };
  }
}
global.AudioContext = MockAudioContext as any;
(global as any).webkitAudioContext = MockAudioContext as any;

// Polyfill innerText for jsdom
Object.defineProperty(HTMLElement.prototype, 'innerText', {
  get() { return this.textContent; },
  set(value) { this.textContent = value; },
  configurable: true,
});

// Mock HTMLCanvasElement context to avoid needing canvas package in jsdom
HTMLCanvasElement.prototype.getContext = (() => {
  const dummyContext = {
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    createImageData: () => ({ data: new Uint8ClampedArray(4) }),
  };
  return new Proxy(dummyContext, {
    get(target, prop) {
      if (prop in target) {
        return (target as any)[prop];
      }
      return () => {}; // fallback for any drawing API call
    }
  });
}) as any;

HTMLCanvasElement.prototype.toDataURL = (() => {
  return 'data:image/png;base64,mock';
}) as any;

// Mock peerjs dependency for multiplayer
vi.mock('peerjs', () => {
  const MockPeer = class {
    on(event: string, callback: Function) {
      if (event === 'open') {
        setTimeout(() => callback('mock-peer-id'), 0);
      }
    }
    destroy() {}
  };
  return {
    default: MockPeer,
    Peer: MockPeer,
  };
});

// Mock requestAnimationFrame to prevent tests from hanging
let animationCallbacks: Array<FrameRequestCallback> = [];
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  animationCallbacks.push(cb);
  return animationCallbacks.length;
});
vi.stubGlobal('cancelAnimationFrame', (id: number) => {});

describe('Survivalism Game Tests', () => {
  let api: any;
  let cleanup: () => void;

  beforeEach(() => {
    // 1. Setup DOM Elements
    document.body.innerHTML = gameShellHtml;

    // 2. Stub localStorage
    const localStore: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => localStore[key] || null,
      setItem: (key: string, val: string) => { localStore[key] = val; },
      removeItem: (key: string) => { delete localStore[key]; },
      clear: () => { Object.keys(localStore).forEach(k => delete localStore[k]); }
    });

    // 3. Initialize Game
    cleanup = initNeonBruiser();
    api = (window as any).__gameTestAPI;
  });

  afterEach(() => {
    cleanup?.();
    animationCallbacks = [];
  });

  // ----------------------------------------------------
  // Feature Group 1: Initialization & World Creation
  // ----------------------------------------------------
  describe('Game Initialization & Starting World', () => {
    it('should initialize with correct default state', () => {
      expect(api).toBeDefined();
      expect(api.myHealth).toBe(100);
      expect(api.hunger).toBe(100);
      expect(api.gameActive).toBe(false);
    });

    it('should successfully start a new world with settings', () => {
      const nameInput = document.getElementById('setting-world-name') as HTMLInputElement;
      if (nameInput) nameInput.value = 'My Voxel Haven';

      api.startNewWorld();

      expect(api.gameActive).toBe(true);
      expect(api.currentWorldName).toBe('My Voxel Haven');
      expect(api.myHealth).toBe(100);
    });
  });

  // ----------------------------------------------------
  // Feature Group 2: Player Health, Damage, and Death
  // ----------------------------------------------------
  describe('Player Health & Damage Dynamics', () => {
    it('should reduce player health when taking damage', () => {
      api.startNewWorld();
      expect(api.myHealth).toBe(100);

      api.takeDamage(30);

      // Note: If armor/defense reduces damage, it should still be less than 100
      expect(api.myHealth).toBeLessThan(100);
    });

    it('should trigger death screen when health falls to 0', () => {
      api.startNewWorld();
      expect(api.myHealth).toBe(100);

      // Take massive damage to ensure zero/negative health
      api.takeDamage(200);

      expect(api.myHealth).toBe(0);
      const deathScreen = document.getElementById('death-screen');
      expect(deathScreen?.style.display).toBe('flex');
    });
  });

  // ----------------------------------------------------
  // Feature Group 3: Player Respawning
  // ----------------------------------------------------
  describe('Player Respawn System', () => {
    it('should respawn player at spawn position when bed is absent', () => {
      api.startNewWorld();
      api.takeDamage(200); // Die

      api.respawnPlayer(false);

      expect(api.myHealth).toBe(100);
      expect(api.camera.position.x).toBe(60);
      expect(api.camera.position.z).toBe(12);
    });

    it('should respawn player at bed position when bed is active', () => {
      api.startNewWorld();
      
      // Manually set a bed respawn point and place a bed object at that position
      api.respawnPoint = { x: 150, y: 10, z: -250, inCave: false };
      api.placedObjects.push({
        type: 'bed',
        pos: { x: 150, y: 10, z: -250 },
        inCave: false,
        mesh: new THREE.Group()
      });
      api.takeDamage(200); // Die

      api.respawnPlayer(true);

      expect(api.myHealth).toBe(100);
      expect(api.camera.position.x).toBe(150);
      expect(api.camera.position.z).toBe(-250);
    });
  });

  // ----------------------------------------------------
  // Feature Group 4: Inventory & Crafting System
  // ----------------------------------------------------
  describe('Inventory & Crafting Mechanics', () => {
    it('should count items in inventory correctly', () => {
      api.startNewWorld();

      // Clear inventory and hotbar
      api.inventoryItems.fill(null);
      api.inventoryCounts.fill(0);
      api.hotbarItems.fill(null);
      api.hotbarCounts.fill(0);

      // Place wood logs in inventory
      api.inventoryItems[2] = 'log';
      api.inventoryCounts[2] = 5;

      expect(api.countItem('log')).toBe(5);
      expect(api.countItem('planks')).toBe(0);
    });

    it('should craft planks from logs and consume input materials', () => {
      api.startNewWorld();

      // Clear inventory and hotbar and add 1 log
      api.inventoryItems.fill(null);
      api.inventoryCounts.fill(0);
      api.hotbarItems.fill(null);
      api.hotbarCounts.fill(0);
      api.inventoryItems[0] = 'log';
      api.inventoryCounts[0] = 1;

      // planks recipe converts 1 log -> 4 planks
      (window as any).craftItem('planks');

      expect(api.countItem('log')).toBe(0);
      expect(api.countItem('planks')).toBe(4);
    });
  });

  // ----------------------------------------------------
  // Feature Group 5: Chat Commands & Cheats
  // ----------------------------------------------------
  describe('Chat Commands & Admin Cheats', () => {
    it('should allow teleportation commands when cheats are enabled', () => {
      api.startNewWorld();
      api.cheatsEnabled = true;

      const chatInput = document.getElementById('chat-input') as HTMLInputElement;
      chatInput.value = '/tp cherry';
      
      api.sendChatMessage();

      // Cherry biome X coordinate target is -150
      expect(api.camera.position.x).toBe(-150);
      expect(api.camera.position.z).toBe(-350);

      const chatLog = document.getElementById('chat-log');
      expect(chatLog?.innerHTML).toContain('Teleported to cherry');
    });

    it('should block teleportation and night commands when cheats are disabled', () => {
      api.startNewWorld();
      api.cheatsEnabled = false;

      const chatInput = document.getElementById('chat-input') as HTMLInputElement;
      chatInput.value = '/tp cherry';

      api.sendChatMessage();

      // Position should not change from spawn coordinates (60, 20)
      expect(api.camera.position.x).toBe(60);

      const chatLog = document.getElementById('chat-log');
      expect(chatLog?.innerHTML).toContain('Cheats are disabled in this world!');
    });
  });

  // ----------------------------------------------------
  // Feature Group 6: Joseph Mode Modifiers
  // ----------------------------------------------------
  describe('Joseph Mode Custom Mechanics', () => {
    it('should correctly configure the myAppearance object and detect Joseph mode', () => {
      api.startNewWorld();
      expect(api.myAppearance).toBeDefined();
      expect(api.myAppearance.name).toBeDefined();
      
      api.myAppearance.name = 'Joseph';
      expect((api.myAppearance.name || '').toLowerCase().includes('joseph')).toBe(true);
      
      api.myAppearance.name = 'Alex';
      expect((api.myAppearance.name || '').toLowerCase().includes('joseph')).toBe(false);
    });
  });

  // ----------------------------------------------------
  // Feature Group 7: Wooden Axe Preservation & Mimic Settle Down
  // ----------------------------------------------------
  describe('Wooden Axe Preservation & Mimic Settle Down Mechanics', () => {
    it('should not drop wooden axe on death but drop other items', () => {
      api.startNewWorld();

      // Clear hotbar and inventory
      api.hotbarItems.fill(null);
      api.hotbarCounts.fill(0);
      api.inventoryItems.fill(null);
      api.inventoryCounts.fill(0);

      // Add a wooden axe and another item
      api.hotbarItems[0] = 'wooden_axe';
      api.hotbarCounts[0] = 1;
      api.hotbarItems[1] = 'apple';
      api.hotbarCounts[1] = 5;

      // Force player death
      api.takeDamage(200);

      // Verify player health is 0, apple is cleared/dropped, but wooden axe remains
      expect(api.myHealth).toBe(0);
      expect(api.hotbarItems[1]).toBeNull();
      expect(api.hotbarItems[0]).toBe('wooden_axe');
      expect(api.hotbarCounts[0]).toBe(1);
    });

    it('should settle mimic tree on defeat and go dormant for 2 days', () => {
      api.startNewWorld();

      // Clear zombies and insert a custom mimic tree
      api.zombies.length = 0;
      const mimic = {
        id: 'test_mimic_tree',
        mesh: new THREE.Group(),
        type: 'crawling_tree',
        x: 60,
        y: 10,
        z: 20,
        startX: 60,
        startY: 10,
        startZ: 20,
        ry: 0,
        lastAttackTime: 0,
        isAttacking: false,
        attackAnimTime: 0,
        health: 50,
        maxHealth: 50,
        burnTime: 0,
        kx: 0,
        kz: 0,
        isDead: false,
        deathTime: 0,
        state: 'chasing',
        stateTime: 0,
        chaseDuration: 15,
        attackAnimProgress: 0,
        isWandering: false,
        wanderTargetX: 0,
        wanderTargetZ: 0,
        isFleeing: false,
        nextWanderTime: Date.now() + 100000,
        wakeUpTime: null as number | null
      };
      mimic.mesh.position.set(65, 10, 25);
      api.zombies.push(mimic);

      // Send damage message to reduce health to 0
      const damageMsg = JSON.stringify({
        type: 'damage-zombie',
        id: 'test_mimic_tree',
        damage: 50,
        kx: 1,
        kz: 1
      });
      api.handleNetworkMessage(damageMsg);

      // Verify mimic settles down: health reset to 50, state is settled, wakeUpTime is set, isDead is false
      expect(mimic.health).toBe(50);
      expect(mimic.isDead).toBe(false);
      expect(mimic.state).toBe('settled');
      expect(mimic.wakeUpTime).toBeGreaterThan(Date.now());
    });
  });

  // ----------------------------------------------------
  // Feature Group 8: Stronghold Guards Mechanics
  // ----------------------------------------------------
  describe('Stronghold Guards Mechanics', () => {
    it('should spawn six stronghold guards on startup', () => {
      api.startNewWorld();
      
      const guards = api.zombies.filter((z: any) => z.type === 'stronghold_guard');
      expect(guards.length).toBe(6);
      expect(guards[0].health).toBe(150);
      expect(guards[1].health).toBe(150);
    });

    it('should change state based on player distance and jab when within 4 units', () => {
      api.startNewWorld();
      
      const guards = api.zombies.filter((z: any) => z.type === 'stronghold_guard');
      const guard = guards.find((z: any) => z.id === 'stronghold_guard_lvl2_1') || guards[0];
      expect(guard).toBeDefined();

      // Reset guard state and last attack time
      guard.state = 'standing';
      guard.isAttacking = false;
      guard.lastAttackTime = 0;
      guard.lastChargeTime = Date.now();

      // 1. Far away: state should be standing
      // Position camera far away
      api.camera.position.set(guard.x + 20, guard.y, guard.z + 20);
      api.updateZombies(0.1);
      expect(guard.state).toBe('standing');

      // 2. 5 units away: state should be crouching
      // Note: guard_lvl2_1 is inside the stronghold, so guard.x + 5.0 puts player inside too
      api.camera.position.set(guard.x + 5.0, guard.y, guard.z);
      api.updateZombies(0.1);
      expect(guard.state).toBe('crouching');

      // Reset health for testing damage
      const initialHealth = api.myHealth;
      
      // 3. 4 units away: state should be jabbing and deal damage
      api.camera.position.set(guard.x + 3.9, guard.y, guard.z);
      api.updateZombies(0.1);
      expect(guard.state).toBe('jabbing');
      expect(guard.isAttacking).toBe(true);
      expect(api.myHealth).toBeLessThan(initialHealth); // player took damage!
    });

    it('should apply half damage blocking except when jabbing', () => {
      api.startNewWorld();
      
      const guards = api.zombies.filter((z: any) => z.type === 'stronghold_guard');
      const guard = guards[0];
      expect(guard).toBeDefined();

      // 1. Block test (standing): takes half damage
      guard.state = 'standing';
      guard.isAttacking = false;
      guard.health = 150;
      
      // Send a damage network message of 20
      api.handleNetworkMessage(JSON.stringify({
        type: 'damage-zombie',
        id: guard.id,
        damage: 20,
        kx: 0,
        kz: 0
      }));
      expect(guard.health).toBe(140); // 150 - 10 (half block!)

      // 2. Block test (crouching): takes half damage
      guard.state = 'crouching';
      guard.isAttacking = false;
      guard.health = 150;
      
      api.handleNetworkMessage(JSON.stringify({
        type: 'damage-zombie',
        id: guard.id,
        damage: 20,
        kx: 0,
        kz: 0
      }));
      expect(guard.health).toBe(140); // 150 - 10 (half block!)

      // 3. Jabbing test: takes full damage
      guard.state = 'jabbing';
      guard.isAttacking = true;
      guard.health = 150;
      
      api.handleNetworkMessage(JSON.stringify({
        type: 'damage-zombie',
        id: guard.id,
        damage: 20,
        kx: 0,
        kz: 0
      }));
      expect(guard.health).toBe(130); // 150 - 20 (no block!)
    });

    it('should not be cleared by general zombie clears', () => {
      api.startNewWorld();
      
      // Verify we have guards
      const initialGuardCount = api.zombies.filter((z: any) => z.type === 'stronghold_guard').length;
      expect(initialGuardCount).toBe(6);

      // Perform a general night clear (forceAll = false)
      api.clearZombies(false);
      
      // Guards should still be there!
      const afterClearCount = api.zombies.filter((z: any) => z.type === 'stronghold_guard').length;
      expect(afterClearCount).toBe(6);

      // Perform a hard force clear (forceAll = true)
      api.clearZombies(true);

      // Guards should be cleared
      const afterForceClearCount = api.zombies.filter((z: any) => z.type === 'stronghold_guard').length;
      expect(afterForceClearCount).toBe(0);
    });

    it('should support /kill command to clear stronghold guards and spawn house mimics', () => {
      api.startNewWorld();
      api.cheatsEnabled = true;
      
      const initialGuardCount = api.zombies.filter((z: any) => z.type === 'stronghold_guard').length;
      expect(initialGuardCount).toBe(6);
      
      // Execute /kill command
      const chatInput = document.getElementById('chat-input') as HTMLInputElement;
      chatInput.value = '/kill';
      api.sendChatMessage();
      
      // Guards should be dead, and 4 house mimics should be spawned (2 initial + 2 from /kill)
      const aliveGuardCount = api.zombies.filter((z: any) => z.type === 'stronghold_guard' && !z.isDead).length;
      const deadGuardCount = api.zombies.filter((z: any) => z.type === 'stronghold_guard' && z.isDead).length;
      const mimicCount = api.zombies.filter((z: any) => z.type === 'house_mimic').length;
      
      expect(aliveGuardCount).toBe(0);
      expect(deadGuardCount).toBe(6);
      expect(mimicCount).toBe(4);
      
      // Verify house mimic fields are set
      const mimic = api.zombies.find((z: any) => z.type === 'house_mimic');
      expect(mimic).toBeDefined();
      expect(mimic.maxHealth).toBe(300);
      expect(mimic.health).toBe(300);
      expect(mimic.state).toBe('standing');
      expect(mimic.isHostile).toBe(false);
    });

    describe('Upgraded House Mimics Stats & Behaviors', () => {
      it('should spawn 2 house mimics on startup/reset with 300 HP', () => {
        api.startNewWorld();
        const mimics = api.zombies.filter((z: any) => z.type === 'house_mimic');
        expect(mimics.length).toBe(2);
        mimics.forEach((m: any) => {
          expect(m.maxHealth).toBe(300);
          expect(m.health).toBe(300);
          expect(m.isHostile).toBe(false);
        });
      });

      it('should become hostile when a nearby villager is attacked', () => {
        api.startNewWorld();
        const villager = api.villagers[0];
        expect(villager).toBeDefined();
        
        const mimic = api.zombies.find((z: any) => z.type === 'house_mimic');
        expect(mimic).toBeDefined();
        
        // Position them close to each other
        villager.mesh.position.set(-80, 0, -80);
        mimic.mesh.position.set(-85, 0, -85);
        
        expect(mimic.isHostile).toBe(false);
        
        // Attack the villager via triggerHouseMimicsAggro helper
        api.triggerHouseMimicsAggro(villager.mesh.position.x, villager.mesh.position.z);
        
        expect(mimic.isHostile).toBe(true);
      });

      it('should become hostile when the house mimic itself is attacked', () => {
        api.startNewWorld();
        const mimic = api.zombies.find((z: any) => z.type === 'house_mimic');
        expect(mimic).toBeDefined();
        expect(mimic.isHostile).toBe(false);

        // Simulate local player attacking it
        api.handleNetworkMessage(JSON.stringify({
            type: 'damage-zombie',
            id: mimic.id,
            damage: 20,
            kx: 0,
            kz: 0
        }));

        expect(mimic.isHostile).toBe(true);
      });

      it('should wander around and settle at a new spot', () => {
        api.startNewWorld();
        const mimic = api.zombies.find((z: any) => z.type === 'house_mimic');
        expect(mimic).toBeDefined();
        
        expect(mimic.state).toBe('standing');
        
        // Force mimic wander timer to expire
        mimic.nextWanderTime = Date.now() - 1000;
        
        // Call updateZombies to process the wander decision
        api.updateZombies(0.1);
        
        // It should start rising/wandering
        expect(mimic.state).toBe('rising');
        
        // Advance state time to rising animation completion (0.8s)
        mimic.stateTime = 0.9;
        api.updateZombies(0.1);
        
        expect(mimic.state).toBe('wandering');
        expect(mimic.isWandering).toBe(true);
        expect(mimic.wanderTargetX).toBeDefined();
        expect(mimic.wanderTargetZ).toBeDefined();
        
        // Teleport mimic to its target and call updateZombies to settle
        mimic.mesh.position.set(mimic.wanderTargetX, api.getTerrainHeight(mimic.wanderTargetX, mimic.wanderTargetZ, false), mimic.wanderTargetZ);
        api.updateZombies(0.1);
        
        // It should start burrowing
        expect(mimic.state).toBe('burrowing');
        
        // Advance burrowing animation completion (0.8s)
        mimic.stateTime = 0.9;
        api.updateZombies(0.1);
        
        // It should settle as 'standing' at the new spot
        expect(mimic.state).toBe('standing');
        expect(mimic.startX).toBeCloseTo(mimic.wanderTargetX, 1);
        expect(mimic.startZ).toBeCloseTo(mimic.wanderTargetZ, 1);
      });
    });

    describe('Player Movement Stop Behavior', () => {
      it('should immediately stop horizontal movement when movement keys are not pressed', () => {
        api.startNewWorld();
        
        api.gameActive = true;
        api.isLocked = true;

        const initialZ = api.camera.position.z;

        // Dispatch keydown 'KeyW' (forward)
        const keydownW = new KeyboardEvent('keydown', { code: 'KeyW' });
        window.dispatchEvent(keydownW);

        // Run animation loop to simulate moving forward
        for (let i = 0; i < 5; i++) {
          animationCallbacks.forEach(cb => cb(0.016));
        }

        const movedZ = api.camera.position.z;
        expect(movedZ).not.toBe(initialZ);

        // Now dispatch keyup 'KeyW' (release forward)
        const keyupW = new KeyboardEvent('keyup', { code: 'KeyW' });
        window.dispatchEvent(keyupW);

        // Run one frame to process the release
        animationCallbacks.forEach(cb => cb(0.016));
        const stopZ1 = api.camera.position.z;

        // Run another frame
        animationCallbacks.forEach(cb => cb(0.016));
        const stopZ2 = api.camera.position.z;

        // Since horizontal velocity immediately drops to 0, stopZ1 should equal stopZ2
        expect(stopZ1).toBe(stopZ2);
      });
    });
  });
});
