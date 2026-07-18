---
name: premium-map-ux
description: |
  Best practices for building premium, highly-interactive Maplibre / React-Map-GL maps.
  Trigger when:
  - Asked to improve map UX or map popups.
  - Building a new map component with markers and popups.
  - Fixing map popup clipping or cutoff issues.
---

# Premium Map UX Guidelines

When building maps using `react-map-gl` (Mapbox or Maplibre), always adhere to these best practices to ensure a highly polished, interactive experience.

## 1. Avoid Popup Clipping (No overflow: hidden)

**Problem:** Popups that open near the edge of a map container often get clipped if the map's wrapper `div` uses `overflow: hidden` (e.g., to achieve rounded corners).

**Solution:** Do not use `overflow: hidden` on the map wrapper. Instead, apply the `border-radius` directly to the map canvas classes via a scoped CSS file.

```css
/* Apply border radius directly to the internal Maplibre canvas */
.my-map-wrapper .maplibregl-map,
.my-map-wrapper .maplibregl-canvas,
.my-map-wrapper .maplibregl-canvas-container {
  border-radius: 16px;
}

/* Ensure the popup itself isn't forced to crop if it hits an edge */
.my-map-popup .maplibregl-popup-content {
  background: transparent;
  padding: 0;
  box-shadow: none;
}
```

## 2. Dynamic Anchoring

**Problem:** Hardcoding `anchor="bottom"` on a `Popup` forces it to always open upwards. If the marker is at the top of the viewport, the popup goes off-screen.

**Solution:** Omit the `anchor` prop entirely or set it dynamically. By omitting it, Maplibre will automatically calculate the side with the most available space.

```tsx
<Popup
  longitude={marker.longitude}
  latitude={marker.latitude}
  // Remove `anchor="bottom"` to allow auto-anchoring
  offset={[0, -20]}
>
```

## 3. Fly-to Center on Click

**Problem:** Clicking a marker opens a popup but leaves the camera static. If the marker is at the edge of the screen, the popup may still be hard to read or partially obscured by HUD elements.

**Solution:** Always attach a `useRef<MapRef>` to the `MapGL` component. When a marker is clicked, trigger a `.flyTo()` animation to center the camera on the marker.

```tsx
import type { MapRef } from 'react-map-gl';

const mapRef = useRef<MapRef>(null);

// Inside your Marker onClick:
onClick={(e) => {
  e.originalEvent.stopPropagation();
  setSelectedMarker(m);
  
  // Fly to the marker and offset it slightly to make room for the popup
  mapRef.current?.flyTo({
    center: [m.longitude, m.latitude],
    zoom: Math.max(10, currentZoom + 2), // zoom in slightly
    duration: 1200,
    offset: [0, 80] // Shift the center down by 80px
  });
}}
```

## 4. Dynamic Viewport Bounds

**Problem:** Hardcoding initial zoom (e.g., `zoom: 9`) causes maps to be either too zoomed out or too zoomed in depending on how far apart the markers are.

**Solution:** Calculate the bounding box (`minLng`, `maxLng`, `minLat`, `maxLat`) of all markers. Use the differences to dynamically estimate the optimal zoom level, clamping it to sensible minimums and maximums (e.g., between 3 and 14).
