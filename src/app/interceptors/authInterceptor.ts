import { HttpContextToken, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth/auth.service";
import { Observable } from "rxjs";

export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

  if (req.context.get(BYPASS_AUTH)) {
    return next(req);
  }

  const authAccessToken = inject(AuthService).getAccessToken();

  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${authAccessToken}`)
  });

  return next(newReq);
}