# Naming and layout decisions — November 24, 2026

- OF: Office
- FR: Family room
- MB: Master bedroom
- B1: Bedroom 1
- B2: Guest bedroom
- WW: West wall
- SW: South wall
- PS: Plant shelf at the south side of the family-room West wall
- RACK: Wall plate beside rack
- ROOM: Wall plate in room
- J1–J4: Jack within plate
- PP1–PP24: Physical patch-panel socket
- P: Proposed status; never part of the permanent physical identifier

## Example — meepmax1 / Mac Studio

- Run: OF-WW-J2
- Switch: Expo Ethernet 8 — preserve
- Panel: PP23 — proposed
- Rack wall plate: OF-WP-RACK-WW-J2 — proposed
- Room wall plate: OF-WP-ROOM-WW-J2 — proposed jack choice
- Device: meepmax1 / Mac Studio
- Historical aliases: m1meepmax, OF-W2
- Future office switch adds a route station; permanent wall-run labels stay the same.

## Physical layout

- Expo mounted LEFT — completed by owner.
- Runner chassis centered; socket block on RIGHT — confirmed from photo.
- Panel 17–24: existing connections, working from right to left.
- Panel 11–16: proposed bedroom connections.
- Panel 1–10: available at accessible left.
- Earlier alternate office sockets had no verified clearance benefit.
- Current placement prioritizes access to future terminations over shortest front jumpers.
- Existing Expo assignments are preserved even though Expo moved left.
- Colors identify connections; they do not dictate blocks of four.

## Scope and evidence

- Owner confirmed physical arrangement and desired power topology.
- Exact final wall-jack choices can be entered during installation.
- FR-GA is the sole existing garage cable, previously unidentified; condition untested.
- Orbi retains its present Ethernet path and position; no new physical Ethernet link is invented.
- NAS retains its exact existing two cables and Expo sockets 2 / 4.
- Internet configuration and automatic shutdown are outside this task.
- Pi 400 remains future office equipment and uses office power, like the future office switch.
- PDU feeds all rack AC loads except NAS, plus existing Orbi; PDU input is UPS B2.
- This records the owner's chosen PDU/UPS topology; it does not certify manufacturer compatibility.

## Data source

- homelab-connections.json is the full structured source delivered with this map.
- The standalone HTML embeds the same data so local opening requires no server.
- homelab-patch-panel.md is the readable connection record.
- Local installation notes are separate from the published proposed layout.

## USB power references

- Tecmojo manual states shared USB output 5 Vdc / 3 A, 20 W max; individual-port simultaneous output is not specified.
- Raspberry Pi 400 needs 5 V / 3 A; official supply is 5.1 V / 3 A.
- Do not treat a USB connector alone as proof of compatible power.
- SmartThings uses its DC input; SONOFF requires the existing NAS data connection.
- [Tecmojo manual](https://cdn.shopify.com/s/files/1/0923/0001/7947/files/13110902_2025.04.15_D.1.08.098.108098206_TEC-SMS-231005.pdf?v=1759803230)
- [Raspberry Pi supply](https://www.raspberrypi.com/products/type-c-power-supply/)
