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
      window.craftItem('planks');

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
});
