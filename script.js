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
                data.forEach(item => {
                    i++;

                    const itemDOM = document.createElement('div');
                    itemDOM.id = 'item' + i;

                    // Add the user's name
                    const userName = document.createElement('h4');
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
                data.forEach(item => {
                                    // Check if the data is null, empty, or not an array
                    if (!data || data.length === 0) {
                        console.warn("No data returned for user:", user);
            
                        // Display a friendly message in the DOM
                        const noDataMessage = document.createElement('p');
                        noDataMessage.textContent = `No liked cafes found for user "${user}".`;
                        container.appendChild(noDataMessage);
            
                        return; // Exit early since there's no data to process
                    }
                    i++;

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
  });

  map.fitBounds(bounds);
}

// display places on the DOM
// display currently wont work bc it cant fetch the liked cafes properly yet
function display(places) {
      const container = document.querySelector('.items');
      container.innerHTML = "";
    
      places.forEach(place => {
        const listItem = document.createElement('li');
        
        const textItem = document.createElement('p');
        textItem.textContent = place.displayName;
        listItem.appendChild(textItem);
        
        const likeButton = document.createElement('button');
        likeButton.addEventListener('click', () => likeCafe(place, likeButton));
        likeButton.classList.add('p' + place.displayName.replaceAll(" ", "-").replaceAll("'", ""));
        likeButton.textContent = 'heart';
        listItem.appendChild(likeButton);
        container.appendChild(listItem);
      })
    }


function likeCafe(cafe, button) {

  button.classList.contains("liked") ? button.classList.remove("liked") : button.classList.add("liked");

  fetch(`https://cafelist-bv0z.onrender.com/addCafe/${cafe.displayName}`, { method: 'GET', mode: 'no-cors' })
    .then(() => {
      fetch(`https://cafelist-bv0z.onrender.com/addUser/${user}`, { method: 'GET', mode: 'no-cors' });
    })
    .then(() => {
      fetch(`https://cafelist-bv0z.onrender.com/users/${user}/cafes/${cafe.displayName}`, { method: 'GET', mode: 'no-cors' });
    })
}

// creates map and gets places once user gives position
const getCurrentPositionPromise = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

getCurrentPositionPromise()
  .then((position) => {
    initMap(position.coords.latitude, position.coords.longitude);
    return fetchPlaces(position); // Assuming fetchPlaces is asynchronous and returns a promise
  })
  .then(() => {
    return fetch(`https://cafelist-bv0z.onrender.com/users/${user}/cafes`, { method: 'GET', mode: 'cors' });
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    data.forEach((place) => {
      document.querySelectorAll(`.p${place.name.replaceAll(" ", "-").replaceAll("'", "")}`).forEach((button) =>
        button.classList.add('liked')
      );
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });


const l = new List();

//for sidebar
document.getElementById("openSidebar").addEventListener("click", function() {
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("container").classList.add("active");
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


//for user sign in
const dialog = document.querySelector('dialog');


document.addEventListener('DOMContentLoaded', () => {
   dialog.showModal();
});


const submitBtn = document.querySelector('button#submit');
const input = document.querySelector('#new-user');


submitBtn.addEventListener('click', (e) => {
   e.preventDefault();
   fetch(`https://cafelist-bv0z.onrender.com/addUser/${input.value}`, {
       method: 'GET'});
   input.value = '';
   dialog.close();
});
