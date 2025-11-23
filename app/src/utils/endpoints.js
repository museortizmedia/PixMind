export const ENDPOINTS = /** @type {const} */ ({
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  ADMIN_USERS: "/admin/users",

  // No implementados, models fucniona en local pero es / en prod (unificar)
  models: "/model"
});