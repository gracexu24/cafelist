//copied from GOOGLE API Documentation 
let map;
let center;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  //change to be location of browser 
  center = { lat: 37.4161493, lng: -122.0812166 };
  map = new Map(document.getElementById("map"), {
    center: center,
    zoom: 11,
    mapId: "DEMO_MAP_ID",
  });
  findPlaces();
}

async function findPlaces() {
  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const request = {
    //edit to get this request dispaly what we want 
    textQuery: "Tacos in Mountain View",
    fields: ["displayName", "location", "businessStatus"],
    includedType: "restaurant",
    //location of browser
    locationBias: { lat: 37.4161493, lng: -122.0812166 },
    isOpenNow: true,
    language: "en-US",
    maxResultCount: 8,
    minRating: 3.2,
    region: "us",
    useStrictTypeFiltering: false,
  };
  //@ts-ignore
  const { places } = await Place.searchByText(request);

  if (places.length) {
    console.log(places);

    const { LatLngBounds } = await google.maps.importLibrary("core");
    const bounds = new LatLngBounds();

    // Loop through and get all the results.
    places.forEach((place) => {
      const markerView = new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
      });

      bounds.extend(place.location);
      console.log(place);
    });
    map.fitBounds(bounds);
  } else {
    console.log("No results");
  }
}

initMap();


class List {
    constructor() {
    }
    
    //edit to be a like 
    like() {
        fetch(`http://localhost:3001/markcomplete/${itemName}`, {
            method: 'GET'});
        this.display();
    }

    getContent() {
        return this.content;
    }
    

    display() {
        this.itemsDOM = document.querySelector('.items');
        this.itemsDOM.textContent = '';

        let i = 0;

        //change to use map api data and populate - use places? 
        fetch('http://localhost:3001/displaytasks', {
            method: 'GET',
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                data.forEach(item => {
                    i++;

                    const itemDOM = document.createElement('div');
                    itemDOM.id = 'item' + i;

                    const taskName = document.createElement('li');
                    taskName.textContent = item.task;
                    taskName.addEventListener('click', () => this.complete(item.task));
                    itemDOM.appendChild(taskName);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'like';
                    deleteBtn.addEventListener('click', () => this.delete(item.task));
                    itemDOM.appendChild(deleteBtn);

                    console.log(item.task);

                    if (item.completed == 1) {
                        itemDOM.classList.add('done');
                    }
                    else {
                        itemDOM.classList.remove('done');
                    }

                    this.itemsDOM.appendChild(itemDOM);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }
}




