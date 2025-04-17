function initRoomHandler(map) {
  if (!window.nodeLayer) {
    window.nodeLayer = L.layerGroup().addTo(map);
  }

  let roomPolygon = null;

  window.startRoomDrawing = function () {
    const drawControl = new L.Control.Draw({
      draw: { polygon: { allowIntersection: false, shapeOptions: { color: 'blue' } } },
      edit: { featureGroup: new L.FeatureGroup() }
    });
    map.addControl(drawControl);
  };

  map.on(L.Draw.Event.CREATED, function (e) {
    nodeLayer.clearLayers();
    if (roomPolygon) map.removeLayer(roomPolygon);
    roomPolygon = e.layer;
    map.addLayer(roomPolygon);
    document.getElementById("selectNodeBtn").style.display = "inline-block";
    generateNodesInRoom(map, roomPolygon);
  });

  window.enableNodeSelection = function () {
    alert("📍 Click a red node inside your room to measure distances.");
  };

  function generateNodesInRoom(map, polygon) {
    const bounds = polygon.getBounds();
    const spacingMeters = 2;
    const spacingLat = spacingMeters / 111320;
    const spacingLon = spacingMeters / (111320 * Math.cos(map.getCenter().lat * Math.PI / 180));

    for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += spacingLat) {
      for (let lon = bounds.getWest(); lon < bounds.getEast(); lon += spacingLon) {
        const point = L.latLng(lat, lon);
        if (polygon.getBounds().contains(point)) {
          L.circleMarker(point, { radius: 6, color: 'red', fillColor: 'red', fillOpacity: 1 })
            .addTo(nodeLayer)
            .on('click', () => showDistances(map, point, polygon));
        }
      }
    }
  }

  function showDistances(map, point, polygon) {
    const pts = polygon.getLatLngs()[0];
    const distances = [];

    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const dist = pointToSegmentDist(map, point, p1, p2);
      distances.push(`Wall ${i + 1}: ${dist.toFixed(2)} m`);
    }

    L.popup().setLatLng(point).setContent(distances.join("<br>")).openOn(map);
  }

  function pointToSegmentDist(map, p, v, w) {
    const px = map.latLngToLayerPoint(p);
    const vpt = map.latLngToLayerPoint(v);
    const wpt = map.latLngToLayerPoint(w);

    let t = ((px.x - vpt.x) * (wpt.x - vpt.x) + (px.y - vpt.y) * (wpt.y - vpt.y)) / Math.pow(vpt.distanceTo(wpt), 2);
    t = Math.max(0, Math.min(1, t));

    const proj = L.point(vpt.x + t * (wpt.x - vpt.x), vpt.y + t * (wpt.y - vpt.y));
    return map.layerPointToLatLng(proj).distanceTo(p);
  }
}