import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipMemberAccessComponent } from './relationship-member-access.component';

describe('RelationshipMemberAccessComponent', () => {
  let component: RelationshipMemberAccessComponent;
  let fixture: ComponentFixture<RelationshipMemberAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationshipMemberAccessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationshipMemberAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
