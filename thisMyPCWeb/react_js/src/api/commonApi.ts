import axios from "axios";
export const get = () => {
  return axios.get("url");
};
export const post = () => {
  return axios.post("url");
};
export const put = () => {
  return axios.put("url");
};
export const deleteRequest = () => {
  return axios.delete("url");
};
