export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    available: boolean;
}

export interface ProductPackage {
    id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    imageUrl: string;
    products: Product[];
}

export interface ProductCharacteristic {
    id: number;
    productId: number;
    name: string;
    label: string;
    type: 'NUMBER' | 'TEXT' | 'SELECT';
    required: boolean;
    options: string | null;
    defaultValue: string;
}

export interface CartItem {
    id?: number;
    sessionId: string;
    productId: number;
    packageId?: number;
    productName: string;
    price: number;
    quantity: number;
    characteristicValues?: string;
}

export interface CustomerOrder {
    id: number;
    sessionId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    productName: string;
    price: number;
    quantity: number;
    configValues: string;
}

export interface ConfigValue {
    characteristicName: string;
    label: string;
    value: string;
}

export type PaymentMethod = 'razorpay' | 'adumo';

export type SalesFlowStep = 'pick' | 'match' | 'config' | 'checkout' | 'confirmation';

export interface FlowConfig {
    id: string;
    name: string;
    steps: SalesFlowStep[];
    minProducts: number;
    maxProducts: number;
    requireMatch: boolean;
    requireConfig: boolean;
}

export interface FlowInitRequest {
    productIds: number[];
    flowType: string;
}

export interface FlowSession {
    token: string;
    flowType: string;
    productIds: number[];
    createdAt: string;
}

export const PREDEFINED_FLOWS: FlowConfig[] = [
    {
        id: 'standard',
        name: 'Standard Flow',
        steps: ['pick', 'match', 'config', 'checkout', 'confirmation'],
        minProducts: 1,
        maxProducts: 10,
        requireMatch: false,
        requireConfig: false
    },
    {
        id: 'quick_buy',
        name: 'Quick Buy (No Match/Config)',
        steps: ['pick', 'checkout', 'confirmation'],
        minProducts: 1,
        maxProducts: 5,
        requireMatch: false,
        requireConfig: false
    },
    {
        id: 'strict_bundle',
        name: 'Strict Bundle Builder',
        steps: ['pick', 'match', 'config', 'checkout', 'confirmation'],
        minProducts: 2,
        maxProducts: 3,
        requireMatch: true,
        requireConfig: true
    }
];
