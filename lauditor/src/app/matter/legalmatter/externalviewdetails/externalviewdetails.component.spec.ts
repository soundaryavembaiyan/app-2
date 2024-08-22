import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalviewdetailsComponent } from './externalviewdetails.component';

describe('ExternalviewdetailsComponent', () => {
  let component: ExternalviewdetailsComponent;
  let fixture: ComponentFixture<ExternalviewdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalviewdetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalviewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
