import { CODE_FIELD_NAME, PEER_ID_FIELD_NAME } from '@/static/const';

export const room = {
  create: {
    url: '/api/room/create',
    method: 'GET',
  },
  exist: {
    url: '/api/room/exist',
    method: 'GET',
    searchParams: {
      CODE_FIELD_NAME: CODE_FIELD_NAME,
    },
  },
  join: {
    url: '/api/room/join',
    method: 'POST',
    formData: {
      CODE_FIELD_NAME: CODE_FIELD_NAME,
      PEER_ID_FIELD_NAME: PEER_ID_FIELD_NAME,
    },
  },
  leave: {
    url: '/api/room/leave',
    method: 'POST',
    formData: {
      CODE_FIELD_NAME: CODE_FIELD_NAME,
    },
  },
};
