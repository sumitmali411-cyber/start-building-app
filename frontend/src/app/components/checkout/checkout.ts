import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartApiService, SalesFlowStateService, OrderApiService, PaymentApiService } from '../../services/ecommerce.service';
import { PaymentMethod } from '../../models/ecommerce.model';
import { Router } from '@angular/router';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flow-header animate-in">
      <h1 class="flow-title">Review & Checkout</h1>
      <p class="flow-subtitle">Review your order details and select a payment method</p>
    </div>

    <div class="checkout-layout">
      <!-- LEFT COLUMN -->
      <div class="checkout-left animate-in animate-delay-1">
        
        <!-- ORDER ITEMS -->
        <div class="checkout-items mb-4">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Order Items</h3>
          @for (item of cartApi.items(); track item.id) {
            <div class="checkout-item">
              <div class="checkout-item-info">
                <div class="checkout-item-name">{{ item.productName }}</div>
                @if (item.characteristicValues) {
                  <div class="checkout-item-config">
                    {{ formatConfig(item.characteristicValues) }}
                  </div>
                }
              </div>
              <div class="checkout-item-price">\${{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>Your cart is empty</p>
            </div>
          }
        </div>
        
        <!-- BILLING DETAILS FORM -->
        <div class="checkout-items mb-4">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Billing Details</h3>
          <form [formGroup]="billingForm" class="billing-form">
            <div class="form-group mb-3">
              <label class="form-label text-muted" style="font-size: 0.9rem;">Full Name</label>
              <input type="text" class="form-control" formControlName="fullName" placeholder="John Doe"
                     style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.75rem; border-radius: 8px; width: 100%;">
            </div>
            <div class="form-group mb-3">
              <label class="form-label text-muted" style="font-size: 0.9rem;">Email Address</label>
              <input type="email" class="form-control" formControlName="email" placeholder="john@example.com"
                     style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.75rem; border-radius: 8px; width: 100%;">
            </div>
            <div class="form-group mb-3">
              <label class="form-label text-muted" style="font-size: 0.9rem;">Phone Number</label>
              <input type="tel" class="form-control" formControlName="phone" placeholder="1234567890"
                     style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.75rem; border-radius: 8px; width: 100%;">
            </div>
          </form>
        </div>
        
        <!-- PAYMENT METHOD -->
        <div class="checkout-items">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Payment Method</h3>
          
          <div class="payment-options">
            <div class="payment-card" 
                 [class.selected]="selectedMethod() === 'razorpay'"
                 (click)="selectMethod('razorpay')">
              <div class="payment-radio">
                <div class="radio-inner" *ngIf="selectedMethod() === 'razorpay'"></div>
              </div>
              <div class="payment-info">
                <span class="payment-name">Razorpay (Test)</span>
                <span class="payment-desc">Wallet, Cards, NetBanking</span>
              </div>
            </div>
            
            <div class="payment-card" 
                 [class.selected]="selectedMethod() === 'adumo'"
                 (click)="selectMethod('adumo')">
              <div class="payment-radio">
                <div class="radio-inner" *ngIf="selectedMethod() === 'adumo'"></div>
              </div>
              <div class="payment-info">
                <span class="payment-name">Adumo Online (Test)</span>
                <span class="payment-desc">Secure Hosted Payment</span>
              </div>
            </div>
          </div>
        </div>

      </div> <!-- END LEFT COLUMN -->

      <!-- RIGHT COLUMN (SUMMARY) -->
      <div class="checkout-summary animate-in animate-delay-2">
        <div class="summary-title">Order Summary</div>

        @if (state.selectedPackage(); as pkg) {
          <div class="summary-row">
            <span>Package</span>
            <span>{{ pkg.name }}</span>
          </div>
          @if (pkg.discount > 0) {
            <div class="summary-row" style="color: var(--success);">
              <span>Discount</span>
              <span>-{{ pkg.discount }}%</span>
            </div>
          }
        }

        <div class="summary-row">
          <span>Items</span>
          <span>{{ cartApi.itemCount() }}</span>
        </div>

        <div class="summary-total">
          <span>Total</span>
          <span class="summary-total-price">\${{ cartApi.totalAmount().toFixed(2) }}</span>
        </div>

        <button class="btn btn-primary btn-block mt-4" 
                [disabled]="cartApi.itemCount() === 0 || paymentApi.loading() || orderApi.loading() || billingForm.invalid"
                (click)="processPayment()">
          @if (paymentApi.loading() || orderApi.loading()) {
            <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> Processing...
          } @else {
            Pay \${{ cartApi.totalAmount().toFixed(2) }} →
          }
        </button>
      </div>
    </div>
    
    <!-- ADUMO SIMULATED MODAL -->
    @if (showAdumoModal()) {
      <div class="modal-backdrop">
        <div class="modal-content animate-in">
          <h2>{{ selectedMethod() === 'adumo' ? 'Adumo Secure Checkout' : 'Test Payment Simulation' }}</h2>
          <p class="text-muted mb-4">Simulating hosted payment redirect for testing...</p>
          <div class="adumo-loading">
            <div class="spinner mb-3" style="width: 40px; height: 40px;"></div>
            Wait while we process your test payment...
          </div>
        </div>
      </div>
    }
  `
})
export class CheckoutComponent implements OnInit {
  cartApi = inject(CartApiService);
  state = inject(SalesFlowStateService);
  orderApi = inject(OrderApiService);
  paymentApi = inject(PaymentApiService);
  private router = inject(Router);

  selectedMethod = signal<PaymentMethod>('razorpay');
  showAdumoModal = signal<boolean>(false);

  billingForm: FormGroup;

  constructor() {
    const fb = inject(FormBuilder);
    this.billingForm = fb.group({
      fullName: ['Test Setup User', [Validators.required, Validators.minLength(2)]],
      email: ['test@example.com', [Validators.required, Validators.email]],
      phone: ['9999999999', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      address: ['123 Test Street, Developer City', [Validators.required]]
    });
  }

  ngOnInit() {
    this.state.setStep('checkout');
    this.cartApi.loadCart(this.state.sessionId());
    this.loadRazorpayScript();
  }

  formatConfig(configJson: string): string {
    try {
      const configs: { label: string; value: string }[] = JSON.parse(configJson);
      return configs.map(c => `${c.label}: ${c.value}`).join(' · ');
    } catch {
      return configJson;
    }
  }

  selectMethod(method: PaymentMethod) {
    this.selectedMethod.set(method);
  }

  private loadRazorpayScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  processPayment() {
    const amount = this.cartApi.totalAmount();
    const method = this.selectedMethod();
    const sessionId = this.state.sessionId();

    this.paymentApi.createPaymentOrder(amount, method, sessionId).subscribe(response => {
      if (!response) return;

      if (method === 'razorpay') {
        if (response.isMock) {
          this.simulateRazorpay(response);
        } else {
          this.openRazorpay(response);
        }
      } else if (method === 'adumo') {
        this.simulateAdumo(response);
      }
    });
  }

  private openRazorpay(orderData: any) {
    const options: any = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'ShopFlow Premium',
      description: 'Transaction ID: ' + orderData.orderId,
      handler: (response: any) => {
        // Payment successful
        this.finalizeOrder(response.razorpay_payment_id);
      },
      prefill: {
        name: this.billingForm.value.fullName,
        email: this.billingForm.value.email,
        contact: this.billingForm.value.phone
      },
      theme: {
        color: '#6366f1'
      }
    };

    try {
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (e) {
      console.error('Razorpay SDK failed to open', e);
      alert('Razorpay SDK failed to open. Check your keys or network.');
    }
  }

  private simulateRazorpay(orderData: any) {
    console.log('Simulating Razorpay Payment (Demo Mode)...');
    this.showAdumoModal.set(true); // Reuse the simulation modal

    setTimeout(() => {
      this.showAdumoModal.set(false);
      this.finalizeOrder('pay_simulated_' + Math.random().toString(36).substring(7));
    }, 2500);
  }

  private simulateAdumo(orderData: any) {
    // Adumo redirects to an external hosted page
    if (orderData.mockRedirectUrl) {
      window.location.href = orderData.mockRedirectUrl;
    } else {
      alert("Redirect URL missing!");
    }
  }

  private finalizeOrder(paymentId: string) {
    this.orderApi.createOrder(this.state.sessionId(), paymentId).subscribe(order => {
      if (order) {
        this.router.navigate(['/order-confirmation']);
      }
    });
  }
}
