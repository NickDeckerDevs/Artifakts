# Floor Plan wiring register

Deacon + dot · Dot-Ref: DOT-20261125-FLOORPLAN

- Fill right to left, starting at Floor Plan 24. This is the approved wiring design, not a cable-installation record.
- **Empty:** Floor Plan 1–5, Bouncer Ethernet 2–7, Expo Ethernet 1 and SFP+ 2. Runner has no unassigned ports; Runner 2 / Floor Plan 10 is reserved for Future Rack.
- **Orbi:** Bouncer 8 through Brushgate feeds the main Orbi. Its separate LAN output goes straight to the existing family-room AP wall jack and satellite, bypassing Floor Plan. Bouncer 8 stays yellow.
- **Keystones:** the colors below are route colors. Physical insert inventory is separate; verify insert colors and positions after install.
- **Faceplates:** keep existing office and family-room jacks. P1/P2 use provisional Master rack J3/J4. Guest and Jayce use the provisional rightmost pair on their respective rack faceplates. Record physical jack positions, P1/P2 remote ends, and NVR/camera locations after installation.

## Port map

| Floor Plan | Switch port | Color | Destination |
|---:|---|---|---|
| 24 | Runner Ethernet 16 | yellow | Family room · NVR / switch · FR-WP-RACK / existing NVR / switch jack |
| 23 | Runner Ethernet 15 | yellow | Family room · Plant shelf · FR-WP-RACK / existing Plant shelf jack |
| 22 | Runner Ethernet 14 | yellow | Garage · existing cable · FR-WP-RACK / existing Garage / UNKNOWN jack |
| 21 | Runner Ethernet 13 | orange | Jayce’s bedroom (2) · B1-WP-RACK / J4 (provisional) |
| 20 | Runner Ethernet 12 | orange | Jayce’s bedroom (1) · B1-WP-RACK / J3 (provisional) |
| 19 | Runner Ethernet 11 | orange | Guest bedroom (1) · B2-WP-RACK / J4 (provisional) |
| 18 | Runner Ethernet 10 | orange | Guest bedroom (2) · B2-WP-RACK / J3 (provisional) |
| 17 | Runner Ethernet 9 | white | Prepared · P2 · MB-WP-RACK / J4 (provisional) |
| 16 | Runner Ethernet 8 | white | Prepared · P1 · MB-WP-RACK / J3 (provisional) |
| 15 | Runner Ethernet 7 | white | Master bedroom (1) · MB-WP-RACK / 1 |
| 14 | Runner Ethernet 6 | white | Master bedroom (2) · MB-WP-RACK / 2 |
| 13 | Runner Ethernet 5 | purple | The Safe · The Safe Ethernet |
| 12 | Runner Ethernet 4 | purple | Raspberry Pi 400 · Raspberry Pi 400 Ethernet |
| 11 | Runner Ethernet 3 | purple | SmartThings · Samsung hub · Samsung SmartThings GP-U999SJVLGDA LAN |
| 10 | Runner Ethernet 2 | purple | Future rack device · reserved · Future rack device (reserved) |
| 9 | Expo Ethernet 8 | blue | Office · Samsung TV · OF-WP-RACK / existing Samsung TV jack |
| 8 | Expo Ethernet 6 | blue | meepmax1 · Mac Studio · OF-WP-RACK / existing Mac Studio jack |
| 7 | Expo Ethernet 5 | blue | workout room (169) · Apple TV · OF-WP-RACK / existing Apple TV jack |
| 6 | Expo Ethernet 3 | blue | pc-loadletter · Custom PC · OF-WP-RACK / existing PC jack |
| 5 | — | — | Empty |
| 4 | — | — | Empty |
| 3 | — | — | Empty |
| 2 | — | — | Empty |
| 1 | — | — | Empty |

## Direct connections

