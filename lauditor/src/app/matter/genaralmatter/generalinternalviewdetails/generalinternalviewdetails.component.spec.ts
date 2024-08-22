import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralinternalviewdetailsComponent } from './generalinternalviewdetails.component';

describe('GeneralinternalviewdetailsComponent', () => {
  let component: GeneralinternalviewdetailsComponent;
  let fixture: ComponentFixture<GeneralinternalviewdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralinternalviewdetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralinternalviewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
