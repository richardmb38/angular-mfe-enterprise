import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ICellRendererParams } from 'ag-grid-community';

import {
	mockConfigHubBackupJob,
	mockConfigHubBackupJobPartial,
	mockConfigHubHydratingBackupJob
} from '../../shared/models';
import { BackupNameCellComponent } from './backup-name-cell.component';

describe('BackupNameCellComponent', () => {
	let component: BackupNameCellComponent;
	let fixture: ComponentFixture<BackupNameCellComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BackupNameCellComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(BackupNameCellComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('agInit', () => {
		it('should set the backup name and show partial badge if backup is partial', () => {
			expect(component.isPartial).toBe(false);
			component.agInit({ data: mockConfigHubBackupJobPartial } as ICellRendererParams);
			expect(component.backupName).toBe(mockConfigHubBackupJobPartial.name);
			expect(component.isPartial).toBe(true);
		});
		it('should set the backup name and hide partial badge if backup is not partial', () => {
			expect(component.isPartial).toBe(false);
			component.agInit({ data: mockConfigHubBackupJob } as ICellRendererParams);
			expect(component.backupName).toBe(mockConfigHubBackupJobPartial.name);
			expect(component.isPartial).toBe(false);
		});
		it('should show processing badge if backup is hydrating', () => {
			expect(component.isHydrating).toBe(false);
			component.agInit({ data: mockConfigHubHydratingBackupJob } as ICellRendererParams);
			expect(component.backupName).toBe(mockConfigHubHydratingBackupJob.name);
			expect(component.isHydrating).toBe(true);
		});
		it('should not show processing badge if backup is hydrated', () => {
			expect(component.isHydrating).toBe(false);
			component.agInit({ data: mockConfigHubBackupJob } as ICellRendererParams);
			expect(component.backupName).toBe(mockConfigHubBackupJob.name);
			expect(component.isHydrating).toBe(false);
		});
	});

	describe('refresh', () => {
		it('should return false', () => {
			expect(component.refresh()).toEqual(false);
		});
	});
});
