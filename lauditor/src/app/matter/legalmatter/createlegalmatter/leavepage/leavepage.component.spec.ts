import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavepageComponent } from './leavepage.component';

describe('LeavepageComponent', () => {
  let component: LeavepageComponent;
  let fixture: ComponentFixture<LeavepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeavepageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
