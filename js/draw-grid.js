function drawGlobalGrid(map) {
  if (!window.gridLayer) {
    window.gridLayer = L.layerGroup().addTo(map);
  } else {
    gridLayer.clearLayers();
  }

  const spacingMeters = 2;
  const meterToDegreeLat = 1 / 111320;
  const spacingLat = spacingMeters * meterToDegreeLat;
  const spacingLon = spacingMeters * (1 / (111320 * Math.cos(map.getCenter().lat * Math.PI / 180)));

  const bounds = map.getBounds();

  for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += spacingLat) {
    L.polyline([[lat, bounds.getWest()], [lat, bounds.getEast()]], { color: '#00ff00', weight: 0.5 }).addTo(gridLayer);
  }

  for (let lon = bounds.getWest(); lon < bounds.getEast(); lon += spacingLon) {
    L.polyline([[bounds.getSouth(), lon], [bounds.getNorth(), lon]], { color: '#00ff00', weight: 0.5 }).addTo(gridLayer);
  }
}

function initGridDrawing(map) {
  drawGlobalGrid(map);
}
