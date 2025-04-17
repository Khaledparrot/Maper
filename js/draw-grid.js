let gridLayer;
let nodeLayer;
let gridNodes = [];

function drawGlobalGrid(map) {
  if (!gridLayer) gridLayer = L.layerGroup().addTo(map);
  if (!nodeLayer) nodeLayer = L.layerGroup().addTo(map);

  gridLayer.clearLayers();
  nodeLayer.clearLayers();
  gridNodes = [];

  const spacingMeters = 2;
  const meterToDegLat = 1 / 111320;
  const spacingLat = spacingMeters * meterToDegLat;
  const centerLat = map.getCenter().lat;
  const spacingLon = spacingMeters * (1 / (111320 * Math.cos(centerLat * Math.PI / 180)));

  const bounds = map.getBounds();
  const latMin = bounds.getSouth();
  const latMax = bounds.getNorth();
  const lonMin = bounds.getWest();
  const lonMax = bounds.getEast();

  // Draw horizontal lines
  for (let lat = latMin; lat <= latMax; lat += spacingLat) {
    L.polyline([[lat, lonMin], [lat, lonMax]], { color: '#00ff00', weight: 0.5 }).addTo(gridLayer);
  }

  // Draw vertical lines and store nodes
  for (let lon = lonMin; lon <= lonMax; lon += spacingLon) {
    L.polyline([[latMin, lon], [latMax, lon]], { color: '#00ff00', weight: 0.5 }).addTo(gridLayer);
  }

  // Generate grid nodes (intersections)
  for (let lat = latMin; lat <= latMax; lat += spacingLat) {
    for (let lon = lonMin; lon <= lonMax; lon += spacingLon) {
      gridNodes.push([lat, lon]);
    }
  }
}

function drawRedNodesInsideRoom(roomPolygon, onClick) {
  if (!nodeLayer) return;

  nodeLayer.clearLayers();

  gridNodes.forEach(([lat, lon]) => {
    const point = [lat, lon];
    if (L.polygon(roomPolygon).getBounds().contains(point)) {
      const node = L.circleMarker(point, {
        radius: 5,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.8
      }).addTo(nodeLayer);

      if (onClick) {
        node.on('click', () => onClick(lat, lon));
      }
    }
  });
}

function initGridDrawing(map) {
  drawGlobalGrid(map);

  map.on('zoomend moveend', () => {
    drawGlobalGrid(map);
  });
}

export { initGridDrawing, drawRedNodesInsideRoom };
