import axios from "./axios-config";

export function getAllUsers(){
  return axios.get("users/").then(resp => resp.data)
}

export function getUserById(id){
  return axios.get("users/" + id).then(resp => resp.data)
}

export function updateUser(user){
  return axios.put("users/" + user.id, user)
}

export function insertUser(user){
  // Note that the promise will resolve to the new users ID
  return axios.post("users/", user).then(resp => resp.data.id)
}