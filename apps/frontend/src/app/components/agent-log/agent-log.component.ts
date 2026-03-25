import {
  Component,
  input,
  effect,
  OnDestroy,
  signal,
  ElementRef,
  viewChild,
  AfterViewChecked,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../environments/environment';

export interface AgentEvent {
  type: string;
  event: string;
  message: string;
  employeeId?: string;
  timestamp: string;
  requiresHumanAction?: boolean;
  failedTool?: string;
}

@Component({
  selector: 'app-agent-log',
  standalone: true,
  imports: [DatePipe, NgClass, MatCardModule, MatChipsModule, MatProgressBarModule, MatIconModule, MatDividerModule],
  template: `
    <mat-card class="log-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>receipt_long</mat-icon>
          Agent Event Log
        </mat-card-title>
        @if (connected()) {
          <mat-progress-bar mode="indeterminate" class="progress" />
        }
      </mat-card-header>

      <mat-card-content>
        @if (!hireId()) {
          <div class="empty-state">
            <mat-icon>pending_actions</mat-icon>
            <p>Submit a new hire to see the live agent log.</p>
          </div>
        } @else if (events().length === 0) {
          <div class="empty-state">
            <mat-icon class="spin">sync</mat-icon>
            <p>Connecting to agent stream…</p>
          </div>
        } @else {
          <div class="event-list" #scrollContainer>
            @for (evt of events(); track evt.timestamp + evt.event) {
              <div class="event-item" [ngClass]="statusClass(evt)">
                <div class="event-header">
                  <mat-chip [ngClass]="statusClass(evt)" highlighted>{{ evt.event }}</mat-chip>
                  <span class="timestamp">{{ evt.timestamp | date:'HH:mm:ss' }}</span>
                </div>
                <p class="event-message">{{ evt.message }}</p>
                @if (evt.requiresHumanAction) {
                  <div class="escalation-badge">
                    <mat-icon>warning</mat-icon>
                    Human action required — {{ evt.failedTool }}
                  </div>
                }
              </div>
              <mat-divider />
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .log-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    mat-card-header {
      flex-direction: column;
      gap: 4px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .progress {
      margin-top: 4px;
    }
    mat-card-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 200px;
      color: #666;
      mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.4; }
    }
    .spin { animation: spin 1.5s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .event-list {
      overflow-y: auto;
      flex: 1;
      max-height: 420px;
      padding-top: 8px;
    }
    .event-item {
      padding: 10px 4px;
      &.success { border-left: 3px solid #4caf50; padding-left: 10px; }
      &.failure { border-left: 3px solid #f44336; padding-left: 10px; }
      &.escalation { border-left: 3px solid #ff9800; padding-left: 10px; }
      &.complete { border-left: 3px solid #2196f3; padding-left: 10px; }
    }
    .event-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .timestamp {
      font-size: 11px;
      color: #888;
    }
    .event-message {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
    }
    .escalation-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #ff9800;
      margin-top: 4px;
      mat-icon { font-size: 16px; height: 16px; width: 16px; }
    }
    mat-chip.success { --mdc-chip-label-text-color: #2e7d32; background: #e8f5e9; }
    mat-chip.failure { --mdc-chip-label-text-color: #c62828; background: #ffebee; }
    mat-chip.escalation { --mdc-chip-label-text-color: #e65100; background: #fff3e0; }
    mat-chip.complete { --mdc-chip-label-text-color: #1565c0; background: #e3f2fd; }
  `],
})
export class AgentLogComponent implements OnDestroy, AfterViewChecked {
  hireId = input<string | null>(null);

  events = signal<AgentEvent[]>([]);
  connected = signal(false);

  private eventSource: EventSource | null = null;
  private scrollContainer = viewChild<ElementRef>('scrollContainer');
  private shouldScroll = false;

  constructor() {
    effect(() => {
      const id = this.hireId();
      this.reset();
      if (id) this.connect(id);
    }, { allowSignalWrites: true });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      const el = this.scrollContainer()?.nativeElement as HTMLElement | undefined;
      if (el) el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.close();
  }

  statusClass(evt: AgentEvent): string {
    if (evt.event === 'ESCALATION') return 'escalation';
    if (evt.event.includes('COMPLETE')) return 'complete';
    if (evt.event.includes('FAILED') || evt.event.includes('ERROR')) return 'failure';
    return 'success';
  }

  // All named SSE event types emitted by agent.controller.ts (type: event.event).
  // onmessage only fires for the default "message" type, so we must use addEventListener
  // for each named type the backend sends.
  private static readonly SSE_EVENT_TYPES = [
    'EMPLOYEE_CREATED',
    'EMPLOYEE_CREATE_FAILED',
    'TEAMS_SENT',
    'TEAMS_FAILED',
    'PLAN_GENERATED',
    'PLAN_FAILED',
    'AUDIT_LOGGED',
    'AUDIT_LOG_FAILED',
    'ESCALATION',
    'ONBOARDING_COMPLETE',
    'ONBOARDING_PARTIAL',
  ] as const;

  private connect(hireId: string): void {
    const url = `${environment.apiBaseUrl}/agent/stream/${hireId}`;
    this.eventSource = new EventSource(url);
    this.connected.set(true);

    const handler = (msg: MessageEvent) => {
      try {
        const evt: AgentEvent = JSON.parse(msg.data);
        this.events.update((prev) => [...prev, evt]);
        this.shouldScroll = true;

        if (evt.event === 'ONBOARDING_COMPLETE' || evt.event === 'ONBOARDING_PARTIAL') {
          this.connected.set(false);
          this.close();
        }
      } catch {
        // malformed event — skip
      }
    };

    for (const type of AgentLogComponent.SSE_EVENT_TYPES) {
      this.eventSource.addEventListener(type, handler);
    }

    this.eventSource.onerror = () => {
      this.connected.set(false);
      this.close();
    };
  }

  private reset(): void {
    this.close();
    this.events.set([]);
    this.connected.set(false);
  }

  private close(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}
