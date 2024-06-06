import axios from "axios";

export const api = axios.create({
  withCredentials: false,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
