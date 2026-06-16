import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStoreService {
  private ls = window.localStorage;
  
  constructor() { }

  public setItem(key: string, value: any): void {
    this.ls.setItem(key, JSON.stringify(value));
  }

  public getItem(key: string): any {
    const value = this.ls.getItem(key);
    if (value === null || value === undefined) {
      return null;
    }
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  public getItemString(key: string): string | null {
    const value = this.ls.getItem(key);
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'string') {
        return parsed;
      }
      return JSON.stringify(parsed);
    } catch (e) {
      return value;
    }
  }

  public removeItem(key: string): void {
    this.ls.removeItem(key);
  }

  public clear(): void {
    this.ls.clear();
  }
}