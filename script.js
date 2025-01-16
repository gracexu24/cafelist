let map;
let center;

//for list of users and their liked cafes

const user = "tejas2";

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

                    const userName = document.createElement('li');
                    userName.textContent = item.username;
                    console.log(userName);
                    
                    itemDOM.appendChild(userName);
                    this.itemsDOM.appendChild(itemDOM);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    cafes(user) {
        this.itemsDOM = document.querySelector('.cafes');
        this.itemsDOM.textContent = '';

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
                console.log(data);
                data.forEach(item => {
                    i++;

                    const itemDOM = document.createElement('div');
                    itemDOM.id = 'item' + i;

                    const userName = document.createElement('li');
                    userName.textContent = item.username;
                    console.log(userName);
                    
                    itemDOM.appendChild(userName);
                    this.itemsDOM.appendChild(itemDOM);
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
// display currently wont work bc it cant fetch the liked cafes properly yet
async function display(places) {
  fetch(`https://cafelist-bv0z.onrender.com/users/${user}/cafes`, { method: 'GET' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const container = document.querySelector('.items');
      container.innerHTML = "";
    
      places.forEach(place => {
        const listItem = document.createElement('li');
        
        const textItem = document.createElement('p');
        textItem.textContent = place.displayName;
        listItem.appendChild(textItem);
        
        const likeButton = document.createElement('button');
 
 
        if (data.contains(place.displayName)) { //contains is not a function but idk how the data will be stored so
        //                                       until we see data we dont know how to check if it contains anything
          likeCafe(place, likeButton);
        }
 
 
        likeButton.addEventListener('click', () => likeCafe(place, likeButton));
        likeButton.textContent = 'heart';
        listItem.appendChild(likeButton);
   
        container.appendChild(listItem);
      });
     
    })
 }
 
 
 function likeCafe(cafe, button) {
  button.classList.contains("liked")
  ? button.classList.remove("liked")
  : button.classList.add("liked");
 
 
  fetch(`https://cafelist-bv0z.onrender.com/addCafe/${cafe.displayName}`, { method: 'GET', mode: 'no-cors' });
  fetch(`https://cafelist-bv0z.onrender.com/addUser/${user}`, { method: 'GET', mode: 'no-cors' });
  fetch(`https://cafelist-bv0z.onrender.com/users/${user}/cafes/${cafe.displayName}`, { method: 'GET', mode: 'no-cors' });
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


