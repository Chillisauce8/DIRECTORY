import * as crypto from 'crypto';


function getGithubPayloadSignatureHash(req: Request) {
  const signatureHeaderName = 'X-Hub-Signature-256';

  const rawValue: string = req['headers'][signatureHeaderName] ?? req['headers'][signatureHeaderName.toLowerCase()];

  if (!rawValue) {
    return null;
  }

  return rawValue.replace('sha256=', '');
}


function needCheckSignature(req: Request): boolean {
  const signature = getGithubPayloadSignatureHash(req);

  return !!signature;
}


function calcPayloadSignatureCache(req: Request, secret: string): string {
  const payload = req['rawBody'];

  const calculatedSignature = crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return calculatedSignature;
}
