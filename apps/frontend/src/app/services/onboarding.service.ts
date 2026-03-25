import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewHire {
  name: string;
  role: string;
  startDate: string;
}

export interface HireRecord {
  id: string;
  name: string;
  role: string;
  startDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  submitHire(hire: NewHire): Observable<string> {
    return this.http.post<HireRecord>(`${this.base}/onboarding`, hire).pipe(
      switchMap((record) =>
        this.http.post(`${this.base}/agent/run/${record.id}`, {}).pipe(
          map(() => record.id),
        ),
      ),
    );
  }
}
