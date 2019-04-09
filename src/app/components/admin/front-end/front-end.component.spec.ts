import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontEndComponent } from './front-end.component';

describe('FrontEndComponent', () => {
  let component: FrontEndComponent;
  let fixture: ComponentFixture<FrontEndComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrontEndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
