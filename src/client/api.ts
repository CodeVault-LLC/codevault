import axios from "axios";
import request from "graphql-request";

const MAIN_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://logsync-api.onrender.com";

export const api = axios.create({
  baseURL: `${MAIN_URL}`,
  withCredentials: false,

  proxy: {
    host: "localhost",
    port: 8080,
  },

  headers: {
    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const graphqlEndpoint = `${MAIN_URL}`;

export const graphqlRequest = async (query: string) => {
  return request(
    graphqlEndpoint,
    query,
    {},
    {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    }
  );
};
