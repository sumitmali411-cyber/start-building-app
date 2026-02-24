import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlowSession } from '../../models/ecommerce.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SalesFlowStateService } from './sales-flow-state.service';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class FlowApiService {
    private http = inject(HttpClient);
    private state = inject(SalesFlowStateService);
    private _loading = signal<boolean>(false);

    loading = computed(() => this._loading());

    initFlow() {
        const productIds = this.state.selectedProductIds();
        const flowType = this.state.activeFlow().id;

        this._loading.set(true);
        return this.http.post<FlowSession>(`${API}/flow/init`, { productIds, flowType }).pipe(
            tap(session => {
                this.state.setFlowToken(session.token);
                this._loading.set(false);
            }),
            catchError(() => {
                this._loading.set(false);
                return of(null);
            })
        );
    }
}