- **FR-AP** (yellow): Main Orbi · existing LAN output → FR-WP-RACK · existing AP jack → FR-WP-RACK · AP jack → FR-WP-ROOM-WW · existing AP jack → Orbi RBS50 satellite · Ethernet → FR-AP
- **C1** (purple): NAS · preserve the currently connected NAS jack → Up behind rack → through U15 brush → down front → Expo · Ethernet 2
- **C2** (purple): NAS · preserve the currently connected NAS jack → Up behind rack → through U15 brush → down front → Expo · Ethernet 4
- **C4** (purple): Hostess / BGW620 · blue LAN 1 → Up behind rack → through U15 Brushgate → down front → Bouncer · Ethernet 1 (2.5 GbE WAN)
- **C7** (green): Bouncer · SFP+ → Green 10 GbE DAC · front of rack → Expo · SFP+ 1
- **C5** (purple): Receiving Dock / Q1000K · existing installer Ethernet jack → Keep existing cable behind equipment → Hostess · red ONT/LAN
- **C6** (purple): Expo · Ethernet 7 → Direct front patch cable → Runner · Ethernet 1
- **WIFI-1** (yellow): Bouncer · Ethernet 8 (1 GbE LAN) → Up the front → through U15 Brushgate → down behind rack → Main Orbi RBR50 · Internet / WAN port (AP mode)
- **OFFICE-SW** (black): Optional future office switch → Expo 6 → Floor Plan 8 FRONT → Floor Plan 8 REAR → existing Mac Studio jack on OF-WP-RACK → Existing rack-side Mac Studio jack → existing Office West room jack → Existing Office West Mac Studio room jack → TRENDnet Ethernet port

## Installation steps

### FR-WW-J1 · Family room · NVR / switch

1. **Source:** Runner · Ethernet 16
2. **Front cable:** Yellow patch cable → Floor Plan 24 FRONT. FP24-R16 · FR-WW-J1
3. **Panel:** Front and rear are the two sides of the same panel jack. Floor Plan 24 FRONT → Floor Plan 24 REAR
4. **Rear cable:** Floor Plan 24 REAR → FR-WP-RACK · existing NVR / switch jack. Separate rear patch cable to rack-side wall jack. Keep this existing jack exactly where it is.
5. **Wall run:** FR-WP-RACK · existing NVR / switch jack → FR-WP-ROOM-WW · existing jack. Existing in-wall cable.
6. **Room cable:** FR-WP-ROOM-WW · existing jack → Family-room switch · PlayStation / OG LG Apple TV. Separate room patch cable to device Ethernet port.
7. **Label:** FP24-R16 · FR-WW-J1. Label both ends of each new patch cable. Keep the permanent wall-run ID FR-WW-J1.

### FR-PS-J1 · Family room · Plant shelf

1. **Source:** Runner · Ethernet 15
2. **Front cable:** Yellow patch cable → Floor Plan 23 FRONT. FP23-R15 · FR-PS-J1
3. **Panel:** Front and rear are the two sides of the same panel jack. Floor Plan 23 FRONT → Floor Plan 23 REAR
4. **Rear cable:** Floor Plan 23 REAR → FR-WP-RACK · existing Plant shelf jack. Separate rear patch cable to rack-side wall jack. Keep this existing jack exactly where it is.
5. **Wall run:** FR-WP-RACK · existing Plant shelf jack → FR-WP-ROOM-PS · existing jack. Existing in-wall cable.
6. **Room end:** Plant shelf connection. Endpoint device / Ethernet socket not assigned. Leave room jack available; do not invent a device connection.
7. **Label:** FP23-R15 · FR-PS-J1. Label both ends of each new patch cable. Keep the permanent wall-run ID FR-PS-J1.

### FR-GA · Garage · existing cable

