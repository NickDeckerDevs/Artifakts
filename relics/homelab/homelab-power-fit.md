# Power connections — fit and USB review

- Network layout published separately first.
- Original adapters remain usable while checking USB alternatives.
- A USB socket alone does not establish compatible power.

## SmartThings — Samsung GP-U999SJVLGDA

- Reported input: 5 V / 2 A.
- A USB-to-DC-barrel cable could power it from a suitable PDU charging socket.
- Its USB-A socket is not the power input.
- Before choosing that cable: confirm barrel size and center polarity.
- Before using the PDU: confirm its individual USB socket can supply 2 A.
- Current usable connection: original Samsung adapter in PDU 8.
- [Samsung hub reference](https://www.samsung.com/nz/smartthings/hub/smartthings-v3-hub-gp-u999sjvlgaa/)

## Tecmojo 13110902 — shared USB supply

- Its manual prints a shared total of “5Vdc/3A 20W MAX.”
- Those numbers are inconsistent: 5 V multiplied by 3 A is 15 W.
- It does not specify a guaranteed output for each socket when several are used.
- A 2 A hub is plausible by itself, subject to the socket and cable checks above.
- Do not assume the shared charging section can supply both a 2 A hub and a 3 A Pi simultaneously.
- [Exact-model manual](https://cdn.shopify.com/s/files/1/0923/0001/7947/files/13110902_2025.04.15_D.1.08.098.108098206_TEC-SMS-231005.pdf?v=1759803230)

## The Safe — Raspberry Pi 400

- Required supply class: 5 V / 3 A through USB-C.
- Official adapter output: 5.1 V / 3 A.
- This is the same recommended supply class as a Pi 4.
- Its keyboard does not automatically make PDU USB unsuitable.
- A suitable verified USB-C output and cable could work.
- This PDU’s shared specification does not establish that output on one socket.
- Current usable option: matching Pi USB-C power adapter.
- Rack-side network connection is prepared; use matching Pi supply in PDU1. Second Pi supply has PDU6 reserved.
- [Official Raspberry Pi supply](https://www.raspberrypi.com/products/type-c-power-supply/)
- [Power requirements](https://www.raspberrypi.com/documentation/computers/getting-started.html)

## Second Raspberry Pi

- Network cable is prepared at Runner 4 / Floor Plan 12.
- Power depends on the model eventually installed.
- Keep its power assignment open until the model is known.

## Other original supplies

- Expo / MikroTik CRS310: 24 V / 1.5 A adapter.
- Ordinary 5 V PDU USB cannot replace that supply.
- [MikroTik specifications](https://mikrotik.com/product/crs310_8g_2s_in)

- Runner / TL-SG1016DE: built-in AC power supply.
- Its original AC cord goes into the PDU; there is no external DC brick.
- [TP-Link datasheet](https://static.tp-link.com/upload/product-overview/2024/202401/20240119/TL-SG1016DE%28UN%297.0_datasheet.pdf)

- Receiving Dock / Q1000K: 12 V / 1.5 A adapter.
- Ordinary 5 V PDU USB cannot replace that supply.
- [Quantum Fiber datasheet](https://www.quantumfiber.com/content/dam/quantumfiber/equipment/downloads/Q1000_DataSheet_071024_final.pdf)

- Hostess / BGW620-700: documented Delta ADH-72BR desktop supply, 12 V / 6 A.
- That is adapter capacity, not measured operating consumption.
- [Manufacturer guide in FCC filing](https://fccid.io/m/78ad803e4e9e2edac18d8944727487f9ef8c20a0961e07c9a04dc686746c296a.pdf)

- Main Orbi / RBR50: original 12 V supply; NETGEAR specifies 3.5 A for RBR50.
- Family Orbi / RBS50: retain its own original adapter at its existing location.
- Ordinary 5 V USB cannot replace these supplies.
- [NETGEAR manual](https://www.downloads.netgear.com/files/GDC/RBK50/Orbi_UM_EN.pdf)

## Making room for large plugs

- A short, appropriately rated single-outlet extension lead can move a bulky adapter away from neighboring PDU sockets.
- Support the adapter on a shelf or rear support.
- Do not hang the adapter’s weight from its socket or cable.
- Published specifications did not establish exact plug dimensions or orientation for every adapter.
- Check physical fit while placing the equipment.
- The owner permits a temporary direct-UPS connection while obtaining the needed leads.

## Remaining checks for power only

- SmartThings barrel dimensions and polarity.
- PDU individual USB-socket output.
- Second Pi model.
- Actual adapter fit and any short extension leads required.
- None of these changes the prepared Ethernet map.
