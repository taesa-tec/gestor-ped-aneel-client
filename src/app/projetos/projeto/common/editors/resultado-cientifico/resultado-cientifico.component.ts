import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AppService } from '@app/app.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditorResultado } from '../editor-resultado-base';
import { ResultadoProducao, TiposProducaoTC, AppValidators, NoRequest, ResultadoResponse } from '@app/models';
import { Observable, of } from 'rxjs';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-resultado-cientifico',
    templateUrl: './resultado-cientifico.component.html',
    styleUrls: []
})
export class ResultadoCientificoComponent extends EditorResultado<any> {


    readonly formFields: string[] = ['tipo', 'dataPublicacao', 'confirmacao', 'nome', 'url', 'catalogPaisId', 'cidade', 'titulo'];

    readonly tiposProducao = TiposProducaoTC;

    paises: Array<{ id: number; nome: string; }>;

    @ViewChild('file') file: ElementRef;

    constructor(app: AppService, activeModal: NgbActiveModal) { super(app, activeModal, "ResultadoProducao"); }

    load() {
        return new Observable<void>(observer => {
            this.app.catalogo.paises()
                .subscribe(paises => {
                    this.paises = paises;
                    observer.next();
                }, error => {
                    console.error(error);
                    observer.error(error);
                });
        });
    }

    sanitizedValue(field: string, editable?: ResultadoProducao) {
        if (editable) {
            switch (field) {
                case 'tipo':
                    return editable.tipoValor;
                case 'dataPublicacao':
                    return editable.dataPublicacao.substr(0, 10);
            }
        }
        return super.sanitizedValue(field, editable);
    }

    configForm(): void {
        this.formFields.forEach(f => this.form.get(f).setValidators(Validators.required));
        this.form.updateValueAndValidity();
    }

    changeFile() { }

    uploadFile(id) {
        const el = this.file.nativeElement as HTMLInputElement;

        if (el.files.length > 0) {
            return this.app.file.upload(el.files.item(0), new FormGroup({
                ResultadoProducaoId: new FormControl(id),
            })).pipe(tap(result => {
                if (result.sucesso) {
                    this.file.nativeElement.value = "";
                }
            }));
        }

        return of(NoRequest);
    }
    afterSubmit(result: ResultadoResponse) {
        return super.afterSubmit().pipe(tap(r => {
            if (result && result.sucesso) {
                this.activeModal.close(true);
            }
            if (result && result.sucesso && (result.id || this.editable.id)) {
                return this.uploadFile(result.id || this.editable.id).pipe(tap(() => this.activeModal.close(true)));
            }
        }));
        
        
    }
}