1. **Source:** Runner · Ethernet 14
2. **Front cable:** Yellow patch cable → Floor Plan 22 FRONT. FP22-R14 · FR-GA
3. **Panel:** Front and rear are the two sides of the same panel jack. Floor Plan 22 FRONT → Floor Plan 22 REAR
4. **Rear cable:** Floor Plan 22 REAR → FR-WP-RACK · existing Garage / UNKNOWN jack. Separate rear patch cable to rack-side wall jack. Keep this existing jack exactly where it is.
5. **Wall run:** FR-WP-RACK · existing Garage / UNKNOWN jack → GA-WP-ROOM · existing jack. Existing garage / UNKNOWN cable; condition untested. Leave disconnected if faulty.
6. **Room end:** Existing garage cable · condition untested. Endpoint device / Ethernet socket not assigned. Leave room jack available; do not invent a device connection.
7. **Label:** FP22-R14 · FR-GA. Label both ends of each new patch cable. Keep the permanent wall-run ID FR-GA.

### B1-J2 · Jayce’s bedroom (2)

1. **Source:** Runner · Ethernet 13
2. **Front cable:** Orange patch cable → Floor Plan 21 FRONT. FP21-R13 · B1-J2
3. **Panel:** Floor Plan 21 FRONT → Floor Plan 21 REAR
4. **Rear cable:** Floor Plan 21 REAR → B1-WP-RACK · J4 (provisional)
5. **Wall run:** B1-WP-ROOM · 2
6. **Label:** FP21-R13 · B1-J2

### B1-J1 · Jayce’s bedroom (1)

1. **Source:** Runner · Ethernet 12
2. **Front cable:** Orange patch cable → Floor Plan 20 FRONT. FP20-R12 · B1-J1
3. **Panel:** Floor Plan 20 FRONT → Floor Plan 20 REAR
4. **Rear cable:** Floor Plan 20 REAR → B1-WP-RACK · J3 (provisional)
5. **Wall run:** B1-WP-ROOM · 1
6. **Label:** FP20-R12 · B1-J1

### B2-J1 · Guest bedroom (1)

1. **Source:** Runner · Ethernet 11
2. **Front cable:** Orange patch cable → Floor Plan 19 FRONT. FP19-R11 · B2-J1
3. **Panel:** Floor Plan 19 FRONT → Floor Plan 19 REAR
4. **Rear cable:** Floor Plan 19 REAR → B2-WP-RACK · J4 (provisional)
5. **Wall run:** B2-WP-ROOM · 1
6. **Label:** FP19-R11 · B2-J1

### B2-J2 · Guest bedroom (2)

1. **Source:** Runner · Ethernet 10
2. **Front cable:** Orange patch cable → Floor Plan 18 FRONT. FP18-R10 · B2-J2
3. **Panel:** Floor Plan 18 FRONT → Floor Plan 18 REAR
4. **Rear cable:** Floor Plan 18 REAR → B2-WP-RACK · J3 (provisional)
5. **Wall run:** B2-WP-ROOM · 2
6. **Label:** FP18-R10 · B2-J2

### P2 · Prepared · P2

1. **Source:** Runner · Ethernet 9
2. **Front cable:** White patch cable → Floor Plan 17 FRONT. FP17-R9 · P2
3. **Panel:** Floor Plan 17 FRONT → Floor Plan 17 REAR
4. **Rear cable:** Floor Plan 17 REAR → MB-WP-RACK · J4 (provisional)
5. **Wall run:** Remote destination to be recorded after install
6. **Label:** FP17-R9 · P2

### P1 · Prepared · P1

1. **Source:** Runner · Ethernet 8
2. **Front cable:** White patch cable → Floor Plan 16 FRONT. FP16-R8 · P1
3. **Panel:** Floor Plan 16 FRONT → Floor Plan 16 REAR
4. **Rear cable:** Floor Plan 16 REAR → MB-WP-RACK · J3 (provisional)
5. **Wall run:** Remote destination to be recorded after install
6. **Label:** FP16-R8 · P1

### MB-J1 · Master bedroom (1)

