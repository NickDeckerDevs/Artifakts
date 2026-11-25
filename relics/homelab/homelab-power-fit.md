# Power plan — present equipment and resolved research

> Deacon + dot · Dot-Ref: DOT-20261125-FLOORPLAN

Bouncer receives no PoE from Expo. Side-terminal power is a separate 24–57 V DC feed; the supplied 24 V brick can use an appropriately sized, correctly polarized female-to-two-wire pigtail. No Bouncer PDU outlet assignment is recorded here.

> Deacon + dot · Dot-Ref: DOT-20261125-RACKAUDIT

## Equipment to connect now

- UPS B1: NAS original supply.
- UPS B2: PDU input cord.
- PDU1: Receiving Dock / Q1000K original large adapter.
- PDU2: keep clear for Receiving Dock.
- PDU3: Expo original adapter.
- PDU4: Runner original AC cord.
- PDU5: gateway original adapter.
- PDU6: SmartThings original adapter, until its USB alternative is tested.
- PDU7: keep clear for Orbi.
- PDU8: main Orbi original large adapter.
- PDU9: keep clear for Orbi.
- The Safe and Raspberry Pi 400: future devices, no power outlet assignments.
- Prepared Ethernet cables for future devices do not imply present power loads.

## SmartThings — exact USB cable found

- Hub family: Samsung SmartThings V3 / GP-U999SJVLGDA.
- Supply: 5V DC, source capable of at least2A.
- Connector: 5.5mm outer / 2.1mm inner barrel.
- Polarity: center positive.
- Original adapter: MLF-B250502000CU.
- Original adapter label in Samsung’s FCC applicant photos confirms5V2A and center-positive polarity.
- Konnected explicitly lists its USB-A to5V barrel cable as compatible with SmartThings Hubv2/v3.
- Exact cable: [Konnected USB to5V DC barrel cable](https://konnected.io/products/usb-to-5v-dc-barrel-jack-power-cable).
- [Original adapter evidence, page4](https://fccid.io/2AF4S-STH-ETH-300/External-Photos/External-Photos-3832130.pdf).
- [Aeotec V3 manufacturer connector corroboration](https://aeotec.freshdesk.com/support/solutions/articles/6000240466-smart-home-hub-technical-specifications).
- These are researched specifications, not measurements the owner needs to supply.

## PDU USB recommendation and its actual limit

- Proposed socket: USB-A1, using the exact compatible cable above.
- This cable is not assumed to be owned or installed.
- Leave the other three PDU charging sockets empty during the initial test.
- Published shared output is5V/3A; a2A hub is within that total current budget alone.
- The exact-model manual also prints20W, and product photographs show CHARGER(PD20W).
- The manufacturer does not publish an individual USB-A continuous-current rating or simultaneous allocation.
- Therefore the hub/cable compatibility is established; this particular PDU/hub pairing is not verified by published specs alone.
- Proposed power-up test: disconnect original hub adapter, connect USB-A1 through the compatible cable to its DC barrel input, check stable boot and normal operation.
- If it fails to start or restarts, restore the original adapter at PDU6.
- No dual powering and no cable into the hub’s USB-A host socket.
- No successful physical test has been performed or claimed.
- [Exact-model manual](https://cdn.shopify.com/s/files/1/0923/0001/7947/files/13110902_2025.04.15_D.1.08.098.108098206_TEC-SMS-231005.pdf?v=1759803230).

## Large-plug placement

- Manufacturer rear photograph shows52mm gaps from8 to7 and8 to9, versus36mm between7 and6.
- Orbi uses8 with7/9 clear.
- Receiving Dock uses end outlet1 with2 clear.
- This creates space rather than filling adjacent positions with future devices.
- Exact installed adapter shapes have not been physically tested against these sockets.
- If a plug still cannot seat, use a short grounded single-outlet extension and support the adapter on the shelf.
- Owner-authorized temporary fallback: free UPS Battery/Surge sockets B3/B4 for those large adapters until the short leads are available.
- [Manufacturer rear-spacing diagram](https://tecmojo.com/cdn/shop/files/13110902__5.jpg?v=1777339751&width=2000).

## Future devices

- The Safe: future only, no AC or USB assignment.
- Raspberry Pi 400 and Future Rack: no AC or USB assignment recorded.
- Pi400 supply requirements remain reference information only, not a present installed load.
