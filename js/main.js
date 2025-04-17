
const map = L.map('map', {
  center: [36.709639, 3.164972],
  zoom: 20,
  maxZoom: 22,
  minZoom: 2
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & CartoDB',
  maxZoom: 22
}).addTo(map);

initLocation(map);
initZoomHandler(map);
initGridDrawing(map);
initRoomHandler(map);
