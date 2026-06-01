import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth/auth.service";
import { catchError, finalize, map, Observable, shareReplay, switchMap, throwError } from "rxjs";
import { Response } from "../interfaces/response.interface";

let refreshTokenInFlight$: Observable<string> | null = null;

function getRefreshToken$(authService: AuthService): Observable<string> {
  if (!refreshTokenInFlight$) {
    refreshTokenInFlight$ = authService.refreshToken().pipe(
      map((newTokenResponse) => {
        const newAccessToken = newTokenResponse.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Refresh token response did not include an access token.');
        }

        authService.saveAccessToken(newAccessToken);
        return newAccessToken;
      }),
      finalize(() => {
        refreshTokenInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  return refreshTokenInFlight$;
}

export function refreshTokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const serverMessage = err.error as Response<null>;

      if (!(err.status === 401 && serverMessage.message === "Unauthorized! Access Token was expired!")) {
        return throwError(() => err);
      }

      return getRefreshToken$(authService).pipe(
        switchMap((newAccessToken) => {
          const newReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newAccessToken}`)
          });

          return next(newReq);
        }),
        catchError((refreshErr) => throwError(() => refreshErr))
      );
    })
  );
}