// import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/identify";
// export const sendMessageToBackend = async (text) => {
//   try {
//     const res = await axios.post("http://localhost:8000/chat", {
//       message: text,
//     });

//     return res.data.reply;
//   } catch (err) {
//     return "⚠ Error: Could not reach the server.";
//   }
// };

// export async function identifyWaste(text, image) {
//   const formData = new FormData();
//   if (text) formData.append("text", text);
//   if (image) formData.append("image", image);

//   const response = await axios.post(API_URL, formData, {
//     headers: { "Content-Type": "multipart/form-data" }
//   });

//   return response.data;
// }



// src/services/api.js
import axios from "axios";
const BASE = "http://172.16.66.15:8000";

export const sendMessageToBackend = async (text) => {
  try {
    const res = await axios.post(`${BASE}/chat`, { message: text });
    return res.data.reply;
  } catch (err) {
    console.error(err);
    return "⚠ Error: Could not reach the server.";
  }
};

export async function identifyWaste(text, imageUrl) {
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (imageUrl) formData.append("image_url", imageUrl);
  const response = await axios.post(`${BASE}/identify`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
