import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigApiService } from '../../services/config/config-api.service';
import { SalesFlowStateService } from '../../services/flow/sales-flow-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css'
})
export class ConfigurationComponent implements OnInit {
  configApi = inject(ConfigApiService);
  state = inject(SalesFlowStateService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const flow = this.state.activeFlow();
      // Auto-skip ONLY if requireConfig is false AND requirements are loaded and empty
      if (!flow.requireConfig && !this.configApi.loading() && this.configApi.requirements().length === 0 && this.state.currentStep() === 'config') {
        const order = flow.steps;
        const currentIdx = order.indexOf('config');
        const nextStep = order[currentIdx + 1] || 'checkout';
        setTimeout(() => this.router.navigate(['/' + nextStep]), 0);
      }

      // Initialize default values when requirements are loaded and not loading
      if (!this.configApi.loading() && this.configApi.requirements().length > 0) {
        this.initDefaults();
      }
    });
  }

  ngOnInit() {
    this.state.setStep('config');
    const pkg = this.state.selectedPackage();
    if (!pkg) {
      this.router.navigate(['/match']);
      return;
    }
    this.configApi.loadRequirements(pkg.id);
  }

  private initDefaults() {
    const reqs = this.configApi.requirements();
    reqs.forEach(req => {
      if (req.defaultValue && !this.getConfigValue(req.name)) {
        this.state.addConfigValue({
          characteristicName: req.name,
          label: req.label,
          value: req.defaultValue
        });
      }
    });
  }

  getOptions(options: string | null): string[] {
    return options ? options.split(',').map(o => o.trim()) : [];
  }

  getConfigValue(name: string): string {
    const cv = this.state.configValues().find(v => v.characteristicName === name);
    return cv?.value || '';
  }

  onValueChange(name: string, label: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.state.addConfigValue({ characteristicName: name, label, value });
  }

  onInputChange(name: string, label: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.state.addConfigValue({ characteristicName: name, label, value });
  }
}
