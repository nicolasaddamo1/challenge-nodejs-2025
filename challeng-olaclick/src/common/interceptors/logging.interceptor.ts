import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { method, originalUrl, body, query, params } = request;
        const userAgent = request.get('user-agent') || '';
        const ip = request.ip;

        console.log(`
[Request] ${method} ${originalUrl}
IP: ${ip}
User Agent: ${userAgent}
Body: ${JSON.stringify(body)}
Query: ${JSON.stringify(query)}
Params: ${JSON.stringify(params)}
    `);

        const now = Date.now();

        return next.handle().pipe(
            tap((data) => {
                console.log(`
[Response] ${method} ${originalUrl} - Status: ${response.statusCode} - ${Date.now() - now}ms
Response: ${JSON.stringify(data).substring(0, 100)}...
        `);
            }),
        );
    }
}