import { Routes } from '@angular/router';
import { ProductPickerComponent } from './components/product-picker/product-picker';
import { PackageMatcherComponent } from './components/package-matcher/package-matcher';
import { ConfigurationComponent } from './components/configuration/configuration';
import { CheckoutComponent } from './components/checkout/checkout';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation';

export const routes: Routes = [
    { path: '', redirectTo: 'pick', pathMatch: 'full' },
    { path: 'pick', component: ProductPickerComponent },
    { path: 'match', component: PackageMatcherComponent },
    { path: 'config', component: ConfigurationComponent },
    { path: 'checkout', component: CheckoutComponent },
    { path: 'order-confirmation', component: OrderConfirmationComponent },
    { path: '**', redirectTo: 'pick' }
];
