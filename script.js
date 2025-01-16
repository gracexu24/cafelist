let map;
let center;

//for list of users and their liked cafes

class List {
    constructor() {
    }
    
    display() {
        this.itemsDOM = document.querySelector('.users');
        this.itemsDOM.textContent = '';

        let i = 0;

        fetch('https://cafelist-bv0z.onrender.com/showUsers', {
            method: 'GET',
            })
            //try to handle errors
            .then(response => {if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
            })
            .then(data => {
                console.log(data);
                data.forEach(item => {
                    i++;

                    const itemDOM = document.createElement('div');
                    itemDOM.id = 'item' + i;

                    // Add the user's name
                    const userName = document.createElement('h3');
                    userName.textContent = item.username;
                    itemDOM.appendChild(userName);

                    // Add a container for the user's liked cafes
                    const cafesContainer = document.createElement('ul');
                    cafesContainer.className = 'cafes'; // Class for styling the cafes
                    itemDOM.appendChild(cafesContainer);

                    // Append the user's container to the DOM
                    this.itemsDOM.appendChild(itemDOM);

                    // Fetch and display cafes for this user
                    this.cafes(item.username, cafesContainer);
                            
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    cafes(user,container) {
        //can't call this.itemDOM again, dont need .cafes
        container.textContent = '';

        let i = 0;

        const call = 'https://cafelist-bv0z.onrender.com/users/' + user + '/cafes';

        fetch(call, {
            method: 'GET',
            })
            //try to handle errors
            .then(response => {if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
            })
            .then(data => {
                // Check if the data is null, empty, or not an array
                if (!data || data.length === 0) {
                    console.warn("No data returned for user:", user);
        
                    // Display a friendly message in the DOM
                    const noDataMessage = document.createElement('p');
                    noDataMessage.textContent = `No liked cafes found for user "${user}".`;
                    container.appendChild(noDataMessage);
        
                    return; // Exit early since there's no data to process
                }

                console.log(data);
 
                data.forEach(item => {
                    const cafeItem = document.createElement('li');
                    cafeItem.textContent = item.name;
                    container.appendChild(cafeItem);
                });
                
            })
            .catch(error => console.error('Error fetching data:', error));
    }
}


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
  const container = document.querySelector('.items');
  
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

const l = new List();

//for sidebar
document.getElementById("openSidebar").addEventListener("click", function() {
    document.getElementById("sidebar").classList.add("active");
    // Call display method, handle errors gracefully
    try {
        l.display();
    } catch (error) {
        console.error('Error in l.display():', error);
    }
});

document.getElementById("closeSidebar").addEventListener("click", function() {
    document.getElementById("sidebar").classList.remove("active");
});


