export interface SimpleUser {
  _id: string;
  full_name: string;
  username: string;
  bio?: string;
  profile_picture: string;
}

export interface DisplayUser {
  _id: string;
  full_name: string;
  username: string;

  bio?: string;
  location?: string;

  profile_picture: string;
  cover_photo?: string;

  followers: string[];
  following: string[];
  connections: string[];

  createdAt?: string;
}
