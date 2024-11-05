import { Metadata } from '@grpc/grpc-js';
import { RequestMetadata } from '../metadata/request.metadata';

export function parseMetadata(metadata: Metadata): RequestMetadata {
  const userAgent = metadata.get('user-agent')[0].toString();
  const ipAddress = (
    metadata.get('x-forwarded-for')[0] || '0.0.0.0'
  ).toString();

  return { userAgent, ipAddress };
}
