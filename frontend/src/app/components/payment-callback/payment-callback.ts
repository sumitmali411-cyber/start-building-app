import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderApiService, SalesFlowStateService } from '../../services/ecommerce.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  template: `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:1.5rem; text-align:center;">
      @if (status === 'processing') {
        <div class="spinner"></div>
        <p class="flow-subtitle">Processing your payment...</p>
      } @else if (status === 'cancelled') {
        <div style="font-size:3rem;">✕</div>
        <h2 class="flow-title">Payment Cancelled</h2>
        <p class="flow-subtitle">Your payment was cancelled. Returning to checkout...</p>
      } @else if (status === 'error') {
        <div style="font-size:3rem;">⚠</div>
        <h2 class="flow-title">Something went wrong</h2>
        <p class="flow-subtitle">{{ errorMessage }}</p>
        <button class="btn btn-primary" (click)="goCheckout()">Back to Checkout</button>
      }
    </div>
  `
})
export class PaymentCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderApi = inject(OrderApiService);
  private state = inject(SalesFlowStateService);

  status: 'processing' | 'cancelled' | 'error' = 'processing';
  errorMessage = '';

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const paymentStatus = params.get('status');
    const sessionId = params.get('sessionId') || this.state.sessionId();

    if (paymentStatus === 'CANCELLED') {
      this.status = 'cancelled';
      setTimeout(() => this.goCheckout(), 2000);
      return;
    }

    if (paymentStatus === 'SUCCESS') {
      const transactionId = params.get('transactionId') || undefined;
      this.orderApi.createOrder(sessionId, transactionId).subscribe(order => {
        if (order) {
          this.router.navigate(['/order-confirmation']);
        } else {
          this.status = 'error';
          this.errorMessage = 'Failed to create order. Please contact support.';
        }
      });
    } else {
      this.status = 'error';
      this.errorMessage = 'Unknown payment status received.';
    }
  }

  goCheckout() {
    this.router.navigate(['/checkout']);
  }
}