1. **Source:** Runner · Ethernet 7
2. **Front cable:** White patch cable → Floor Plan 15 FRONT. FP15-R7 · MB-J1
3. **Panel:** Floor Plan 15 FRONT → Floor Plan 15 REAR
4. **Rear cable:** Floor Plan 15 REAR → MB-WP-RACK · 1
5. **Wall run:** MB-WP-ROOM · 1
6. **Label:** FP15-R7 · MB-J1

### MB-J2 · Master bedroom (2)

1. **Source:** Runner · Ethernet 6
2. **Front cable:** White patch cable → Floor Plan 14 FRONT. FP14-R6 · MB-J2
3. **Panel:** Floor Plan 14 FRONT → Floor Plan 14 REAR
4. **Rear cable:** Floor Plan 14 REAR → MB-WP-RACK · 2
5. **Wall run:** MB-WP-ROOM · 2
6. **Label:** FP14-R6 · MB-J2

### SAFE-1 · The Safe

1. **Source:** Runner · Ethernet 5
2. **Front cable:** Purple patch cable → Floor Plan 13 FRONT. FP13-R5 · SAFE-1
3. **Panel:** Floor Plan 13 FRONT → Floor Plan 13 REAR
4. **Rear cable:** Floor Plan 13 REAR → The Safe Ethernet
5. **Label:** FP13-R5 · SAFE-1

### PI-1 · Raspberry Pi 400

1. **Source:** Runner · Ethernet 4
2. **Front cable:** Purple patch cable → Floor Plan 12 FRONT. FP12-R4 · PI-1
3. **Panel:** Floor Plan 12 FRONT → Floor Plan 12 REAR
4. **Rear cable:** Floor Plan 12 REAR → Raspberry Pi 400 Ethernet
5. **Label:** FP12-R4 · PI-1

### C3 · SmartThings · Samsung hub

1. **Source:** Runner · Ethernet 3
2. **Front cable:** Purple patch cable → Floor Plan 11 FRONT. FP11-R3 · C3
3. **Panel:** Floor Plan 11 FRONT → Floor Plan 11 REAR
4. **Rear cable:** Floor Plan 11 REAR → Samsung SmartThings GP-U999SJVLGDA LAN
5. **Label:** FP11-R3 · C3

### FUTURE-RACK · Future rack device · reserved

1. **Source:** Runner · Ethernet 2
2. **Front cable:** Purple patch cable → Floor Plan 10 FRONT. FP10-R2 · FUTURE-RACK
3. **Panel:** Floor Plan 10 FRONT → Floor Plan 10 REAR
4. **Rear cable:** Floor Plan 10 REAR → Future rack device (reserved)
5. **Label:** FP10-R2 · FUTURE-RACK

### OF-SW-J2 · Office · Samsung TV

1. **Source:** Expo · Ethernet 8
2. **Front cable:** Blue patch cable → Floor Plan 9 FRONT. FP9-EX8
3. **Panel:** Front and rear are the two sides of the same panel jack. Floor Plan 9 FRONT → Floor Plan 9 REAR
4. **Rear cable:** Floor Plan 9 REAR → OF-WP-RACK · existing Samsung TV jack. Separate rear patch cable to rack-side wall jack. Keep this existing jack exactly where it is.
5. **Wall run:** OF-WP-RACK · existing Samsung TV jack → OF-WP-ROOM-SW · existing jack. Existing in-wall cable.
6. **Room cable:** OF-WP-ROOM-SW · existing jack → Samsung TV. Separate room patch cable to device Ethernet port.
7. **Label:** FP9-EX8. Label both ends of each new patch cable. Keep the permanent wall-run ID OF-SW-J2.

### OF-WW-J2 · meepmax1 · Mac Studio

