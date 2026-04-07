import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/ecommerce.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API = 'http://localhost:8082/api';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
    private http = inject(HttpClient);
    private _products = signal<Product[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    products = computed(() => this._products());
    loading = computed(() => this._loading());
    error = computed(() => this._error());

    loadProducts() {
        this._loading.set(true);
        this.http.get<Product[]>(`${API}/products`).pipe(
            tap(products => {
                this._products.set(products);
                this._loading.set(false);
                this._error.set(null);
            }),
            catchError(err => {
                this._error.set('Failed to load products');
                this._loading.set(false);
                return of([]);
            })
        ).subscribe();
    }
}
