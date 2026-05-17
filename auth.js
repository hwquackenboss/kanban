import axios from "./axios-config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function login(email, password) {
  const response = await axios.post("auth/login", { email, password });
  const authorizationHeader = response.headers["authorization"];
  const jwtToken = authorizationHeader.substring('Bearer '.length);
  
  // Use setItem with await to ensure it's stored before proceeding
  await AsyncStorage.setItem('jwtToken', jwtToken);
  await AsyncStorage.setItem('userRoleId', response.data.roleId.toString());
  
  // Wait a bit to ensure storage is flushed
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return response.data;
}

export async function logout() {
  await AsyncStorage.removeItem('jwtToken');
  await AsyncStorage.removeItem('userRoleId');
}

export function register(firstName, lastName, email, password) {
  return axios.post("users/", { firstName, lastName, email, password })
    .then(resp => resp.data)
    .catch(error => {
      console.log(error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Unable to register");
    });
}