1. **Source:** Expo · Ethernet 6
2. **Front cable:** Blue patch cable → Floor Plan 8 FRONT. FP8-EX6
3. **Panel:** Front and rear are the two sides of the same panel jack. Floor Plan 8 FRONT → Floor Plan 8 REAR
4. **Rear cable:** Floor Plan 8 REAR → OF-WP-RACK · existing Mac Studio jack. Separate rear patch cable to rack-side wall jack. Keep this existing jack exactly where it is.
5. **Wall run:** OF-WP-RACK · existing Mac Studio jack → OF-WP-ROOM-WW · existing jack. Existing in-wall cable.
6. **Room cable:** OF-WP-ROOM-WW · existing jack → meepmax1 · Mac Studio. Separate room patch cable to device Ethernet port.
7. **Label:** FP8-EX6. Label both ends of each new patch cable. Keep the permanent wall-run ID OF-WW-J2.

### OF-SW-J1 · workout room (169) · Apple TV

1. **Source:** Expo · Ethernet 5
2. **Front cable:** Blue patch cable → Floor Plan 7 FRONT. FP7-EX5
3. **Panel:** Front and rear are the two sides of the same panel jack. Floor Plan 7 FRONT → Floor Plan 7 REAR
4. **Rear cable:** Floor Plan 7 REAR → OF-WP-RACK · existing Apple TV jack. Separate rear patch cable to rack-side wall jack. Keep this existing jack exactly where it is.
5. **Wall run:** OF-WP-RACK · existing Apple TV jack → OF-WP-ROOM-SW · existing jack. Existing in-wall cable.
6. **Room cable:** OF-WP-ROOM-SW · existing jack → workout room (169) · Apple TV. Separate room patch cable to device Ethernet port.
7. **Label:** FP7-EX5. Label both ends of each new patch cable. Keep the permanent wall-run ID OF-SW-J1.

### OF-WW-J1 · pc-loadletter · Custom PC

1. **Source:** Expo · Ethernet 3
2. **Front cable:** Blue patch cable → Floor Plan 6 FRONT. FP6-EX3
3. **Panel:** Front and rear are the two sides of the same panel jack. Floor Plan 6 FRONT → Floor Plan 6 REAR
4. **Rear cable:** Floor Plan 6 REAR → OF-WP-RACK · existing PC jack. Separate rear patch cable to rack-side wall jack. Keep this existing jack exactly where it is.
5. **Wall run:** OF-WP-RACK · existing PC jack → OF-WP-ROOM-WW · existing jack. Existing in-wall cable.
6. **Room cable:** OF-WP-ROOM-WW · existing jack → pc-loadletter · Custom PC. Separate room patch cable to device Ethernet port.
7. **Label:** FP6-EX3. Label both ends of each new patch cable. Keep the permanent wall-run ID OF-WW-J1.

### FR-AP · Family room · AP / Orbi satellite

1. **Source:** Main Orbi · existing LAN output
2. **Rack wall plate:** FR-WP-RACK · existing AP jack. Direct patch cable; keep the existing wall jack.
3. **Wall run:** FR-WP-RACK · AP jack → FR-WP-ROOM-WW · existing AP jack
4. **Destination:** Orbi RBS50 satellite · Ethernet
5. **Label:** FR-AP

### C1 · NAS · existing Expo 2 cable

1. **Device:** NAS · preserve the currently connected NAS jack. Keep the exact existing NAS Ethernet socket and cable; upper/lower identity has not been recorded.
2. **Brush:** Up behind rack → through U15 brush → down front
3. **Connection:** Expo · Ethernet 2. Direct cable; no Floor Plan jack or wall plate.

### C2 · NAS · existing Expo 4 cable

1. **Device:** NAS · preserve the currently connected NAS jack. Keep the exact existing NAS Ethernet socket and cable; upper/lower identity has not been recorded.
2. **Brush:** Up behind rack → through U15 brush → down front
3. **Connection:** Expo · Ethernet 4. Direct cable; no Floor Plan jack or wall plate.

### C4 · Hostess to Bouncer · WAN

1. **Source:** Hostess / BGW620 · blue LAN 1
2. **Brush:** Up behind rack → through U15 Brushgate → down front
3. **Connection:** Bouncer · Ethernet 1 (2.5 GbE WAN). Direct Ethernet; no Floor Plan jack.

