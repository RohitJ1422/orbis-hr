import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-hire-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  template: `
    <mat-card class="hire-card">
      <mat-card-header>
        <mat-card-title>New Hire Onboarding</mat-card-title>
        <mat-card-subtitle>Submit a new hire to start the provisioning workflow</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="hire-form">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Riya Lal" />
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role / Job Title</mat-label>
            <input matInput formControlName="role" placeholder="e.g. Senior Designer" />
            @if (form.get('role')?.hasError('required') && form.get('role')?.touched) {
              <mat-error>Role is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="startDate" />
            <mat-datepicker-toggle matIconSuffix [for]="picker" />
            <mat-datepicker #picker />
            @if (form.get('startDate')?.hasError('required') && form.get('startDate')?.touched) {
              <mat-error>Start date is required</mat-error>
            }
          </mat-form-field>

          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading"
            class="submit-btn"
          >
            @if (loading) {
              <mat-spinner diameter="20" />
            } @else {
              Start Onboarding
            }
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .hire-card {
      height: 100%;
    }
    .hire-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 16px;
    }
    mat-form-field {
      width: 100%;
    }
    .submit-btn {
      width: 100%;
      height: 44px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  `],
})
export class HireFormComponent {
  hireSubmitted = output<string>();

  private fb = inject(FormBuilder);
  private onboardingService = inject(OnboardingService);
  private snackBar = inject(MatSnackBar);

  loading = false;

  form = this.fb.group({
    name: ['', Validators.required],
    role: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const { name, role, startDate } = this.form.value;
    const isoDate = (startDate as Date).toISOString().split('T')[0];

    this.onboardingService.submitHire({ name: name!, role: role!, startDate: isoDate }).subscribe({
      next: (hireId) => {
        this.loading = false;
        this.snackBar.open(`Onboarding started — ID: ${hireId}`, 'Dismiss', { duration: 5000 });
        this.hireSubmitted.emit(hireId);
        this.form.reset();
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message ?? 'Failed to start onboarding. Please try again.';
        this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
      },
    });
  }
}
