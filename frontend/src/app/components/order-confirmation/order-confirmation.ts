import { Component, inject, OnInit } from '@angular/core';
import { OrderApiService, SalesFlowStateService, CartApiService } from '../../services/ecommerce.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-order-confirmation',
    standalone: true,
    template: `
    @if (orderApi.currentOrder(); as order) {
      <div class="confirmation-container animate-in">
        <div class="confirmation-icon">✓</div>
        <h1 class="confirmation-title">Order Confirmed!</h1>
        <p class="confirmation-subtitle">Thank you for your purchase. Your order has been placed successfully.</p>
        <div class="order-id">Order #{{ order.id }}</div>

        <div class="checkout-items" style="text-align: left; margin-top: 2rem;">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Order Details</h3>
          @for (item of order.items; track item.id) {
            <div class="checkout-item">
              <div class="checkout-item-info">
                <div class="checkout-item-name">{{ item.productName }}</div>
                @if (item.configValues) {
                  <div class="checkout-item-config">{{ formatConfig(item.configValues) }}</div>
                }
              </div>
              <div class="checkout-item-price">\${{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          }
          <div class="summary-total">
            <span>Total Paid</span>
            <span class="summary-total-price">\${{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <button class="btn btn-primary btn-lg mt-4" (click)="startNewOrder()">
          Start New Order →
        </button>
      </div>
    } @else if (orderApi.loading()) {
      <div class="loader"><div class="spinner"></div> Processing your order...</div>
    } @else {
      <div class="confirmation-container animate-in">
        <div class="empty-state-icon">🔍</div>
        <p>No order found.</p>
        <button class="btn btn-primary mt-2" (click)="startNewOrder()">Start Shopping</button>
      </div>
    }
  `
})
export class OrderConfirmationComponent implements OnInit {
    orderApi = inject(OrderApiService);
    state = inject(SalesFlowStateService);
    private cartApi = inject(CartApiService);
    private router = inject(Router);

    ngOnInit() {
        this.state.setStep('confirmation');
    }

    formatConfig(configJson: string): string {
        try {
            const configs: { label: string; value: string }[] = JSON.parse(configJson);
            return configs.map(c => `${c.label}: ${c.value}`).join(' · ');
        } catch {
            return configJson;
        }
    }

    startNewOrder() {
        const sessionId = this.state.sessionId();
        this.cartApi.clearCart(sessionId).subscribe();
        this.state.reset();
        this.router.navigate(['/pick']);
    }
}
