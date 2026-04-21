# DnD Design Conversations  
  
## April 21, 2026 - Architecture Decisions  
  
### Foundry Integration  
- Foundry takes 80%% of screen, bottom 20%% is dynamic UI  
- Action mode: Speech-to-text button for player actions  
- Dice mode: Scroll wheels for rolling, confirm/cancel buttons  
- Movement mode: Arrow controls for marching order leaders  
- Split party support with multiple marching order leaders  
  
### Position Tracking  
- Local JSON file updated by Foundry in real-time  
- Claude reads file for position data (no API calls)  
- Tracks party positions, patrol movements, fog of war  
