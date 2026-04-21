# DnD Design Conversations

## April 21, 2026 - Architecture Decisions

### Tech Stack Changes
- Using Foundry for character sheets, inventory, rules (80%% of phone screen)
- Custom React UI for bottom 20%% (action buttons, dice rolls)
- SignalR for real-time updates (no Firebase)
- Azure hosting for remote access
- ASP.NET Core backend

### UI Modes
**Action Mode:** Speech-to-text button for player actions
**Dice Mode:** Scroll wheels for rolling, confirm/cancel buttons
**Movement Mode:** Arrow controls for dungeon exploration (marching order leaders)

### Movement System
- Split parties with separate marching order leaders
- Real-time Foundry API calls on button press
- Local JSON file tracks positions for Claude (no API calls needed)
- Fog of war exploration

### Voice Integration
- ElevenLabs for character voices (existing subscription)
- Manual copy-paste from Claude Desktop
- Voice markers in generated text: [NARRATOR], [OLD LADY], [EVIL WIZARD]
- Batch API calls via Claude bash tools

### TV Display (Cinematic UI)
- Character portraits in corner
- Scrolling dialogue text (Baldur's Gate/Diablo style)
- Scene-based background images
- Animated transitions
- React with Framer Motion

### Zero API Cost First Session
- Build polished UI first
- Manual story generation (no Claude integration)
- Test with family for engagement
- Evaluate gaps before adding API costs

### DM Control Model
- Scott (Assistant DM) stays in full control
- Claude suggests, Scott verifies and executes
- Manual token movement in Foundry
- No direct Claude -> Foundry automation