### C7 · Bouncer to Expo · LAN uplink

1. **Source:** Bouncer · SFP+
2. **Cable:** Green 10 GbE DAC · front of rack
3. **Connection:** Expo · SFP+ 1. The DAC plugs directly into both cages; no Ethernet module, PoE, brush, or Floor Plan jack.

### C5 · Converter to gateway

1. **Source:** Receiving Dock / Q1000K · existing installer Ethernet jack
2. **Cable path:** Keep existing cable behind equipment. No brush or Floor Plan jack.
3. **Connection:** Hostess · red ONT/LAN. Keep the installer connection and sockets. Device: Q1000K · installer jack.

### C6 · Expo 7 / Runner 1

1. **Source:** Expo · Ethernet 7
2. **Front cable:** Direct front patch cable. No brush, Floor Plan jack or wall plate.
3. **Connection:** Runner · Ethernet 1

### WIFI-1 · Bouncer to main Orbi · RBR50

1. **Source:** Bouncer · Ethernet 8 (1 GbE LAN)
2. **Brush:** Up the front → through U15 Brushgate → down behind rack
3. **Connection:** Main Orbi RBR50 · Internet / WAN port. Leave its separate LAN cable to Floor Plan 5 in place.

### OFFICE-SW · Future office switch

1. **Status:** Optional future office switch. Alternative endpoint on OF-WW-J2; not another cable or extra Expo 6 allocation.
2. **Existing path:** Expo 6 → Floor Plan 8 FRONT → Floor Plan 8 REAR → existing Mac Studio jack on OF-WP-RACK
3. **Wall run:** Existing rack-side Mac Studio jack → existing Office West room jack
4. **Room cable:** Existing Office West Mac Studio room jack → TRENDnet Ethernet port. Switch port number is unassigned. When installed, reconnect meepmax1 to another TRENDnet Ethernet port; no new wall run required. Device: TRENDnet TEG-S350.

## Rack-side faceplates

- **OF-WP-RACK**: Keep fixed jack positions (OF-WW-J1, OF-WW-J2, OF-SW-J1, OF-SW-J2).
- **FR-WP-RACK**: Keep fixed jack positions (FR-WW-J1, FR-AP, FR-GA, FR-PS-J1).
- **AVAILABLE-TL**: J4: empty; J3: empty; J2: empty; J1: empty. Available for new work only
- **B2-WP-RACK**: J4: B2-J1; J3: B2-J2; J2: empty; J1: empty. Rightmost two slots shown provisionally; confirm after install
- **B1-WP-RACK**: J4: B1-J2; J3: B1-J1; J2: empty; J1: empty. Rightmost two slots shown provisionally; confirm after install
- **MB-WP-RACK**: J4: P2; J3: P1; J2: MB-J2; J1: MB-J1. P1/P2 positions provisional; trace remote wall jacks after install
- **AVAILABLE-BM**: J4: empty; J3: empty; J2: empty; J1: empty. P · placement; four jacks per plate
- **AVAILABLE-BR**: J4: empty; J3: empty; J2: empty; J1: empty. P · placement; four jacks per plate

## Power and USB connections

- P means Proposed. Outlet labels B1-B6 are applied labels, not factory numbers.
- Owner-confirmed power: wall to UPS; UPS B1 to NAS; UPS B2 to PDU; other rack AC loads and Orbi to PDU.

### UPS-B1 · Waitress · NAS

- Source: UPS Battery/Surge · label B1
- Cable: Original ASUSTOR AC cord and power brick
- Device end: ASUSTOR AS5404T power socket
- Route: Left rear rack post · leave slack at the plugs
- Both-end label: B1 WAITRESS NAS
- Note: B1 is your applied label, not a claimed factory outlet number. Use a socket in the bank marked Battery/Surge. Preserve the original device power supply.

