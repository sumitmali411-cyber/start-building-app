import { Routes } from '@angular/router';
import { ProductPickerComponent } from './components/product-picker/product-picker';
import { PackageMatcherComponent } from './components/package-matcher/package-matcher';
import { ConfigurationComponent } from './components/configuration/configuration';
import { CheckoutComponent } from './components/checkout/checkout';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation';
import { PaymentCallbackComponent } from './components/payment-callback/payment-callback';

export const routes: Routes = [
    { path: '', redirectTo: 'pick', pathMatch: 'full' },
    { path: 'pick', component: ProductPickerComponent },
    { path: 'match', component: PackageMatcherComponent },
    { path: 'config', component: ConfigurationComponent },
    { path: 'checkout', component: CheckoutComponent },
    { path: 'order-confirmation', component: OrderConfirmationComponent },
    { path: 'payment-callback', component: PaymentCallbackComponent },
    { path: '**', redirectTo: 'pick' }
];
