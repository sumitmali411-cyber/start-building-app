import { Component, inject, OnInit } from '@angular/core';
import { ProductMatchApiService } from '../../services/product/product-match-api.service';
import { SalesFlowStateService } from '../../services/flow/sales-flow-state.service';
import { ProductPackage } from '../../models/ecommerce.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-package-matcher',
  standalone: true,
  templateUrl: './package-matcher.html',
  styleUrl: './package-matcher.css'
})
export class PackageMatcherComponent implements OnInit {
  matchApi = inject(ProductMatchApiService);
  state = inject(SalesFlowStateService);
  private router = inject(Router);

  ngOnInit() {
    this.state.setStep('match');
    this.matchApi.matchProducts();
  }

  selectPackage(pkg: ProductPackage) {
    this.state.setPackage(pkg);
  }

  goBack() {
    this.router.navigate(['/pick']);
  }
}
