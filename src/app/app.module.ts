import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './shared/inmemory-db/inmemory-db.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AuthInterceptor } from './shared/services/auth.interceptor';
import { CacheInterceptor } from './shared/interceptors/cache.interceptor';
import { LoadingInterceptor } from './shared/interceptors/loading.interceptor';
import { ChatbotAssistantComponent } from './shared/components/chatbot-assistant/chatbot-assistant.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true }),
    AppRoutingModule,
    NgbModule,
    ChatbotAssistantComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
