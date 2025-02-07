# Fuzzleton

## Author  
**Tristan Patout**  
Master’s student in IT/AI at **Université Côte d'Azur, France**.  

This project is developed as part of the *"3D Game Programming"* course, taught by **Michel Buffa**, and is designed to compete in the [**Games On Web 2025**](https://www.cgi.com/france/fr-fr/event/games-on-web-2025)
 competition organized by **CGI** (on theme: *Dream Land*).


## Overview
Fuzzleton will be a physics-based 3D game developed in Babylon Js, featuring a teddy bear navigating a chaotically toy-filled kids' bedroom (every child's dream, right?). The game aims to blend platforming, puzzle-solving, and soft action fighting, drawing inspiration from titles like *Fall Guys*, *Human Fall Flat*, *Only Up* and *Gang Beasts*. Ideally, it will support multiplayer gameplay where players compete (in teams) to reach the top and become the ultimate "King of the Room".

---

## Features Implemented
### 1. **Physics & Engine Integration**
- Integration of **Havok** within a **Vite** environment.
- Aggregates, collisions, Rays, etc. 

### 2. **Camera System**
- Developed a **third-person ArcRotateCamera** that is targeted on the player
- Experimented with using an **ArcRotateCamera** for first-person gameplay as well. 

### 3. **Environment Creation**
#### **Lighting & Shadows**
- Tested various lightings techniques:
  - **HemisphericLight** for ambient lighting.
  - **Two DirectionalLights** for shadow casting.
  - **ShadowGenerator** to produce realistic shadows.
  - **Fog** for depth 

#### **Sky and Ground**
- Added a **skybox** 
- Ground creation:
  - **Flat** or from **heightmap terrain**.
  - Applied physics.

### 4. **Character Implementation**
- Developed a Teddy Bear character with:
  - **Character controller** supporting movement, jumping, and rotation based on camera direction.
  - **Animations from Mixamo** (idle, fall, etc.).
  - Experimented with **Babylon.js Fur Material** to enhance character visuals.
- Character controller inspired by [ergoudan](https://github.com/armomu/ergoudan).

### 5. **Asset Importation & Material Experiments**
- Tested various **3D assets**, Babylon.js **materials**, and **textures** to explore Babylon Js possibilities. 

### 6. **Level Design Elements**
- Created foundational **GameObject** classes, including:
  - **Walls**
  - **Platforms** (static & moving)
  - **Slopes**
  - **Stairs**

- Simple random objects generation
- Creation of a LevelGenerator (that, for the moment, randomly generates objects in a procedural way + predifined ones)

---

## Vision: What Fuzzleton Aims to Be
### **Core Concept**
I envision the game as a **battle** where players control teddy bears navigating through an oversized, chaotic **kid's room** full of toys. The goal is to overcome obstacles, solve puzzles, fight and **reach the top before others** competitors to become the *"King of the Room"* aka the teddy bear of everyone's dreams.

### **Planned Gameplay Features**
- **Multiplayer Mode**: Players can compete solo or in teams to reach the top.
- **Dynamic Environment**: A physics-based world with moving objects, destructible elements, and unpredictable challenges/fights.
- **Varied Gameplay**: Blending **platforming, puzzles, and action mechanics** to create engaging, skill-based? levels.
- **Customization**: Players could customize their Teddy Bear with different skins and accessories (through in-game rewards ?).

### **Inspirations**
The game will draw inspiration from various games, aiming to combine elements from each to create a unique and engaging experience:
- [*Fall Guys*](https://www.fallguys.com/)
- [*Human Fall Flat*](https://store.steampowered.com/app/477160/Human_Fall_Flat/)
- [*Gang Beasts*](https://gangbeasts.game/)
- [*Bed Wars*](https://www.minecraft.net/fr-ca/marketplace/pdp?id=e5e0b70b-849c-4f99-a5fb-c220f788dd3e)
- [*Only Up*](https://onlyup-game.io/)
- [*Kirby*](https://kirby.nintendo.com/)

---

## Short-term Next Steps
- **Refining movement**: Improve character controller (various bugs sucha as when jumping) and implement more movement mechanics (grabbing,  climbing, throowing itself).

- **Level design**: Creating first basic levels (at first only goal is to make a kind of platformer where the player needs to reach the top). Probably creating a Level Editor to simplify the creation process later on.

- **Multiplayer prototype**: Explore ways to implement multiplayer.

- **Optimization**: 
    - Implement AssetManager + Lazy loading 
    - Optimize havok physics
    - Resolve camera collision bugs and performances issues (in order to not see through objs, ground, walls, etc.)
    - Resolve shadow issues (when there is a lot of objs and/or when activating physics) 

- **AND A LOT MORE...** 

---

## Inspirations & Resources
- [Babylon.js Documentation & Tutotrials](https://doc.babylonjs.com/)
- [Babylon.js Forum](https://forum.babylonjs.com/)
- [SummerFestival Babylon Tutorial](https://github.com/BabylonJS/SummerFestival/tree/master)
- [ergoudan by armomu (strongly inspired/implemented from this project)](https://github.com/armomu/ergoudan)
- [Michel Buffa's 3D Game Programming Course](https://docs.google.com/document/d/1hz8XFVFsj3zmcZkPJtI93EMHgW-ZSAMDa_wtJnu9yN0/edit?tab=t.0#heading=h.c2d36nnahppc)
