import axios from "axios";

const client = axios.create({
  baseURL: "https://localhost:44321/",
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
