type Room = {
  participants: Participants | null;
  lastJoinedAt: number;
  lastFetchedAt: number;
};

type Participants = {
  [sub: string]: {
    name: string;
    email: string;
    picture: string;
  };
};
