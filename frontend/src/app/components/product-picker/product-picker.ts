import { Component, inject, OnInit } from '@angular/core';
import { ProductApiService } from '../../services/product/product-api.service';
import { SalesFlowStateService } from '../../services/flow/sales-flow-state.service';
import { CartApiService } from '../../services/cart/cart-api.service';
import { Product } from '../../models/ecommerce.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-picker',
  standalone: true,
  templateUrl: './product-picker.html',
  styleUrl: './product-picker.css'
})
export class ProductPickerComponent implements OnInit {
  productApi = inject(ProductApiService);
  state = inject(SalesFlowStateService);
  private cartApi = inject(CartApiService);
  private router = inject(Router);

  ngOnInit() {
    this.state.setStep('pick');
    this.productApi.loadProducts();
  }

  selectProduct(product: Product) {
    const isSelected = this.state.isProductSelected(product.id);
    const flow = this.state.activeFlow();

    if (!isSelected && this.state.selectedProducts().length >= flow.maxProducts) {
      alert(`The '${flow.name}' only allows up to ${flow.maxProducts} products.`);
      return;
    }

    this.state.toggleProduct(product);
  }
}
