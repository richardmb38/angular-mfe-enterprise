import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { BackupDetailsOverlayComponent } from './backup-details-overlay.component';

describe('BackupDetailsOverlayComponent', () => {
	let component: BackupDetailsOverlayComponent;
	let fixture: ComponentFixture<BackupDetailsOverlayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BackupDetailsOverlayComponent],
			imports: [TranslateModule.forRoot()]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BackupDetailsOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should parse and assign the selectedObject correctly', () => {
			const selectedObject = '{"object": {"name": "John"}}';
			component.selectedObject = JSON.stringify(selectedObject);

			component.ngOnInit();

			expect(component.jsonObject).toEqual(JSON.stringify(JSON.parse(selectedObject), null, '\t'));
		});
	});

	describe('ngOnDestroy', () => {
		it('should complete unsubscribe$ subject', () => {
			const nextSpy = jest.spyOn((component as any).unsubscribe$, 'next');
			const completeSpy = jest.spyOn((component as any).unsubscribe$, 'complete');

			component.ngOnDestroy();
			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});

	describe('handleDismiss', () => {
		it('should emit an onClose event when called', () => {
			const onCloseSpy = jest.spyOn(component.onClose, 'emit');

			component.handleDismiss();
			expect(onCloseSpy).toHaveBeenCalledTimes(1);
		});
	});
});
