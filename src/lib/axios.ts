import { API_BASE_URL } from "@/config/enviroment";
import axios from "axios";

axios.defaults.baseURL = API_BASE_URL;
const api = axios;

export default api;
