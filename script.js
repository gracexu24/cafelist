let map;
let center;

// Initialize map
async function initMap(x, y) {
  const { Map } = await google.maps.importLibrary("maps");

  center = { lat: x, lng: y };
  map = new Map(document.getElementById("map"), {
    center: center,
    zoom: 10, //this zoom doesnt matter bc we expand the boundaries when we add markers
    mapId: "DEMO_MAP_ID",
  });
}

// fetches places
async function fetchPlaces(position) {
  const { Place } = await google.maps.importLibrary("places");
    const request = {
      textQuery: "cafe",
      fields: ["displayName", "location", "businessStatus"],
      locationBias: { lat: position.coords.latitude, lng: position.coords.longitude },
      language: "en-US",
      minRating: 3.2,
      region: "us",
      useStrictTypeFiltering: false,
    };
    
    const { places } = await Place.searchByText(request);

    if (places.length) {
      addMarkers(places);
      display(places);
    } else {
      console.log("No results");
    }
}

// add marker for each place
async function addMarkers(places) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { LatLngBounds } = await google.maps.importLibrary("core");
  const bounds = new LatLngBounds();

  places.forEach((place) => {
    const markerView = new AdvancedMarkerElement({
      map,
      position: place.location,
      title: place.displayName,
    });

    bounds.extend(place.location);
    console.log(place.displayName);
  });

  map.fitBounds(bounds);
}

// display places on the DOM
function display(places) {
  const container = document.querySelector('ul');
  
  places.forEach(place => {
    const listItem = document.createElement('li');

    const textItem = document.createElement('p');
    textItem.textContent = place.displayName;
    listItem.appendChild(textItem);

    const likeButton = document.createElement('button');
    likeButton.textContent = 'heart';
    listItem.appendChild(likeButton);

    container.appendChild(listItem);
  });
}

// creates map and gets places once user gives position
navigator.geolocation.getCurrentPosition((position) => {
  initMap(position.coords.latitude, position.coords.longitude);
  fetchPlaces(position);
});