import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftwareComponent } from './software.component';

describe('SoftwareComponent', () => {
  let component: SoftwareComponent;
  let fixture: ComponentFixture<SoftwareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoftwareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoftwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
