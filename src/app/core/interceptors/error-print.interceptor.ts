import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class ErrorPrintInterceptor implements HttpInterceptor {
  constructor(private readonly notificationService: NotificationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        error: (error: unknown) => {
          const status: number = (error as HttpErrorResponse).status;

          switch (status) {
            case 401:
              this.notificationService.showError(
                'You are not authorized. Check the console for the details',
                0
              );
              break;
            case 403:
              this.notificationService.showError(
                'You are forbidden access to this resource. Check the console for the details',
                0
              );
              break;
            default:
              const url = new URL(request.url);

              this.notificationService.showError(
                `Request to "${url.pathname}" failed. Check the console for the details`,
                0
              );
          }
        },
      })
    );
  }
}
