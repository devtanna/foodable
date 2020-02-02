export const getGeolocation = () => {
  let location;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const geocoder = new google.maps.Geocoder();
        const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        return new Promise((resolve, reject) => {
          geocoder.geocode({ latLng: latlng }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results.length) {
                const neighborhood = results.find(
                  obj => obj.types.includes('neighborhood') || obj.types.includes('sublocality_level_1')
                );
                const address = neighborhood || results[1] || results[0];
                const closest = address['address_components'].find(
                  obj => obj.types.includes('neighborhood') || obj.types.includes('sublocality_level_1')
                );
                console.log(address);
                console.log(closest);
                if (closest) {
                  location = closest['long_name'];
                } else {
                  location = address['formatted_address'].split('-')[0].trim();
                }
                console.log(location);

                resolve(location);
              }
            } else {
              reject('Geocoder failed due to: ', status);
            }
          });
        });
      },
      error => {
        console.log('Geolocation error:', error);
      }
    );
  } else {
    // Browser doesn't support Geolocation
    console.log('HTML 5 Geolocation not supported');
  }
};
