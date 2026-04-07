import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API = 'http://localhost:8082/api';

export interface PaymentInitResponse {
    orderId: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    mockRedirectUrl?: string;
    simulatedSuccessDelay?: number;
    isMock?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
    private http = inject(HttpClient);
    private _loading = signal<boolean>(false);

    loading = computed(() => this._loading());

    createPaymentOrder(amount: number, method: string, sessionId: string) {
        this._loading.set(true);
        return this.http.post<PaymentInitResponse>(`${API}/payment/create-order`, { amount, method, sessionId }).pipe(
            tap(() => this._loading.set(false)),
            catchError(() => {
                this._loading.set(false);
                return of(null);
            })
        );
    }
}
