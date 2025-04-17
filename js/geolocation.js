function initLocation(map) {
  let userMarker = null;
  let userCircle = null;

  window.askLocation = function () {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    // Ask for permission first
    navigator.geolocation.getCurrentPosition(
      () => {
        // If permission granted, start watching position
        navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            if (!userMarker) {
              userMarker = L.marker([lat, lon]).addTo(map);
            }

            userMarker.setLatLng([lat, lon]);
            userMarker.bindPopup(`📍 You: ${lat.toFixed(5)}, ${lon.toFixed(5)}`).openPopup();

            if (userCircle) map.removeLayer(userCircle);

            userCircle = L.circle([lat, lon], {
              radius: position.coords.accuracy,
              color: '#3388ff',
              fillColor: '#3388ff',
              fillOpacity: 0.2
            }).addTo(map);
          },
          (err) => alert("Error watching position: " + err.message),
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
          }
        );
      },
      (err) => {
        alert("Permission denied or error: " + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
}
