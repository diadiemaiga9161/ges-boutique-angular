import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, BehaviorSubject } from 'rxjs';

export type WsTopicEvent = {
  type: string;
  timestamp: string;
  data: any;
};

export type WsStatus = 'connecting' | 'connected' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {

  private client: Client;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private subjects: Map<string, Subject<WsTopicEvent>> = new Map();

  private statusSubject = new BehaviorSubject<WsStatus>('disconnected');
  status$ = this.statusSubject.asObservable();

  private wsUrl = `${window.location.origin}/ws`;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        this.statusSubject.next('connected');
        this.resubscribeAll();
      },
      onDisconnect: () => {
        this.statusSubject.next('disconnected');
      },
      onStompError: () => {
        this.statusSubject.next('disconnected');
      }
    });
  }

  connect(): void {
    if (!this.client.active) {
      this.statusSubject.next('connecting');
      this.client.activate();
    }
  }

  disconnect(): void {
    this.client.deactivate();
    this.statusSubject.next('disconnected');
  }

  isConnected(): boolean {
    return this.statusSubject.value === 'connected';
  }

  subscribeTopic(topic: string): Subject<WsTopicEvent> {
    if (!this.subjects.has(topic)) {
      this.subjects.set(topic, new Subject<WsTopicEvent>());
    }
    if (this.client.active && this.client.connected && !this.subscriptions.has(topic)) {
      this.doSubscribe(topic);
    }
    return this.subjects.get(topic)!;
  }

  unsubscribeTopic(topic: string): void {
    const sub = this.subscriptions.get(topic);
    if (sub) { sub.unsubscribe(); this.subscriptions.delete(topic); }
  }

  private doSubscribe(topic: string): void {
    const sub = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const event: WsTopicEvent = JSON.parse(message.body);
        this.subjects.get(topic)?.next(event);
      } catch { /* ignorer messages non-JSON */ }
    });
    this.subscriptions.set(topic, sub);
  }

  private resubscribeAll(): void {
    this.subscriptions.clear();
    this.subjects.forEach((_, topic) => this.doSubscribe(topic));
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.subjects.forEach(s => s.complete());
  }
}
