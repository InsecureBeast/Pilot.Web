import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BimNodePropertiesComponent } from './bim-node-properties.component';

describe('BimNodePropertiesComponent', () => {
  let component: BimNodePropertiesComponent;
  let fixture: ComponentFixture<BimNodePropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BimNodePropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BimNodePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
