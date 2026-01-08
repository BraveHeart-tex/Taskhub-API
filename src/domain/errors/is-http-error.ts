import type { FastifyHttpError } from './types';

export function isFastifyHttpError(err: unknown): err is FastifyHttpError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    // biome-ignore lint/suspicious/noExplicitAny: this is fine here
    typeof (err as any).statusCode === 'number'
  );
}
