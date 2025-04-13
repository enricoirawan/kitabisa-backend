import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, headers, body, query, params } = request;

    // Log request details (termasuk headers)
    this.logger.log(
      `Request: ${method} ${originalUrl}\nHeaders: ${JSON.stringify(
        headers,
        null,
        2,
      )}\nBody: ${JSON.stringify(body)}\nQuery: ${JSON.stringify(
        query,
      )}\nParams: ${JSON.stringify(params)}`,
    );

    return next.handle().pipe(
      tap((responseBody) => {
        const response = context.switchToHttp().getResponse();
        // Log response details
        this.logger.log(
          `Response: ${method} ${originalUrl} - Status: ${
            response.statusCode
          }\nBody: ${JSON.stringify(responseBody)}`,
        );
      }),
    );
  }
}
