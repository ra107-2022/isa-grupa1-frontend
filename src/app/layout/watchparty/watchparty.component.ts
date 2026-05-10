import { Component, ElementRef, ViewChild } from '@angular/core';
import { WatchPartyRoom, WatchpartyService, WatchPartyEvent } from 'src/app/services/watchparty-service/watchparty.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-watchparty',
  templateUrl: './watchparty.component.html',
  styleUrls: ['./watchparty.component.css']
})
export class WatchpartyComponent {

  joinCode: string = '';
  showJoinInput: boolean = false;

  private intervalId: any;

  get roomCode() { return this.watchpartyService.roomCode; }
  get isHost() { return this.watchpartyService.isHost; }
  get usersCount() { return this.watchpartyService.usersCount; }

  constructor(private watchpartyService: WatchpartyService, private router: Router, private snackBar: MatSnackBar) { }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'left',
      panelClass: ['snack-success']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'left',
      panelClass: ['snack-error']
    });
  }

  createRoom() {
    
    this.watchpartyService.createRoom().subscribe({
      next: (res: any) => {

        this.watchpartyService.setRoom(res.code, true);

        setTimeout(() => {
          this.joinRoom();
          this.connectToRoom();
        }, 300);
      },

      error: (err) => {
        this.showError('Failed to create room. Please try again.');
        console.error(err);
      }
    });
  }

  joinRoom() {
    if (!this.roomCode) return;

    this.watchpartyService.joinRoom(this.roomCode).subscribe
    ({
      next: () => {
        console.log('JOIN SUCCESS');
      },
      error: (err) => {
        console.error('JOIN ERROR', err);
      }
    });
  }

  // WebSocket connection 
  // slusa sobu u realnom vremenu i reaguje na dogadjaje (npr PLAY)

  connectToRoom() {
    if (!this.roomCode) return;

    this.watchpartyService.disconnect(); // osigurava da nema duplih konekcija

    // websocket play sinchronizacija
    this.watchpartyService.connect(this.roomCode,
      (event: WatchPartyEvent) => {
        
        console.log('WS EVENT RECEIVED:', event);

        switch(event.type) {
          case 'PLAY':
          if (this.isHost && event.clientTime && Date.now() - event.clientTime < 1000) return;
          this.router.navigate([`/video/${event.videoId}`]);
          break;
        case 'USER_JOIN':
          this.watchpartyService.setUsersCount(event.usersCount);
          break;
        case 'USER_LEAVE':
          this.watchpartyService.setUsersCount(event.usersCount);
          break;
        case 'ROOM_CLOSED':
          this.watchpartyService.clearRoom();
          this.watchpartyService.disconnect();
          this.showError('The host has closed the room.');
          break;
        default:
          console.warn('Unknown event type:', event.type);
        }
      });
  }

  // poziva se iz home komponente kada korisnik pokusa da reprodukuje video u watch party modu
  playVideo(videoId: number, startTime: number = 0) {

    if (!this.roomCode) {return;}
    
    this.watchpartyService.sendPlay({
      type: 'PLAY',
      roomCode: this.roomCode,
      videoId,
      timestamp: 0,
      clientTime: Date.now()
    });

    this.router.navigate([`/video/${videoId}`]);
  }

  enterRoom() {
    if (!this.joinCode) return;

    this.watchpartyService.setRoom(this.joinCode, false); // postavi sobu pre WS konekcije da ne propustis USER_JOIN event

    this.watchpartyService.disconnect();
    this.connectToRoom();

    // pa tek onda REST join
    this.watchpartyService.joinRoom(this.joinCode).subscribe({
      next: () => {
        this.showSuccess('Successfully joined the room!');
        this.showJoinInput = false;
      },
      error: (err) => {
        this.showError('Failed to join room. Please check the room code and try again.');
        this.watchpartyService.clearRoom();
        console.error(err);
      }
    });
  }

  leaveOrCloseRoom() {

    if (!this.roomCode) return;

    if (this.isHost) {
      this.watchpartyService.closeRoom(this.roomCode).subscribe({
        next: () => {
          this.watchpartyService.clearRoom();
          this.watchpartyService.disconnect();
          this.showSuccess('Room closed.');
        },
        error: (err) => {
          this.showError('Failed to close room. Please try again.');
          console.error(err);
        }
      });
    } else {
      this.watchpartyService.leaveRoom(this.roomCode).subscribe({
        next: () => {
          this.watchpartyService.clearRoom();
          this.watchpartyService.disconnect();
          this.showSuccess('Left the room.');
        },
        error: (err) => {
          this.showError('Failed to leave room. Please try again.');
          console.error(err);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    // ne diskkonektuj ovde - servis prezivljava navigaciju
  }
}
