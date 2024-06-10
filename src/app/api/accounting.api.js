import { httpService } from "@/services/httpService";

class AccountingAPI {
  getUserUrl = (name) => `/api/user/${name}`;

  getUsers = async () => {
    try {
      const res = await httpService.nextService.get(this.getUserUrl("search"));
      return res;
    } catch (e) {
      console.log(e);
      return { users: [] };
    }
  };

  getProfile = async () => {
    try {
      const { ok, user } = await httpService.nextService.get(this.getUserUrl("profile"));
      return user;
    } catch {
      return { user: null };
    }
  };

  showCofounderDetails = async (user) => {
    return await httpService.nextService.post(this.getUserUrl("showCoFounder"), { id: user._id, clicks: user.clicks + 1 });
  };

  updateUserProfile = async (user) => {
    return await httpService.nextService.post(this.getUserUrl("update"), user);
  };

  signUp = async (user) => {
    return await httpService.nextService.post(this.getUserUrl("signup"), user);
  };
}


export const accountingApi = new AccountingAPI();