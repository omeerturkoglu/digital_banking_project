import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SysLogs } from './sys-logs';

describe('SysLogs', () => {
  let component: SysLogs;
  let fixture: ComponentFixture<SysLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SysLogs],
    }).compileComponents();

    fixture = TestBed.createComponent(SysLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
