export const getGeolocation = () => {
  let location;

  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const geocoder = new google.maps.Geocoder();
          const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

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
                if (closest) {
                  location = closest['long_name'];
                } else {
                  location = address['formatted_address'].split('-')[0].trim();
                }

                resolve(location);
              }
            } else {
              reject('Geocoder failed due to: ', status);
            }
          });
        },
        error => {
          reject(error);
        }
      );
    });
  } else {
    // Browser doesn't support Geolocation
    throw 'HTML 5 Geolocation not supported';
  }
};
