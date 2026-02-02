import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { VideoService } from '../../services/video-service/video.service';
import { GeolocService } from '../../services/geoloc-service/geoloc.service';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css']
})
export class VideoUploadComponent {
  uploadProgress: number = 0;
  uploading: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: string | null = null;

  videoFile: File | null = null;
  thumbnailFile: File | null = null;
  videoPreview: string | null = null;
  thumbnailPreview: string | null = null;

  uploadForm = {
    title: '',
    description: '',
    latitude: null as number | null,
    longitude: null as number | null,
    tags: ''
  };

  automaticGeoloc: boolean = true;
  gettingLocation: boolean = false;

  constructor(
    private videoService: VideoService,
    private geolocService: GeolocService
  ) {}

  onVideoSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/mp4")) {
      this.videoFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.videoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid video file that uses the [.mp4] format');
      event.target.value = '';
    }
  }

  onThumbnailSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/jpeg")) {
      this.thumbnailFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file that uses the [.jpeg] format');
      event.target.value = '';
    }
  }

  getLocation() {
    this.gettingLocation = true;
    this.geolocService.getCurrentLocation().subscribe({
      next: (coords) => {
        this.uploadForm.latitude = coords.latitude;
        this.uploadForm.longitude = coords.longitude;
        this.gettingLocation = false;
      },
      error: (err) => {
        console.error('Geolocation error: ', err);
        alert(err);
        this.gettingLocation = false;
      }
    });
  }

  uploadVideo() {
    if (!this.videoFile || !this.thumbnailFile) {
      this.uploadError = 'Please select both video [.mp4] and thumbnail [.jpeg] files'
      return;
    }

    if (!this.uploadForm.title.trim()) {
      this.uploadError = 'Please enter the title';
      return;
    }

    if (!this.uploadForm.description.trim()) {
      this.uploadError = 'Please enter the description';
      return;
    }

    const tagsArray = this.uploadForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tagsArray.length === 0) {
      this.uploadError = 'Please enter at least one tag';
      return;
    }


    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = null;

    this.videoService.uploadVideo(
      this.videoFile,
      this.thumbnailFile,
      this.uploadForm.title,
      this.uploadForm.description,
      tagsArray,
      this.uploadForm.latitude ?? undefined,
      this.uploadForm.longitude ?? undefined,
    )
    .pipe(finalize(() => this.uploading = false ))
    .subscribe({
      next: (progress) => {
        this.uploadProgress = progress.progress;
        if (progress.response) {
          console.log('Upload successful:', progress.response);
          this.uploadSuccess = true;
          setTimeout(() => this.resetForm(), 100);
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        if (error.status === 401) {
          this.uploadError = 'You must be logged in to upload videos';
        } else if (error.status === 403) {
          this.uploadError = 'You do not have permission to upload videos';
        } else {
          this.uploadError = 'Upload failed! Please try again!';
        }
      },
    })
  }

  resetForm() {
    this.uploadForm = {
      title: '',
      description: '',
      latitude: null,
      longitude: null,
      tags: ''
    };
    const videoInput = document.getElementById('video') as HTMLInputElement;
    videoInput.value = '';
    this.videoFile = null;
    this.videoPreview = null;

    const thumbnailInput = document.getElementById('thumbnail') as HTMLInputElement;
    thumbnailInput.value = '';
    this.thumbnailFile = null;
    this.thumbnailPreview = null;

    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = null;
  }

  cancelUpload() { this.resetForm(); }
}
