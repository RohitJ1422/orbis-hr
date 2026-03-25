import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class CompanionService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  chat(payload: ChatRequest): Observable<string> {
    return this.http.post(`${this.base}/companion/chat`, payload, {
      responseType: 'text',
    });
  }
}
