

var map;
var firebase = new Firebase("https://angelic-archery-274517.firebaseio.com");
/**
 * Data object to be written to Firebase.
 */
var data = {
    sender: null,
    timestamp: null,
    lat: null,
    lng: null
  };
/**
* Starting point for running the program. Authenticates the user.
// *  - Called when authentication succeeds.
*/
function initAuthentication(onAuthSuccess) {
    firebase.auth().signInAnonymously().catch(function(error) {
        console.log(error.code + ", " + error.message);
    }, {remember: 'sessionOnly'});
  
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        data.sender = user.uid;
        onAuthSuccess();
      } else {
        // User is signed out.
      }
    });
  }
  
function initMap() {
    var Nairoberry = {
            lat: -1.2921 ,
            lng: 36.8219
    };
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: Nairoberry,
        zoom: 11,
        mapTypeId: 'roadmap',
        styles: [{
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off points of interest.
          }, {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
          }],
          disableDoubleClickZoom: true,
          streetViewControl: false
       });
       // Create the DIV to hold the control and call the makeInfoBox() constructor
// passing in this DIV.
var infoBoxDiv = document.createElement('div');
makeInfoBox(infoBoxDiv, map);
map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

  // Listen for clicks and add the location of the click to firebase.
  map.addListener('click', function(e) {
    data.lat = e.latLng.lat();
    data.lng = e.latLng.lng();
    addToFirebase(data);
  });

  // Create a heatmap.
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    map: map,
    radius: 16
  });
  initAuthentication(initFirebase.bind(undefined, heatmap));
}
function makeInfoBox(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '2px';
    controlUI.style.marginBottom = '22px';
    controlUI.style.marginTop = '10px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);
  
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '100%';
    controlText.style.padding = '6px';
    controlText.innerText = 'Please select a point on map to set geo-location';
    controlUI.appendChild(controlText);
  }
  // Listen for clicks and add them to the heatmap.
clicks.orderByChild('timestamp').startAt(startTime).on('child_added',
function(snapshot) {
  var newPosition = snapshot.val();
  var point = new google.maps.LatLng(newPosition.lat, newPosition.lng);
  heatmap.getData().push(point);
}
);
/**
 * Set up a Firebase with deletion on clicks older than expirySeconds
 * @param {!google.maps.visualization.HeatmapLayer} heatmap The heatmap to
 * which points are added from Firebase.
 */
function initFirebase(heatmap) {

    // 10 minutes before current time.
    var startTime = new Date().getTime() - (60 * 10 * 1000);
  
    // Reference to the clicks in Firebase.
    var clicks = firebase.database().ref('clicks');
  
    // Listen for clicks and add them to the heatmap.
    clicks.orderByChild('timestamp').startAt(startTime).on('child_added',
      function(snapshot) {
        // Get that click from firebase.
        var newPosition = snapshot.val();
        var point = new google.maps.LatLng(newPosition.lat, newPosition.lng);
        var elapsedMs = Date.now() - newPosition.timestamp;
  
        // Add the point to the heatmap.
        heatmap.getData().push(point);
  
        // Request entries older than expiry time (10 minutes).
        var expiryMs = Math.max(60 * 10 * 1000 - elapsed, 0);
        // Set client timeout to remove the point after a certain time.
        window.setTimeout(function() {
          // Delete the old point from the database.
          snapshot.ref.remove();
        }, expiryMs);
      }
    );
  
    // Remove old data from the heatmap when a point is removed from firebase.
    clicks.on('child_removed', function(snapshot, prevChildKey) {
      var heatmapData = heatmap.getData();
      var i = 0;
      while (snapshot.val().lat != heatmapData.getAt(i).lat()
        || snapshot.val().lng != heatmapData.getAt(i).lng()) {
        i++;
      }
      heatmapData.removeAt(i);
    });
  }


