import { IUser } from '../user/userInterface';

export interface IRole {
  id: string;
  name: string;
  description: string;
  users?: IUser[];
}
