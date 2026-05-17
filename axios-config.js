import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.quackenboss.dev';

axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use(async (request) => {
  const jwtToken = await AsyncStorage.getItem('jwtToken');
  console.log('Request:', request.url, '| Token:', jwtToken ? 'present' : 'MISSING');
  if (jwtToken) {
    request.headers['authorization'] = "Bearer " + jwtToken;
  }
  return request;
});

axios.interceptors.response.use(
  response => response,
  async (error) => {
    console.log('Response error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('userRoleId');
      router.replace('/login');
    }
    return Promise.reject(error);
  }
);


export default axios