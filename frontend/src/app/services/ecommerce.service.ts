import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ProductPackage, ProductCharacteristic, CartItem, CustomerOrder, ConfigValue, SalesFlowStep, FlowConfig, FlowSession, PREDEFINED_FLOWS } from '../models/ecommerce.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class SalesFlowStateService {
    private _currentStep = signal<SalesFlowStep>('pick');
    private _selectedProducts = signal<Product[]>([]);
    private _selectedPackage = signal<ProductPackage | null>(null);
    private _configValues = signal<ConfigValue[]>([]);
    private _sessionId = signal<string>(this.generateSessionId());
    private _activeFlow = signal<FlowConfig>(PREDEFINED_FLOWS[0]);
    private _flowToken = signal<string | null>(null);

    currentStep = computed(() => this._currentStep());
    selectedProducts = computed(() => this._selectedProducts());
    selectedPackage = computed(() => this._selectedPackage());
    configValues = computed(() => this._configValues());
    sessionId = computed(() => this._sessionId());
    activeFlow = computed(() => this._activeFlow());
    flowToken = computed(() => this._flowToken());

    selectedProductIds = computed(() => this._selectedProducts().map(p => p.id));

    setStep(step: SalesFlowStep) { this._currentStep.set(step); }

    toggleProduct(product: Product) {
        this._selectedProducts.update(products => {
            const exists = products.find(p => p.id === product.id);
            return exists ? products.filter(p => p.id !== product.id) : [...products, product];
        });
    }

    isProductSelected(id: number): boolean {
        return this._selectedProducts().some(p => p.id === id);
    }

    setPackage(pkg: ProductPackage) { this._selectedPackage.set(pkg); }

    addConfigValue(cv: ConfigValue) {
        this._configValues.update(vals => {
            const filtered = vals.filter(v => v.characteristicName !== cv.characteristicName);
            return [...filtered, cv];
        });
    }

    setConfigValues(values: ConfigValue[]) { this._configValues.set(values); }

    setActiveFlow(flow: FlowConfig) {
        this._activeFlow.set(flow);
        this.reset();
    }

    setFlowToken(token: string) {
        this._flowToken.set(token);
    }

    reset() {
        this._currentStep.set('pick');
        this._selectedProducts.set([]);
        this._selectedPackage.set(null);
        this._configValues.set([]);
        this._sessionId.set(this.generateSessionId());
        this._flowToken.set(null);
    }

    private generateSessionId(): string {
        return 'session-' + Math.random().toString(36).substring(2, 11) + Date.now();
    }
}

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

export interface PaymentInitResponse {
    orderId: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    hopUrl?: string;
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
