import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Crisis } from './crisis.model';
import { CrisisPopupService } from './crisis-popup.service';
import { CrisisService } from './crisis.service';

@Component({
    selector: 'jhi-crisis-dialog',
    templateUrl: './crisis-dialog.component.html'
})
export class CrisisDialogComponent implements OnInit {

    crisis: Crisis;
    authorities: any[];
    isSaving: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        private alertService: JhiAlertService,
        private crisisService: CrisisService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.crisis.id !== undefined) {
            this.subscribeToSaveResponse(
                this.crisisService.update(this.crisis), false);
        } else {
            this.subscribeToSaveResponse(
                this.crisisService.create(this.crisis), true);
        }
    }

    private subscribeToSaveResponse(result: Observable<Crisis>, isCreated: boolean) {
        result.subscribe((res: Crisis) =>
            this.onSaveSuccess(res, isCreated), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: Crisis, isCreated: boolean) {
        this.alertService.success(
            isCreated ? 'greatBigExampleApplicationApp.crisis.created'
            : 'greatBigExampleApplicationApp.crisis.updated',
            { param : result.id }, null);

        this.eventManager.broadcast({ name: 'crisisListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }
}

@Component({
    selector: 'jhi-crisis-popup',
    template: ''
})
export class CrisisPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private crisisPopupService: CrisisPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.modalRef = this.crisisPopupService
                    .open(CrisisDialogComponent, params['id']);
            } else {
                this.modalRef = this.crisisPopupService
                    .open(CrisisDialogComponent);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
