# Neon Bruiser

Neon Bruiser is a browser-based first-person 3D arena game built with Next.js, React, Three.js, and PeerJS. It supports solo play and peer-to-peer multiplayer rooms, with a procedural arena, melee combat, bow combat, turrets, radar, chat, character customization, inventory, hunger, animals, hostile mobs, and a day-night cycle.

## Features

- First-person 3D gameplay rendered with Three.js.
- Solo mode for local play.
- PeerJS multiplayer rooms with shareable room links.
- Character customization with persisted colors in `localStorage`.
- Punch, kick, bow, food, hotbar, and inventory interactions.
- Procedural terrain with forests, villages, ocean, mountains, portals, and quantum lands.
- Day-night cycle with hostile mob spawns.
- Tactical radar, in-game chat, Web Audio sound effects, and pointer-lock mouse controls.

## Requirements

- Node.js 20 or newer is recommended.
- npm.
- A modern browser with WebGL, WebRTC, Pointer Lock, Clipboard, and Web Audio support.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
```

## How To Play

From the lobby:

- Select `Play Solo (Single Player)` to start without another player.
- Select `Host Game` and share the generated room link or room ID.
- Paste an opponent room ID and select `Join Arena` to connect to another player.
- Use `Customize Character` before starting to change player colors.

In multiplayer, the game uses PeerJS for peer-to-peer data channels. The room ID is generated in the browser, and the copy button creates a `?join=<room-id>` link for the other player.

## Controls

| Control | Action |
| --- | --- |
| Mouse | Look around after pointer lock is active |
| Click | Attack with selected hotbar item, shoot bow, fire turret, or eat selected food |
| W/A/S/D or Arrow Keys | Move |
| Space | Jump |
| 1-9 | Select hotbar slot |
| 1 | Fists |
| 2 | Kick |
| 3 | Bow |
| E | Open or close inventory |
| F | Enter or exit bushes and turrets when nearby |
| R | Mount or dismount quantum cubes when nearby |
| M | Open or close tactical radar |
| T | Open or close chat |
| Enter | Send chat message while chat is open |
| Escape | Close chat input |
| I | Toggle controls help |

Click the game area if the pointer-lock prompt appears.

## Project Structure

```text
src/app/page.tsx                    Next.js entry page.
src/app/layout.tsx                  App metadata and root layout.
src/app/globals.css                 Global game UI and HUD styles.
src/components/NeonBruiserGame.tsx  Client component that mounts the game shell.
src/game/gameShell.ts               Static HTML shell for lobby, HUD, chat, radar, and inventory overlays.
src/game/neonBruiser.ts             Three.js game engine, networking, input, combat, AI, and world systems.
```

## Implementation Notes

- The game is mounted only on the client. `NeonBruiserGame` injects `gameShellHtml`, dynamically imports `initNeonBruiser`, and runs the cleanup function on unmount.
- `src/game/neonBruiser.ts` currently uses `// @ts-nocheck`; most game state is managed imperatively inside `initNeonBruiser`.
- PeerJS is initialized with short generated room IDs and the default PeerJS broker behavior.
- Audio is synthesized through the Web Audio API after user interaction.
- Character appearance is stored in browser `localStorage` under `appearance_skin`, `appearance_hair`, `appearance_eye`, `appearance_shirt`, and `appearance_pants`.

## Troubleshooting

- If mouse look does not work, click inside the game area to request pointer lock.
- If multiplayer does not connect, try a new room ID, verify both browsers can access the page, and check browser console messages for PeerJS errors.
- If audio is silent, interact with the page first; browsers usually block Web Audio until a user gesture occurs.
- If WebGL fails, update the browser or try another browser/device with hardware acceleration enabled.
