import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductCharacteristic } from '../../models/ecommerce.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API = 'http://localhost:8082/api';

@Injectable({ providedIn: 'root' })
export class ConfigApiService {
    private http = inject(HttpClient);
    private _requirements = signal<ProductCharacteristic[]>([]);
    private _loading = signal<boolean>(false);

    requirements = computed(() => this._requirements());
    loading = computed(() => this._loading());

    loadRequirements(packageId: number) {
        this._loading.set(true);
        this.http.get<ProductCharacteristic[]>(`${API}/config/package/${packageId}`).pipe(
            tap(reqs => {
                this._requirements.set(reqs);
                this._loading.set(false);
            }),
            catchError(() => {
                this._loading.set(false);
                return of([]);
            })
        ).subscribe();
    }
}
