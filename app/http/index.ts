import axios, { AxiosInstance } from "axios";

const config = {
  baseURL: "https://api.dagpi.xyz/auth/",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Dagpi-Central",
    Authorization: process.env.TOKEN,
  },
};

export class Http {
  private http: AxiosInstance;

  createInstance() {
    this.http = axios.create(config);
  }

  public client(): AxiosInstance {
    return this.http;
  }
}

export const http = new Http();
