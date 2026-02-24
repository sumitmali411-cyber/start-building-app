import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../../models/ecommerce.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class CartApiService {
    private http = inject(HttpClient);
    private _items = signal<CartItem[]>([]);
    private _loading = signal<boolean>(false);

    items = computed(() => this._items());
    loading = computed(() => this._loading());
    itemCount = computed(() => this._items().length);
    totalAmount = computed(() => this._items().reduce((sum, item) => sum + item.price * item.quantity, 0));

    loadCart(sessionId: string) {
        this.http.get<CartItem[]>(`${API}/cart/${sessionId}`).pipe(
            tap(items => this._items.set(items)),
            catchError(() => of([]))
        ).subscribe();
    }

    addToCart(item: CartItem) {
        return this.http.post<CartItem>(`${API}/cart`, item).pipe(
            tap(newItem => this._items.update(items => [...items, newItem]))
        );
    }

    removeItem(itemId: number) {
        return this.http.delete(`${API}/cart/item/${itemId}`).pipe(
            tap(() => this._items.update(items => items.filter(i => i.id !== itemId)))
        );
    }

    clearCart(sessionId: string) {
        return this.http.delete(`${API}/cart/${sessionId}`).pipe(
            tap(() => this._items.set([]))
        );
    }
}
