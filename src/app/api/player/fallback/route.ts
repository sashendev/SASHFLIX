import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nextSource = searchParams.get("nextSource") || "0";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Player Fallback</title>
      <style>
        body {
          background-color: black;
          color: white;
          font-family: sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div>Loading alternative source...</div>
      <script>
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'PLAYER_FALLBACK', nextSource: ${parseInt(nextSource, 10)} }, '*');
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
