import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GeolocPos {
  latitude: number,
  longitude: number,
}

@Injectable({
  providedIn: 'root'
})
export class GeolocService {

  constructor(
    private http: HttpClient
  ) { }

  getLocationFromIp(): Observable<GeolocPos> {
    return this.http.get<any>('http://ip-api.com/json/').pipe(
      map(res => ({
        latitude: res.lat,
        longitude: res.lon,
      }))
    );
  }

  getCurrentLocation(): Observable<GeolocPos> {
    return new Observable(obs => {
      if (!navigator.geolocation) {
        this.getLocationFromIp().subscribe({
          next: (pos) => {
            obs.next({
              latitude: pos.latitude,
              longitude: pos.longitude,
            });
            obs.complete();
          },
          error: (err) => {
            obs.error('Can\'t get location from IP address! ' + err);
          }
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          obs.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          obs.complete();
        },
        () => {
          this.getLocationFromIp().subscribe({
            next: (pos) => {
              obs.next({
                latitude: pos.latitude,
                longitude: pos.longitude,
              });
              obs.complete();
            },
            error: (err) => {
              obs.error('Can\'t get location from IP address! ' + err);
            }
          });
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
