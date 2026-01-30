import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GeolocPos {
  latitude: number,
  longitude: number,
}

@Injectable({
  providedIn: 'root'
})
export class GeolocService {

  constructor() { }

  getCurrentLocation(): Observable<GeolocPos> {
    return new Observable(obs => {
      if (!navigator.geolocation) {
        obs.error('Geolocation is not supported by your browser!');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          obs.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          obs.complete();
        },
        (error) => {
          let errorMsg = 'Unkown error!';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'User denied location permission';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out';
              break;
          }
          obs.error(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }
}