### PDU-5 · Hostess · gateway

- Source: Tecmojo rear outlet 5 / front rocker 5
- Cable: Original AT&T power adapter
- Device end: BGW620-700 power socket
- Route: Left rear rack post · leave slack at the plugs
- Both-end label: PDU5 HOSTESS · GATEWAY
- Note: Original device supply. PDU is fed by UPS Battery/Surge B2.

### PDU-3 · Expo · MikroTik

- Source: Tecmojo rear outlet 3 / front rocker 3
- Cable: Original 24 V MikroTik adapter
- Device end: CRS310 front round DC jack
- Route: Left rear rack post · leave slack at the plugs
- Both-end label: PDU3 EXPO · MIKROTIK
- Note: Original device supply. PDU is fed by UPS Battery/Surge B2.

### PDU-4 · Runner · TP-Link

- Source: Tecmojo rear outlet 4 / front rocker 4
- Cable: Original TP-Link AC cord
- Device end: TL-SG1016DE AC power inlet
- Route: Left rear rack post · leave slack at the plugs
- Both-end label: PDU4 RUNNER · TP-LINK
- Note: Original device supply. PDU is fed by UPS Battery/Surge B2.

### PDU-1 · Receiving Dock · converter

- Source: Tecmojo rear outlet 1 / front rocker 1
- Cable: Original Q1000K power adapter
- Device end: Q1000K power socket
- Route: Left rear rack post · leave slack at the plugs
- Both-end label: PDU1 RECEIVING DOCK · CONVERTER
- Note: Large plug reported by owner. Place Receiving Dock at end outlet1; leave outlet2 clear. If plug shape still obstructs insertion, use a short grounded single-outlet extension, or temporary UPS Battery/Surge B3 as owner allowed. No physical fit test is claimed.

### PDU-6 · SmartThings

- Source: Tecmojo rear outlet 6 / front rocker 6
- Cable: Original Samsung adapter
- Device end: SmartThings DC power socket
- Route: Left rear rack post · support the adapter beside the strip
- Both-end label: PDU6 SMARTTHINGS
- Note: Original adapter at PDU6 is fallback until USB cable is obtained and tested. Exact cable found: Konnected USB TypeA to5V 5.5x2.1mm barrel, explicitly SmartThingsv3 compatible. Select the USB-A1 proposal for instructions. Do not connect both power sources at once.

### FEED-UPS · UPS supply

- Source: Grounded wall outlet
- Cable: Original captive UPS cord
- Device end: CP1500AVRLCD3 input cord
- Route: Above rack feet · no tension at the wall plug
- Both-end label: UPS FEED
- Note: Proposed source from the existing rack guide. UPS remains upright beside the rack.

### FEED-PDU · PDU supply

- Source: UPS Battery/Surge · applied label B2
- Cable: Original captive PDU cord
- Device end: Tecmojo input cord
- Route: Left rear rack post · above the rack feet
- Both-end label: PDU FEED
- Note: Owner-confirmed arrangement: PDU into UPS B2. NAS alone uses UPS B1 directly. All other rack AC loads use the PDU; this records the chosen topology, not a new manufacturer compatibility certification.

### USB-SONOFF · SONOFF data + power

- Source: NAS original USB-A data port
- Cable: USB-A to USB-C data cable
- Device end: SONOFF DONGLE-M USB-C
- Route: Keep radio and antenna clear of metal and the AC bundle
- Both-end label: SONOFF DATA
- Note: Existing documented USB mode. Keep the NAS data connection; do not move it to a charging-only outlet. Home Assistant moving to Raspberry Pi would require a separately documented USB migration.

### ROOM-PWR · Office room switch

- Source: Office grounded wall outlet
- Cable: Original TRENDnet adapter
- Device end: TRENDnet TEG-S350 DC input
- Route: At Computer / West beside the future room switch
- Both-end label: OFFICE SWITCH POWER
- Note: Proposed room-side power. No rack PDU outlet is used for this room device.

