import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { PerformanceService, PerformanceStats, PerformanceDataPoint } from '../../services/performance-service/performance.service';

Chart.register(...registerables)

@Component({
  selector: 'app-performance-graph',
  templateUrl: './performance-graph.component.html',
  styleUrls: ['./performance-graph.component.css']
})
export class PerformanceGraphComponent implements OnInit {
  stats: PerformanceStats = { avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0, totalRequests: 0, };
  chart: Chart | null = null;

  constructor(
    private http: HttpClient,
    private performanceService: PerformanceService
  ) {}

  ngOnInit() {
    this.loadRealTimeGraph();
    this.loadPerformanceGraph();

    setInterval(() => {
      this.loadRealTimeGraph();
      this.loadPerformanceGraph();
    }, 30000);
  }

  loadRealTimeGraph() {
    this.performanceService.loadRealTimeGraph().subscribe(
      data => { this.stats = data; });
  }

  loadPerformanceGraph() {
    this.performanceService.loadPerformanceGraph().subscribe(
      data => { this.renderChart(data) });
  }

  renderChart(points: PerformanceDataPoint[]) {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy();
    }

    console.log(points);
    const timestamps = points.map(point => new Date(point.timestamp).toLocaleTimeString());
    const avgs = points.map(point => point.avgResponseTimeMs);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'Response Time [ms]',
          data: avgs,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Response Time Over Time'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Response Time [ms]'
            },
          },
        },
      }
    });
  }

}
