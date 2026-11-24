# Cable workbench — current installation plan

- Network revision: November 24, 2026.
- Expo mounted LEFT. Runner centered, socket block RIGHT.
- Front panel numbers follow its printed staggered arrangement.

## Switch-to-panel preparation

- Runner1 to Expo7: direct jumper.
- Runner2–16: Floor Plan10–24, respectively.
- Runner16 / FP24; Runner15 / FP23; Runner14 / FP22; continue down to Runner2 / FP10.
- All fifteen Runner panel sockets get a rear cable now.
- Label front and rear cables FP[number]-R[number] plus destination ID.
- Coil unassigned rear cables behind the panel, ready for later wall-plate installation.
- Expo8 / FP9; Expo6 / FP8; Expo5 / FP7; Expo3 / FP6.
- Expo1: main Orbi via upper brush.
- Expo2/4: preserve exact existing NAS connections via upper brush.
- Expo SFP+1: gateway via Ethernet adapter and upper brush.
- Expo SFP+2: Ethernet adapter present, no connection assigned.
- Main Orbi LAN output / FP5 / family-room AP cable / satellite Orbi.
- FP1–4: unassigned.

## Latest Expo assignments

- Expo3: Office West, pc-loadletter / Custom PC.
- Expo6: Office West, meepmax1 / Mac Studio.
- Expo5: Office South, workout room (169) / Apple TV.
- Expo8: Office South, Samsung TV.
- Latest owner wall/socket list supersedes older 6/8 device pairing.
- Keep the actual current cable in its Expo socket; do not change switch configuration.

## Wall-plate grouping

- OF: Office; WW West wall, SW South wall.
- FR: Family room; PS plant shelf.
- MB: Master bedroom.
- B1: Jayce’s bedroom.
- B2: Guest bedroom.
- RACK / ROOM distinguish ends of a wall run.
- J1–J4 remain compact identifiers; human names display (1), (2).
- Family-room rack plate has exactly four destinations: NVR/switch, AP/Orbi, garage, plant shelf.
- AP is separate from plant shelf and fed by main Orbi, not Runner.
- NVR-labeled cable serves family-room switch. NVR downstream connection remains probable, not verified.
- Garage is one existing cable, FR-GA. Prepare its panel link; leave the wall lead disconnected if faulty.

## Devices and display

- pc-loadletter / Custom PC.
- meepmax1 / Mac Studio; m1meepmax is a historical alias.
- Main Bedroom / master Apple TV.
- OG LG / family-room Apple TV.
- workout room (169) / office Apple TV.
- kids room / guest-bedroom Apple TV.
- The Safe / Raspberry Pi400: prepared Runner5 / FP13 rear cable.
- Second Pi: prepared Runner4 / FP12 rear cable.
- SmartThings: Runner11 / FP19; rear cable to hub LAN.
- Physical black cables are drawn WHITE for contrast; black keystones stay black.
- Expo, Floor Plan and Runner have the same background shade.

## Source and review boundary

- homelab-connections.json is the full structured source; HTML embeds identical data for local use.
- Labels, Markdown and diagrams derive from that source.
- P means Proposed status, separate from permanent connection IDs.
- Power research follows network publication; prior power topology retained pending that review.
- Internet configuration and automatic shutdown remain outside scope.
