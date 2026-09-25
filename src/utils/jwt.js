import jwt_decode from "jwt-decode";

export function getDecodedToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    return jwt_decode(token);
  } catch {
    return null;
  }
}