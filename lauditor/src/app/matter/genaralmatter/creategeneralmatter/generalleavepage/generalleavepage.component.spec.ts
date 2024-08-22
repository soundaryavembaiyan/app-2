import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralleavepageComponent } from './generalleavepage.component';

describe('GeneralleavepageComponent', () => {
  let component: GeneralleavepageComponent;
  let fixture: ComponentFixture<GeneralleavepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralleavepageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralleavepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
