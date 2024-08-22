import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatexblockComponent } from './latexblock.component';

describe('LatexblockComponent', () => {
  let component: LatexblockComponent;
  let fixture: ComponentFixture<LatexblockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatexblockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatexblockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
