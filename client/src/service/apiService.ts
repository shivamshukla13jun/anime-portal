import { INotificationUpdate, IUser, LoginFormData, ITaxOption } from "@/types";

import api from "@/utils/axiosInterceptor";

const apiService = {
   Users:{
  // user services
  getUsers: async (params:Record<string,any>={limit:10,page:1}) => {
    const response = await api.get("/users", {params});
    return response.data;
  },
  getUser: async (id:string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData:IUser) => {
    const response = await api.post("/users", userData);
    return response.data;
  },
  updateUser: async (id:string, userData:IUser) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id:string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  ActivateUser: async (id:string,isActive=true) => {
    const response = await api.put(`/users/activate/${id}`, {isActive});
    return response.data;
  },
  BlockUser: async (id:string,isBlocked=true) => { 
    const response = await api.put(`/users/block/${id}`, {isBlocked});
    return response.data;
  }
   },
   AuthService:{
      login: async (userData:LoginFormData) => {
    const response = await api.post("/auth/login", userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  }
  ,
 
  register: async (userData:IUser) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  forgetPassword: async (email:string) => {
    const response = await api.post("/auth/forget-password", {email});
    return response.data;
  },
  currentUser: async () => {
    const response = await api.get("/auth/current-user");
    return response.data;
  },
  resetPassword: async (token:string, password:string) => {
    const response = await api.post("/auth/reset-password", {token, password});
    return response.data;
  },
   }
};

export default apiService;
