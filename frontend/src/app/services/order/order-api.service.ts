import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomerOrder } from '../../models/ecommerce.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
    private http = inject(HttpClient);
    private _currentOrder = signal<CustomerOrder | null>(null);
    private _loading = signal<boolean>(false);

    currentOrder = computed(() => this._currentOrder());
    loading = computed(() => this._loading());

    createOrder(sessionId: string, paymentId?: string) {
        this._loading.set(true);
        const body: any = { sessionId };
        if (paymentId) body.paymentId = paymentId;

        return this.http.post<CustomerOrder>(`${API}/orders`, body).pipe(
            tap(order => {
                this._currentOrder.set(order);
                this._loading.set(false);
            }),
            catchError(err => {
                this._loading.set(false);
                return of(null);
            })
        );
    }

    getOrder(id: number, sessionId: string) {
        // The API scopes order lookups to the owning session.
        return this.http.get<CustomerOrder>(`${API}/orders/${id}`, {
            params: { sessionId }
        }).pipe(
            tap(order => this._currentOrder.set(order))
        );
    }
}
