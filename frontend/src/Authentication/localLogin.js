import axios from "axios";

export async function localLogin({ e, form, navigate }) {
  e.preventDefault();

  try {
    const result = await axios.post("http://localhost:8080/auth/login", form);
    localStorage.setItem("Token", result.data.token);
    setTimeout(() => navigate("/home"), 600);
  } catch (err) {
    throw err;
  }
}
