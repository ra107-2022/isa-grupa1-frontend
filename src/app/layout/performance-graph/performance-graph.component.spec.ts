import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceGraphComponent } from './performance-graph.component';

describe('PerformanceGraphComponent', () => {
  let component: PerformanceGraphComponent;
  let fixture: ComponentFixture<PerformanceGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PerformanceGraphComponent]
    });
    fixture = TestBed.createComponent(PerformanceGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
