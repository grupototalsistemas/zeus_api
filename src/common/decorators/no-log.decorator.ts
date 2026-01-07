// log-system/decorators/no-log.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const NO_LOG_KEY = 'no-log';
export const NoLog = () => SetMetadata(NO_LOG_KEY, true);
