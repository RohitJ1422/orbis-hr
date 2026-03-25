import { Component, inject, signal, ElementRef, viewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CompanionService, ChatMessage } from '../../services/companion.service';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

@Component({
  selector: 'app-companion-chat',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card class="chat-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>smart_toy</mat-icon>
          Orbis Companion
        </mat-card-title>
        <mat-card-subtitle>Ask anything about onboarding, policies, or next steps</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="chat-content">
        <div class="message-list" #scrollContainer>
          @if (messages().length === 0) {
            <div class="empty-chat">
              <mat-icon>chat_bubble_outline</mat-icon>
              <p>Start a conversation with your AI companion.</p>
            </div>
          }
          @for (msg of messages(); track $index) {
            <div class="message-row" [ngClass]="msg.role">
              <div class="bubble" [ngClass]="{ streaming: msg.streaming }">
                {{ msg.content }}
                @if (msg.streaming) { <span class="cursor">▍</span> }
              </div>
            </div>
          }
        </div>
      </mat-card-content>

      <mat-card-actions class="chat-input-area">
        <mat-form-field appearance="outline" class="input-field">
          <mat-label>Message</mat-label>
          <input
            matInput
            [(ngModel)]="inputText"
            (keydown.enter)="send()"
            placeholder="Ask about onboarding policies, next steps…"
            [disabled]="loading()"
          />
        </mat-form-field>
        <button
          mat-icon-button
          color="primary"
          (click)="send()"
          [disabled]="!inputText.trim() || loading()"
          aria-label="Send message"
        >
          @if (loading()) {
            <mat-spinner diameter="24" />
          } @else {
            <mat-icon>send</mat-icon>
          }
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .chat-card {
      display: flex;
      flex-direction: column;
      height: 420px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chat-content {
      flex: 1;
      overflow: hidden;
      padding-bottom: 0;
    }
    .message-list {
      height: 240px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 4px;
    }
    .empty-chat {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
      mat-icon { font-size: 40px; height: 40px; width: 40px; opacity: 0.4; }
    }
    .message-row {
      display: flex;
      &.user { justify-content: flex-end; }
      &.assistant { justify-content: flex-start; }
    }
    .bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      .message-row.user & {
        background: #1976d2;
        color: #fff;
        border-bottom-right-radius: 4px;
      }
      .message-row.assistant & {
        background: #f5f5f5;
        color: #212121;
        border-bottom-left-radius: 4px;
      }
      &.streaming { opacity: 0.85; }
    }
    .cursor {
      animation: blink 0.8s step-start infinite;
    }
    @keyframes blink { 50% { opacity: 0; } }
    .chat-input-area {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px 16px;
    }
    .input-field {
      flex: 1;
      margin-bottom: 0;
    }
  `],
})
export class CompanionChatComponent implements AfterViewChecked {
  private companionService = inject(CompanionService);

  messages = signal<DisplayMessage[]>([]);
  loading = signal(false);
  inputText = '';

  private history: ChatMessage[] = [];
  private scrollContainer = viewChild<ElementRef>('scrollContainer');
  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      const el = this.scrollContainer()?.nativeElement as HTMLElement | undefined;
      if (el) el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.loading()) return;

    this.inputText = '';
    this.loading.set(true);

    this.messages.update((prev) => [...prev, { role: 'user', content: text }]);
    this.messages.update((prev) => [...prev, { role: 'assistant', content: '', streaming: true }]);
    this.shouldScroll = true;

    this.companionService.chat({ message: text, history: this.history }).subscribe({
      next: (responseText) => {
        this.messages.update((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: responseText, streaming: false };
          return updated;
        });
        this.history.push({ role: 'user', content: text });
        this.history.push({ role: 'assistant', content: responseText });
        this.shouldScroll = true;
        this.loading.set(false);
      },
      error: () => {
        this.messages.update((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            streaming: false,
          };
          return updated;
        });
        this.loading.set(false);
      },
    });
  }
}