### PDU-8 · Orbi · existing location

- Source: Tecmojo rear outlet 8 / front rocker 8
- Cable: Original Orbi adapter and existing routed power lead
- Device end: Orbi existing DC power input
- Route: Retain present Orbi position away from rack; route its power to PDU without moving its Ethernet
- Both-end label: PDU8 ORBI · EXISTING LOCATION
- Note: Large plug reported by owner. Use outlet8, where manufacturer image shows52mm spacing on both sides; keep7 and9 clear. Support adapter. If shape still prevents fit, use short grounded single-outlet extension or temporary UPS Battery/Surge B4.

- UPS B3-B6 and surge-only S1-S6: available.
- PDU2/7/9 kept clear for large adapters. Future Pis have no power assignments.
- PDU USB-A1/A2/C1/C2: unassigned charging sockets, not USB data paths.

## SmartThings USB proposal

- PDU front USB-A1 · proposed test
- Konnected USB-A to5V DC barrel · 5.5mm outer / 2.1mm inner · center positive · 1m
- Cable manufacturer explicitly supports SmartThings Hubv2/v3. FCC applicant photo of original MLF-B250502000CU adapter confirms5V2A and center-positive polarity. Connector research is resolved; no user measurement needed. PDU manual lists3A shared at5V; hub reports2A. This fits the total current budget with other USB sockets empty, but individual-port continuous rating is unpublished. Proposed power-up test only: obtain cable, disconnect original hub adapter, connect USB-A1, check stable boot and operation. If it fails to start or restarts, restore original adapter at PDU6. No successful PDU/hub test is claimed.
- Cable source: https://konnected.io/products/usb-to-5v-dc-barrel-jack-power-cable

## Future devices - no outlets assigned

- The Safe: Future device · not present
- Second Raspberry Pi: Future device · not present

## USB power review

- pdu: Front product photo marked CHARGER(PD20W); manual gives shared5V/3A20W MAX, no individual-port rating. 2A hub fits3A shared budget alone, but per-port stability must be tested. No demonstrated test claimed.
- pi: Pi 400: 5 V / 3 A; official supply 5.1 V / 3 A. Keep matching supply until a dedicated PDU output is verified.
- smartthings: Resolved:5V, at least2A source,5.5x2.1mm center-positive barrel. Konnected exact USB-A cable explicitly supports SmartThingsv3. PDU USB-A1 is a proposed test; other charging ports empty; original adapterPDU6 fallback.
- sonoff: NAS USB data and power remain together; never move to charging-only PDU.
- ups source: https://www.cyberpowersystems.com/product/ups/intelligent-lcd/cp1500avrlcd3/
- pdu source: https://cdn.shopify.com/s/files/1/0923/0001/7947/files/13110902_2025.04.15_D.1.08.098.108098206_TEC-SMS-231005.pdf?v=1759803230
- pi source: https://www.raspberrypi.com/products/type-c-power-supply/
- smartthingsCable source: https://konnected.io/products/usb-to-5v-dc-barrel-jack-power-cable
- outletSpacing source: https://tecmojo.com/cdn/shop/files/13110902__5.jpg?v=1777339751&width=2000
- smartthingsOriginalAdapter source: https://fccid.io/2AF4S-STH-ETH-300/External-Photos/External-Photos-3832130.pdf

## Scope

- Physical equipment placement, cables and power only. Internet settings and automatic shutdown are outside this build.
- Existing wall plates and jack positions are fixed. Only new runs receive proposed jack positions.
- Sockets 1-4 remain available. Runner2-16 connect to panel10-24; office panel6-9; Orbi AP panel5.
- Garage has one record: FR-GA. No new garage cable proposed.

## Physical photo inventory

See the private photo inventory retained with the source records for source photos and unresolved wall-jack identities.
- Mixed HDMI/Ethernet/coax plate remains unused; no cable cutting or reworking needed.
- Garage remains lowest priority.
