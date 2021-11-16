import axios from "axios";

const token = localStorage.getItem("DEEZER_access_token");

export const deezerAxios = axios.create({
  baseURL: "https://api.deezer.com",
  headers: { Authorization: `Bearer ${token}` },
});

const headers = () => {
  const token = localStorage.getItem("DEEZER_access_token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

deezerAxios.interceptors.response.use(
  (response) => {
    if (response.data?.error?.code === 300) {
      window.location.reload();
    } else {
      return response;
    }
  },
  (error) => {
    if (error && error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.replace("/");
    }
    return Promise.reject(error);
  }
);

export const dispatch = (data: any, url: string) =>
  deezerAxios.post(url, data, headers());
export const receive = (url: string) => deezerAxios.get(url, headers());
export const mutate = (data: any, url: string) =>
  deezerAxios.put(url, data, headers());
export const remove = (url: string) => deezerAxios.delete(url, headers());
