import storage from "../storage";

export async function authFetch(url: string, options: any = {}) {
  const token = await storage.getItem("token");
  console.log("AUTH HEADER:", `Bearer ${token}`);

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
