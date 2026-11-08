---
name: simulator-check
description: Run the app in Expo Go on the iOS Simulator, open screens by deep link, take screenshots, check landscape, and add temporary logging. Use to confirm a visible or runtime change in the real app.
---

## Start

1. Check the port is free: `lsof -nP -iTCP:8090 -sTCP:LISTEN`. Never reuse or kill a server you
   didn't start (see `CLAUDE.local.md`).
2. Start Metro in the background, logging to the scratchpad:
   `CI=1 nohup npx expo start --port 8090 > <scratchpad>/metro.log 2>&1 &`
   Wait until `curl -s localhost:8090/status` says `packager-status:running`.
3. `CI=1` disables reloads. **Restart Metro after every code change.**

## Open screens

- Get the booted device: `xcrun simctl list devices booted`.
- Relaunch cleanly: `xcrun simctl terminate <device> host.exp.Exponent`, then
  `xcrun simctl openurl <device> "exp://127.0.0.1:8090/--/"`. Allow about 20 seconds for the
  first bundle.
- Deep links: `/--/movie/<imdbId>` and `/--/collection/<collectionId>`. A deep-linked screen has
  no Home underneath, so there is no back button.
- Screenshot: `xcrun simctl io <device> screenshot <scratchpad>/<name>.png`, then read the image.

## Landscape

The simulator can't be rotated from the terminal. To see a screen sideways, temporarily add
`"orientation": "landscape"` to `app.json`, restart Metro, relaunch and screenshot. Then copy back
the saved `app.json` and confirm with `diff`.

Landscape screenshots come out sideways. Rotate them with `sips -r 90` or `sips -r 270` before
judging the layout.

## Temporary logging

1. Copy the file to the scratchpad.
2. Add `console.log('[probe] ...')`. To see when values change without disturbing React
   Compiler, use `useEffect(() => console.log(...), [value])`.
3. Restart Metro, run the scenario, then read the lines with `grep '\[probe\]' <metro log>`.
4. Copy the saved file back, `diff` it to confirm, and `grep -rn probe src` to confirm nothing is
   left.

## Finish

Stop only the Metro process you started: `kill $(lsof -nP -tiTCP:8090 -sTCP:LISTEN)`. Report what
was seen, and what wasn't covered: real rotation, real taps or scrolling, Android.
