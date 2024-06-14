import { httpService } from "@/services/httpService";
import { configuredUrlForNoCashing } from "../utils/constants";

class AccountingAPI {

  getUsers = async () => {
    try {
      const { ok, data } = await httpService.post(configuredUrlForNoCashing(`search`));
      if (!ok) return { messsage: "Error fetching users", users: [] };
      return { users: data.users };
      return data;
    } catch (e) {
      return { users: [] };
    }
  };

  getProfile = async (userId) => {
    try {
      const { ok, user } = await httpService.get(configuredUrlForNoCashing(`${userId}`));
      if (!session || !session.user) {
        return { ok, message: "User not authenticated" };
      }
      if (!ok) return { ok, message: "User not found" };
      return { ok, user: data };
    } catch (error) {
      console.log("error profile", error);
      return { user: null, ok: false };
    }
  };

  showCofounderDetails = async (user) => {
    const { data, ok } = await httpService.put(configuredUrlForNoCashing(`${user._id}`), {
      clicks: user.clicks + 1,
    });
    if (!ok) return { ok, message: "Error updating user" };
    console.log(data);
    return { ok, data, message: "clicked" };
  };

  updateUserProfile = async (user) => {
    const { data, ok } = await httpService.put(configuredUrlForNoCashing(`${user._id}`), user);
    if (!ok) return { ok, message: "Error updating user" };
    return { ok, message: "User updated" };
  };

  signUp = async (userBody) => {
    const { user, token, ok, code } = await httpService.post(configuredUrlForNoCashing(`signup`), userBody);
    if (code === "PASSWORD_NOT_VALIDATED") return { ok, message: "Password not validated" };
    if (code === "USER_ALREADY_REGISTERED") return { ok, message: "User already registered" };
    if (!ok) return { ok: false, message: "User not created" };
    return { ok: true, message: "User created" };
  };
}


export const accountingApi = new AccountingAPI();