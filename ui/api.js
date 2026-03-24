const root_url = process.env.EXPO_PUBLIC_API_URL;
export async function login(email, password) {
  const response = await fetch(`${root_url}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

  