export async function fetchLocal(path: string, options: RequestInit = {}) {
  // Use the localtunnel URL (update this in your .env.local)
  const baseUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:8000";
  
  // Clean the path (remove leading slash if present)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${baseUrl}/${cleanPath}`;

  const defaultHeaders = {
    "bypass-tunnel-reminder": "true",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Local API error: ${response.statusText}`);
  }

  return response;
}

export async function openLocalPDF(path: string) {
  try {
    const response = await fetchLocal(path);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to open local PDF:", error);
    alert("Could not connect to your local backend. Make sure FastAPI and Localtunnel are running.");
  }
}
