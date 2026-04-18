// Next.js API route for Sarvam transcription
// This properly handles multipart/form-data file uploads
// and forwards them to the Flask backend

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};

export async function POST(request) {
  try {
    // Forward the entire request body to Flask as-is
    const formData = await request.formData();
    
    // Rebuild FormData for the Flask backend
    const backendFormData = new FormData();
    
    const file = formData.get("file");
    if (!file) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }
    
    backendFormData.append("file", file, file.name || "recording.webm");
    
    const languageCode = formData.get("language_code") || "unknown";
    backendFormData.append("language_code", languageCode);

    const res = await fetch("http://127.0.0.1:5000/api/sarvam/transcribe", {
      method: "POST",
      body: backendFormData,
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    console.error("Sarvam proxy error:", error);
    return Response.json(
      { error: "Failed to proxy to transcription service: " + error.message },
      { status: 502 }
    );
  }
}
