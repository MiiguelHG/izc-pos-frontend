import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth/auth.service";
import { catchError, Observable, switchMap, throwError } from "rxjs";
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
          const newReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newTokenResponse.data?.accessToken}`)
          })
          return next(newReq);
        }),
        catchError((refreshErr) => {
          return throwError(() => refreshErr);
        }
      ));
    })
  );
}