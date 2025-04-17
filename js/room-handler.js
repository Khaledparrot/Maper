function initRoomHandler(map) {
  if (!window.nodeLayer) {
    window.nodeLayer = L.layerGroup().addTo(map);
  }

  let roomPolygon = null;

  window.startRoomDrawing = function () {
    map.addControl(new L.Control.Draw({
      edit: { featureGroup: new L.FeatureGroup().addTo(map) },
      draw: { polygon: { allowIntersection: false, shapeOptions: { color: 'blue' } } }
    }));
  };

  map.on(L.Draw.Event.CREATED, function (e) {
    nodeLayer.clearLayers();
    roomPolygon = e.layer;
    map.addLayer(roomPolygon);
    document.getElementById("selectNodeBtn").style.display = "inline-block";
    generateNodes(map, roomPolygon);
  });

  window.enableNodeSelection = function () {
    alert("📍 Click a red node inside your room to measure distances.");
  };

  function generateNodes(map, roomPolygon) {
    const spacingMeters = 2;
    const meterToDegreeLat = 1 / 111320;
    const spacingLat = spacingMeters * meterToDegreeLat;
    const spacingLon = spacingMeters * (1 / (111320 * Math.cos(map.getCenter().lat * Math.PI / 180)));

    const bounds = roomPolygon.getBounds();
    const center = bounds.getCenter();

    const baseLat = center.lat - ((center.lat - spacingLat) % spacingLat);
    const baseLon = center.lng - ((center.lng - spacingLon) % spacingLon);

    for (let lat = baseLat - spacingLat; lat < bounds.getNorth() + spacingLat; lat += spacingLat) {
      for (let lon = baseLon - spacingLon; lon < bounds.getEast() + spacingLon; lon += spacingLon) {
        const point = L.latLng(lat, lon);
        if (roomPolygon.getBounds().contains(point)) {
          L.circleMarker(point, { radius: 6, color: 'red', fillColor: 'red', fillOpacity: 1 })
            .addTo(nodeLayer)
            .on('click', () => measureToWalls(map, point, roomPolygon));
        }
      }
    }
  }

  function measureToWalls(map, nodeLatLng, roomPolygon) {
    const roomPoints = roomPolygon.getLatLngs()[0];
    const distances = [];

    for (let i = 0; i < roomPoints.length; i++) {
      const p1 = roomPoints[i];
      const p2 = roomPoints[(i + 1) % roomPoints.length];
      const d = distanceToLine(map, nodeLatLng, p1, p2);
      distances.push(`🧱 Wall ${i + 1}: ${d.toFixed(2)}m`);
    }

    L.popup().setLatLng(nodeLatLng).setContent(distances.join("<br>")).openOn(map);
  }

  function distanceToLine(map, p, v, w) {
    const px = map.latLngToLayerPoint(p);
    const pv = map.latLngToLayerPoint(v);
    const pw = map.latLngToLayerPoint(w);

    let t = ((px.x - pv.x) * (pw.x - pv.x) + (px.y - pv.y) * (pw.y - pv.y)) / Math.pow(pv.distanceTo(pw), 2);
    t = Math.max(0, Math.min(1, t));

    const proj = L.point(pv.x + t * (pw.x - pv.x), pv.y + t * (pw.y - pv.y));
    return map.layerPointToLatLng(proj).distanceTo(p);
  }
}
