const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    credentials: "include"
  });

  return res.json();
};


export const logoutUser = async () => {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  return res.json();
};

export const createProduct = async() =>{
  const res = await fetch(`${API_URL}/auth/products`, {
    method: "POST",
    credentials: "include"
  });

  return res.json();
};
