import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BimTreeviewComponent } from './bim-treeview.component';

describe('BimTreeviewComponent', () => {
  let component: BimTreeviewComponent;
  let fixture: ComponentFixture<BimTreeviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BimTreeviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BimTreeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
