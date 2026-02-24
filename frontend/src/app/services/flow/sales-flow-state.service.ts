import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductPackage, ConfigValue, SalesFlowStep, FlowConfig, PREDEFINED_FLOWS } from '../../models/ecommerce.model';

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
