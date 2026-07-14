import axios from "axios";
import { authApi } from "../lib/api";

export async function localLogin({ e, form, navigate }) {
  e.preventDefault();

  try {

    

    await authApi.login(form);
    setTimeout(() => navigate("/home"), 600);
  } catch (err) {
    throw err;
  }
}
