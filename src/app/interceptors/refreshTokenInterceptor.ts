import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth/auth.service";
import { catchError, Observable, switchMap, tap, throwError } from "rxjs";
import { Response } from "../interfaces/response.interface";

export function refreshTokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const serverMessage = err.error as Response<null>;

      if (!(err.status === 401 && serverMessage.message === "Unauthorized! Access Token was expired!")) {
        return throwError(() => err);
      }
      
      return authService.refreshToken().pipe(
        switchMap((newTokenResponse) => {
          const newAccessToken = newTokenResponse.data?.accessToken;
          const newReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newAccessToken}`)
          });
          return next(newReq).pipe(
            tap((event) => {
              if (event instanceof HttpResponse && newAccessToken) {
                authService.saveAccessToken(newAccessToken);
              }
            })
          );
        }),
        catchError((refreshErr) => {
          return throwError(() => refreshErr);
        }
      ));
    })
  );
}