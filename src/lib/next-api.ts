
import axios from "axios";

const nextApi = axios.create({
  baseURL: "http://localhost:3000/api",
});

export default nextApi;
