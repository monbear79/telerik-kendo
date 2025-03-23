import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InConfigComponent } from './in-config.component';

describe('InConfigComponent', () => {
  let component: InConfigComponent;
  let fixture: ComponentFixture<InConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InConfigComponent]
    });
    fixture = TestBed.createComponent(InConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
