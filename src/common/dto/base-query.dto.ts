// src/common/dto/base-query.dto.ts
import { IntersectionType, PartialType } from '@nestjs/swagger';
import { BaseEntity, BaseQueryEntity } from '../entities/Base.entity';

export function BaseQueryDto<T extends new (...args: any[]) => any>(Base: T) {
  return PartialType(IntersectionType(Base, BaseQueryEntity));
}

export function BaseReponseDto<T extends new (...args: any[]) => any>(Base: T) {
  return PartialType(IntersectionType(Base, BaseEntity));
}
