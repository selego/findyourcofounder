import { httpService } from "@/services/httpService";

class AccountingAPI {
  setURL = (url) => `${ACCOUNTING_BASE_URL}/${url}`;

  getUsers = async () => {
    try {
      const res = await httpService.nextService.get("/api/user/search");
      return res;
    } catch (e) {
      console.log(e);
      return { users: [] };
    }
  };

  getProfile = async () => {
    try {
      const { ok, user } = await httpService.nextService.get("/api/user/profile");
      return user;
    } catch {
      return { user: null };
    }
  };

  showCofounderDetails = async (user) => {
    return await httpService.nextService.post("/api/user/showCoFounder", { id: user._id, clicks: user.clicks + 1 });
  };

  updateUserProfile = async (user) => {
    return await httpService.nextService.post("/api/user/update", user);
  };

  signUp = async (user) => {
    return await httpService.nextService.post("/api/user/signup", user);
  };
}


export const accountingApi = new AccountingAPI();