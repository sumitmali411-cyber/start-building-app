import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SalesFlowStateService, CartApiService, OrderApiService, FlowApiService } from './services/ecommerce.service';
import { SalesFlowStep, FlowConfig, PREDEFINED_FLOWS } from './models/ecommerce.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- NAVBAR -->
    <nav class="navbar">
      <div style="display:flex; align-items:center; gap:1.5rem">
        <span class="navbar-brand" (click)="goHome()" style="cursor:pointer">⚡ ShopFlow</span>
        @if (state.currentStep() === 'pick') {
          <select class="flow-selector" style="background:#1a1c23; color:#fff; padding:0.4rem; border-radius:0.4rem; border:1px solid #333;" (change)="onFlowChange($event)">
            @for (flow of availableFlows; track flow.id) {
              <option [value]="flow.id" [selected]="state.activeFlow().id === flow.id">{{ flow.name }}</option>
            }
          </select>
        } @else {
          <span class="active-flow-label" style="background:#6366f122; color:#a5b4fc; padding: 0.2rem 0.6rem; border-radius:0.4rem; font-size:0.8rem; border: 1px solid #6366f144">{{ state.activeFlow().name }}</span>
        }
      </div>
      <div class="navbar-actions">
        @if (state.currentStep() !== 'confirmation') {
          <div class="cart-badge" (click)="goToCheckout()">
            🛒 Cart
            @if (cartApi.itemCount() > 0) {
              <span class="cart-count">{{ cartApi.itemCount() }}</span>
            }
          </div>
        }
      </div>
    </nav>

    <!-- STEP INDICATOR -->
    @if (state.currentStep() !== 'confirmation') {
      <div class="sales-flow-layout" style="padding-bottom: 0; margin-bottom: 0;">
        <div class="step-indicator">
          @for (s of getActiveSteps(); track s.key; let i = $index) {
            <div class="step"
                 [class.active]="state.currentStep() === s.key"
                 [class.completed]="isStepCompleted(s.key)">
              <span class="step-number">
                @if (isStepCompleted(s.key)) { ✓ } @else { {{ i + 1 }} }
              </span>
              {{ s.label }}
            </div>
            @if (i < getActiveSteps().length - 1) {
              <div class="step-connector" [class.completed]="isStepCompleted(s.key)"></div>
            }
          }
        </div>
      </div>
    }

    <!-- PAGE CONTENT -->
    <div class="sales-flow-layout">
      <router-outlet />
    </div>

    <!-- FOOTER BAR -->
    @if (showFooter()) {
      <div class="flow-footer">
        <div class="flow-footer-inner">
          <div class="footer-info">
            @if (state.currentStep() === 'pick') {
              <span>{{ state.selectedProducts().length }} product(s) selected</span>
            } @else if (state.currentStep() === 'match') {
              @if (state.selectedPackage(); as pkg) {
                <span>{{ pkg.name }}</span>
              } @else {
                <span>Select a package to continue</span>
              }
            } @else if (state.currentStep() === 'checkout') {
              <span>{{ cartApi.itemCount() }} item(s)</span>
              <span class="footer-price">&nbsp;· \${{ cartApi.totalAmount().toFixed(2) }}</span>
            }
          </div>
          <div class="footer-actions">
            @if (state.currentStep() !== 'pick') {
              <button class="btn btn-secondary" (click)="goBack()">← Back</button>
            }
            <button class="btn btn-primary"
                    [disabled]="!canContinue()"
                    (click)="onContinue()">
              @if (state.currentStep() === 'checkout') {
                Place Order →
              } @else {
                Continue →
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AppComponent {
  state = inject(SalesFlowStateService);
  cartApi = inject(CartApiService);
  flowApi = inject(FlowApiService);
  private orderApi = inject(OrderApiService);
  private router = inject(Router);

  availableFlows = PREDEFINED_FLOWS;

  getActiveSteps() {
    return this.state.activeFlow().steps.map(s => ({ key: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
  }

  onFlowChange(event: any) {
    const selectedId = event.target.value;
    const flow = this.availableFlows.find(f => f.id === selectedId);
    if (flow) {
      this.state.setActiveFlow(flow);
    }
  }

  showFooter = computed(() => {
    const step = this.state.currentStep();
    return step !== 'confirmation';
  });

  isStepCompleted(step: SalesFlowStep): boolean {
    const order = this.state.activeFlow().steps;
    const currentIdx = order.indexOf(this.state.currentStep());
    const stepIdx = order.indexOf(step);
    if (stepIdx === -1) return false;
    return stepIdx < currentIdx;
  }

  canContinue(): boolean {
    const flow = this.state.activeFlow();
    switch (this.state.currentStep()) {
      case 'pick':
        const count = this.state.selectedProducts().length;
        return count >= flow.minProducts && count <= flow.maxProducts;
      case 'match': return this.state.selectedPackage() !== null || !flow.requireMatch;
      case 'config': return true;
      case 'checkout': return this.cartApi.itemCount() > 0;
      default: return false;
    }
  }

  onContinue() {
    const flow = this.state.activeFlow();
    const order = flow.steps;
    const currentIdx = order.indexOf(this.state.currentStep());
    const nextStep = order[currentIdx + 1];

    switch (this.state.currentStep()) {
      case 'pick':
        this.flowApi.initFlow().subscribe(session => {
          if (session) {
            if (nextStep === 'checkout') {
              this.addItemsToCartAndContinue(nextStep);
            } else {
              this.router.navigate(['/' + nextStep]);
            }
          }
        });
        break;
      case 'match':
        if (nextStep === 'checkout') {
          this.addItemsToCartAndContinue(nextStep);
        } else {
          this.router.navigate(['/' + nextStep]);
        }
        break;
      case 'config':
        this.addItemsToCartAndContinue(nextStep);
        break;
      case 'checkout':
        this.placeOrder();
        break;
    }
  }

  private addItemsToCartAndContinue(nextStep: string) {
    const pkg = this.state.selectedPackage();
    const isQuickBuy = !this.state.activeFlow().requireMatch;

    if (pkg) {
      const configValues = this.state.configValues();
      const configJson = JSON.stringify(configValues.map(cv => ({ label: cv.label, value: cv.value })));

      pkg.products.forEach(product => {
        this.cartApi.addToCart({
          sessionId: this.state.sessionId(),
          productId: product.id,
          packageId: pkg.id,
          productName: product.name,
          price: product.price * (1 - pkg.discount / 100),
          quantity: 1,
          characteristicValues: configJson
        }).subscribe();
      });
    } else if (isQuickBuy) {
      // Just add single selected products to cart directly
      this.state.selectedProducts().forEach(product => {
        this.cartApi.addToCart({
          sessionId: this.state.sessionId(),
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1
        }).subscribe();
      });
    }

    setTimeout(() => {
      this.cartApi.loadCart(this.state.sessionId());
      this.router.navigate(['/' + nextStep]);
    }, 500);
  }

  private placeOrder() {
    this.orderApi.createOrder(this.state.sessionId()).subscribe(order => {
      if (order) {
        this.router.navigate(['/order-confirmation']);
      }
    });
  }

  goBack() {
    const order = this.state.activeFlow().steps;
    const currentIdx = order.indexOf(this.state.currentStep());
    if (currentIdx > 0) {
      this.router.navigate(['/' + order[currentIdx - 1]]);
    }
  }

  goHome() {
    const sessionId = this.state.sessionId();
    this.cartApi.clearCart(sessionId).subscribe();
    this.state.reset();
    this.router.navigate(['/pick']);
  }

  goToCheckout() {
    if (this.cartApi.itemCount() > 0) {
      this.router.navigate(['/checkout']);
    }
  }
}
