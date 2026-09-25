import api from "./api";

export const login = (data) => {
    return api.post("/api/v1/auth/login", data);
};