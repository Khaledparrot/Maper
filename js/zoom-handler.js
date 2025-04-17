function initZoomHandler(map) {
  map.on('moveend zoomend', () => {
    if (typeof drawGlobalGrid === "function") {
      drawGlobalGrid(map);
    }
  });
}
