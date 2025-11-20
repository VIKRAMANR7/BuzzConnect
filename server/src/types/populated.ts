import type { IUser } from "@/models/User.js";
import type { IConnection } from "@/models/Connection.js";

export interface PopulatedConnection extends Omit<IConnection, "from_user_id" | "to_user_id"> {
  from_user_id: IUser;
  to_user_id: IUser;
}
