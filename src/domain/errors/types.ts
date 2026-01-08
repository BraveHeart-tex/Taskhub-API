export interface HttpErrorPayload {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface FastifyHttpError extends Error {
  statusCode: number;
  error?: HttpErrorPayload['error'];
}
