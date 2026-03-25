import { Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { HireFormComponent } from './components/hire-form/hire-form.component';
import { AgentLogComponent } from './components/agent-log/agent-log.component';
import { CompanionChatComponent } from './components/companion-chat/companion-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    HireFormComponent,
    AgentLogComponent,
    CompanionChatComponent,
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <mat-icon>rocket_launch</mat-icon>
      <span>OrbisHR Onboarding</span>
    </mat-toolbar>

    <main class="layout">
      <div class="top-row">
        <section class="panel left-panel">
          <app-hire-form (hireSubmitted)="onHireSubmitted($event)" />
        </section>

        <section class="panel right-panel">
          <app-agent-log [hireId]="activeHireId()" />
        </section>
      </div>

      <div class="bottom-row">
        <app-companion-chat />
      </div>
    </main>
  `,
  styles: [`
    .toolbar {
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .layout {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-height: calc(100vh - 64px);
      box-sizing: border-box;
    }
    .top-row {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      align-items: start;
    }
    .panel {
      height: 100%;
    }
    .bottom-row {
      width: 100%;
    }
    @media (max-width: 900px) {
      .top-row { grid-template-columns: 1fr; }
    }
  `],
})
export class AppComponent {
  activeHireId = signal<string | null>(null);

  onHireSubmitted(hireId: string): void {
    this.activeHireId.set(hireId);
  }
}
