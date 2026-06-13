export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
}
