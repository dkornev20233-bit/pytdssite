# pyTDS — Python Tower Defense

A feature-rich Tower Defense game built entirely in Python using Pygame. No game engine, no shortcuts — pure code.

---

## Requirements

- Python 3.9+
- Pygame (`pip install pygame`)

## Running the game

```bash
python game.py
```

The game runs at **1920×1080** at 60 FPS.

---

## Game Modes

| Mode    | Waves | Enemy Roster              | Final Boss            |
|---------|-------|---------------------------|-----------------------|
| Easy    | 20    | Normal, Fast, Slow, Hidden, Armored, Breaker, Necromancer | Grave Digger (5000 HP) |
| Fallen  | 40    | All Easy enemies + Fallen tier enemies | Fallen King (175,000 HP) / True Fallen King |
| Frosty  | 40    | Ice-themed enemies        | Frost Acolyte (4750 HP, slow immune) |

---

## Towers

| Tower          | Cost  | Max | Key Mechanic |
|----------------|-------|-----|--------------|
| Assassin       | 300   | 5   | Melee, Whirlwind AoE at lv2, hidden detection at lv1 |
| Accelerator    | 5000  | 5   | Purple laser, dual-target at lv4+, hidden detection at lv1 |
| Frostcelerator | 3500  | 1   | Ice laser — slows 25%, freezes after 1000 cumulative dmg |
| Archer         | 400   | 4   | Homing pierce arrows, Flame/Ice arrow modes, hidden det. lv4 |
| Lifestealer    | 400   | 4   | Earns 10–45% of enemy max HP as coins on kill |
| Red Ball       | 1000  | 4   | Leaps at enemy physically, hidden detection at lv2 |
| Freezer        | 400   | 6   | Bullets slow enemies 5–15% for 3–5 seconds |
| Farm           | 250   | 8   | Passive income 50–1600 coins per wave |
| xw5yt          | 5000  | 1   | **Exclusive** — green laser, 3 abilities including ally firerate boost |

---

## Enemies

### Easy Mode
| Enemy        | HP    | Speed | Notes |
|--------------|-------|-------|-------|
| Normal       | 8     | 55    | Base enemy |
| Fast         | 10    | 140   | Scouts ahead |
| Slow         | 30    | 28    | Tanky |
| Hidden       | 8     | 55    | Invisible to most towers |
| Armored      | 25    | 55    | 20% damage reduction |
| Breaker      | 30    | 55    | Golden color |
| Normal Boss  | 200   | 55    | Crown spikes |
| Slow Boss    | 25    | 28    | Very large radius |
| Hidden Boss  | 200   | 55    | Hidden + Boss combined |
| Necromancer  | 360   | 55    | Summons skeletons every 5s |
| Grave Digger | 5000  | 30    | Final boss of Easy mode |

### Fallen Mode (selected)
| Enemy              | HP     | Speed | Notes |
|--------------------|--------|-------|-------|
| Fallen Dreg        | 80     | 83    | 20% armor |
| Fallen Soul        | 150    | 55    | Hidden + 20% armor |
| Fallen Giant       | 3000   | 28    | $5000 kill reward |
| Possessed Armor    | 300    | 55    | 50% armor, spawns inner ghost |
| Fallen Necromancer | 3000   | 28    | Summons fallen enemies |
| Fallen Honor Guard | 75000  | 22    | Pre-boss gauntlet |
| Fallen King        | 175000 | 9     | Charges, turns hidden, sword lunges, summons heroes |
| True Fallen King   | 175000 | 8     | Phase Shift (immune), Curse Wave, Blood Charge, Dark Summon |

### Frosty Mode (selected)
| Enemy         | HP   | Speed | Notes |
|---------------|------|-------|-------|
| Frozen        | 10   | 68    | Base ice enemy |
| Cold Mist     | 300  | 68    | Hidden |
| Frost Mystery | 50   | 140   | Fast, shows "?" |
| Frostmite     | 65   | 140   | Spinning snowflake |
| Frost Hunter  | 2800 | 28    | Heavy tank |
| Frost Acolyte | 4750 | 28    | **Immune to all slows and freezes** |

---

## Maps

- **Straight** — enemies march left to right on a horizontal path
- **Zigzag** — enemies follow a multi-segment zigzag path across the full screen

---

## Multiplayer

Co-op mode for **Fallen** difficulty. Enemies have **+50% HP**.

### How to host
1. Start the game → Multiplayer → Host
2. Share your local IP and port `7777` with your friend
3. For cross-country play, use **ngrok**: `ngrok tcp 7777`

### How to join
1. Start the game → Multiplayer → Join
2. Enter the host's IP and port

Both players place their own towers. The host controls wave spawning and enemy simulation. The client sends damage events back to the host.

---

## Save System

The game saves to `savegame.json` in the root folder:
- Unlocked towers (`frostcelerator_unlocked`, `xw5yt_unlocked`)
- Loadout (5 slots)
- Persistent coin balance

Achievements are saved to `achievements.json`.

---

## Achievements

| ID           | Name             | Condition |
|--------------|------------------|-----------|
| first_path   | Первый путь      | Complete Easy mode |
| fallen_angel | Падший ангел     | Complete Fallen mode |
| glitch       | tH3 GL1tcH       | Complete Hidden Wave |
| king_victim  | Жертва Короля    | Lose to Fallen King on wave 40 Fallen |
| true_end     | Истинный конец   | Complete True Fallen |
| free_pass    | Проходной билет  | Complete Easy without killing final boss |
| rich         | Богач            | Hold 5000+ coins simultaneously |

---

## Developer Console

Press `F1` in-game to open the console. Available commands:

| Command              | Effect |
|----------------------|--------|
| `help`               | List all commands |
| `cash <N>`           | Give N coins |
| `hp <N>`             | Set player HP to N |
| `skip`               | Skip to next wave |
| `spawn_enemy <type>` | Spawn an enemy by type name |
| `spawn_enemy help`   | List all spawnable enemy types |
| `upgrade_all`        | Upgrade all placed towers to max |
| `snep`               | Toggle wave spawning pause |
| `fk_test`            | Trigger wave 40 Fallen King |
| `5`                  | Toggle ×5000 damage for all towers |

---

## Project Structure

```
game.py          — main game loop, UI, menus
game_core.py     — constants, fonts, save system, visual effects
enemies.py       — all enemy classes + wave data (Easy, Fallen, Frosty)
units.py         — all tower classes + projectiles
assets/
  multiplayer.py — co-op networking (TCP, JSON, zlib compression)
  image/         — tower/UI icons
savegame.json    — player save (auto-created)
achievements.json— unlocked achievements (auto-created)
```

---

## Speedrun

Visit the **pyTDS Speedrun** leaderboard at the website.

Categories:
- **Any%** — fastest full clear from launch to final wave cleared
- **100%** — all towers placed, all waves completed
- **Wave 30** — time ends on first frame wave 30 is cleared
- **No Hit** — complete the game without losing a single HP
- **Hardcore** — hardcore category
- **Frost** — frost category

All runs require video proof and moderator approval. Admins reserve the right to publish incomplete records.

---

## License

Open source. See repository for details.
