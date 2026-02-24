import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductPackage } from '../../models/ecommerce.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SalesFlowStateService } from '../flow/sales-flow-state.service';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ProductMatchApiService {
    private http = inject(HttpClient);
    private state = inject(SalesFlowStateService);
    private _packages = signal<ProductPackage[]>([]);
    private _loading = signal<boolean>(false);

    packages = computed(() => this._packages());
    loading = computed(() => this._loading());

    matchProducts() {
        const token = this.state.flowToken();
        if (!token) return;

        this._loading.set(true);
        this.http.get<ProductPackage[]>(`${API}/match`, { headers: { 'X-Flow-Token': token } }).pipe(
            tap(packages => {
                this._packages.set(packages);
                this._loading.set(false);
            }),
            catchError(() => {
                this._loading.set(false);
                return of([]);
            })
        ).subscribe();
    }
}
