import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
  data: T;
  status: number;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        const responseData = data === null || data === undefined ? {} : data;
        const message = this.getDefaultMessage(statusCode);
        const finalMessage = responseData.message || message;
        const finalStatus = responseData.status || statusCode;

        if (responseData) {
          delete responseData.message;
          delete responseData.status;
        }

        return {
          status: finalStatus,
          message: finalMessage,
          data: responseData,
        };
      }),
    );
  }

  private getDefaultMessage(status: number): string {
    switch (status) {
      case HttpStatus.OK:
        return 'Request successful';
      case HttpStatus.CREATED:
        return 'Resource created successfully';
      case HttpStatus.ACCEPTED:
        return 'Request accepted';
      case HttpStatus.NO_CONTENT:
        return 'Resource deleted successfully';
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal server error';
      default:
        return 'Request processed successfully';
    }
  }
}
