import { v1, v4, v6, v7, validate, version } from 'uuid';

export function generate() {
  const ver = Number(process.env.ROOM_CODE_UUID_VER);
  switch (ver) {
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
  const ver = Number(process.env.ROOM_CODE_UUID_VER);

  return validate(uuid) && version(uuid) === ver;
}
