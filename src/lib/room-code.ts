import { v1, v4, v6, v7, validate, version } from 'uuid';
import { CODE_UUID_VERSION } from '@/static/const';

export function generate() {
  switch (CODE_UUID_VERSION) {
    case 1: {
      return v1();
    }
    case 4: {
      return v4();
    }
    case 6: {
      return v6();
    }
    case 7: {
      return v7();
    }
  }

  return '';
}

export function verify(uuid: string) {
  return validate(uuid) && version(uuid) === CODE_UUID_VERSION;
}
