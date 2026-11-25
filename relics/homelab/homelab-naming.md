# Floor Plan naming and sources

Deacon + dot · Dot-Ref: DOT-20261125-FLOORPLAN

- **Floor Plan:** the 24-port patch panel. Fill from the right: highest numbered port first.
- **Bouncer:** RB5009 router and firewall. **Hostess:** AT&T gateway. **Expo:** MikroTik core switch. **Runner:** TP-Link 16-port switch. **Brushgate:** upper brush. **Waitress:** NAS.
- **Blue** for office runs, **yellow** for family/garage and Orbi, **orange** for Guest/Jayce, **white** for Master/P1/P2, **purple** for rack-area and Brushgate links except the yellow Orbi run, **green** for the SFP+ DAC.
- **OF**: Office; **FR**: Family room; **MB**: Master; **B1**: Jayce; **B2**: Guest. WW/SW identify walls, PS the plant shelf. RACK and ROOM distinguish wall-run ends. Keep the connection ID even when a patch-panel port changes.
- **FP** refers to a Floor Plan port; **R** in a patch-cable label refers to a Runner port. **P1/P2** are prepared wall-run IDs, not panel positions or installed-status marks.
- Use [the port map and connection record](homelab-patch-panel.md) for current assignments and [the labels page](homelab-labels.html) for print labels. Actual cable completion is recorded separately.

## Updating the map

Keep [homelab-connections.json](homelab-connections.json) as the machine-readable register. Match the workbench's embedded data to it for offline use. Derive wiring tables and print labels from those same records. Validate unique Floor Plan and switch sockets, keep stable wall-run IDs, and check the offline ZIP matches the published files before pushing.
