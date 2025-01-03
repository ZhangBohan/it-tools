import jwtDecode, { type JwtHeader, type JwtPayload } from 'jwt-decode';
import jwtEncode from 'jwt-encode';
import _ from 'lodash';
import { ALGORITHM_DESCRIPTIONS, CLAIM_DESCRIPTIONS } from './jwt-expire-later.constants';

export { decodeJwt, expireJwtLater };

function expireJwtLater({ rawJwt, rawSecret, daysLater }: { rawJwt: string; rawSecret: string; daysLater: number }) {
  const rawPayload = jwtDecode<JwtPayload>(rawJwt);

  const newExp = Math.floor(Date.now() / 1000) + daysLater * 24 * 60 * 60;

  return jwtEncode({ ...rawPayload, exp: newExp }, rawSecret);
}

function decodeJwt({ jwt }: { jwt: string }) {
  const rawHeader = jwtDecode<JwtHeader>(jwt, { header: true });
  const rawPayload = jwtDecode<JwtPayload>(jwt);

  const header = _.map(rawHeader, (value, claim) => parseClaims({ claim, value }));
  const payload = _.map(rawPayload, (value, claim) => parseClaims({ claim, value }));

  return {
    header,
    payload,
  };
}

function parseClaims({ claim, value }: { claim: string; value: unknown }) {
  const claimDescription = CLAIM_DESCRIPTIONS[claim];
  const formattedValue = _.isPlainObject(value) || _.isArray(value) ? JSON.stringify(value, null, 3) : _.toString(value);
  const friendlyValue = getFriendlyValue({ claim, value });

  return {
    value: formattedValue,
    friendlyValue,
    claim,
    claimDescription,
  };
}

function getFriendlyValue({ claim, value }: { claim: string; value: unknown }) {
  if (['exp', 'nbf', 'iat'].includes(claim)) {
    return dateFormatter(value);
  }

  if (claim === 'alg' && _.isString(value)) {
    return ALGORITHM_DESCRIPTIONS[value];
  }

  return undefined;
}

function dateFormatter(value: unknown) {
  if (_.isNil(value)) {
    return undefined;
  }

  const date = new Date(Number(value) * 1000);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
