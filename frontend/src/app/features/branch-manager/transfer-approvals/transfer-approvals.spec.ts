import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferApprovals } from './transfer-approvals';

describe('TransferApprovals', () => {
  let component: TransferApprovals;
  let fixture: ComponentFixture<TransferApprovals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferApprovals],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferApprovals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
