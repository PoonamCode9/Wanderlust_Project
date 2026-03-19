let map_Token = mapToken;

var map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${map_Token}`, // stylesheet location
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

console.log(listing.geometry.coordinates);

const marker = new maplibregl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)  // listing.geometry.coordinates
  .setPopup(new maplibregl.Popup({offset: 25})
  .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`))
  .addTo(map);
