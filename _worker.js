export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const MAKE_URL = "https://hook.eu1.make.com/psvd579coi1la6qb7f1e5r47gnth8wd0";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
        }
      });
    }

    // Waiting page
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const submissionId = url.searchParams.get("submissionId") || "";
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Processing your order...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
           background: #f3f4f6; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; padding: 48px 36px;
            text-align: center; box-shadow: 0 4px 32px rgba(0,0,0,0.08);
            max-width: 380px; width: 90%; }
    .spinner { width: 52px; height: 52px; border: 4px solid #e5e7eb;
               border-top-color: #16a34a; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 0 auto 24px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 20px; color: #111827; margin-bottom: 10px; }
    p { font-size: 14px; color: #6b7280; line-height: 1.6; }
    .note { margin-top: 24px; font-size: 12px; color: #9ca3af; }
    .error { color: #dc2626; font-size: 13px; margin-top: 16px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h1>Preparing your payment...</h1>
    <p>Please wait while we set up your order.<br>
    You will be redirected to payment in a moment.</p>
    <div class="note">Please do not close or refresh this page.</div>
    <div class="error" id="err">Something went wrong. Please contact us.</div>
  </div>
  <script>
    const submissionId = "${submissionId}";
    let attempts = 0;
    const MAX = 20;
    async function checkUrl() {
      try {
        const res = await fetch("/lookup?id=" + submissionId);
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else if (attempts < MAX) {
          attempts++;
          setTimeout(checkUrl, 2000);
        } else {
          document.getElementById("err").style.display = "block";
        }
      } catch(e) {
        if (attempts < MAX) {
          attempts++;
          setTimeout(checkUrl, 2000);
        }
      }
    }
    checkUrl();
  </script>
</body>
</html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // Lookup endpoint
    if (url.pathname === "/lookup") {
      const id = url.searchParams.get("id");
      try {
        const response = await fetch(MAKE_URL + "?id=" + id);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch(e) {
        return new Response(JSON.stringify({ url: null }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Success page
    if (url.pathname === "/done") {
      const billId = url.searchParams.get("billplz[id]") || "—";
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Payment Successful</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
           background: #f3f4f6; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; padding: 48px 36px;
            text-align: center; box-shadow: 0 4px 32px rgba(0,0,0,0.08);
            max-width: 380px; width: 90%; }
    .icon { width: 64px; height: 64px; background: #dcfce7; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 24px; font-size: 32px; }
    h1 { font-size: 22px; color: #111827; margin-bottom: 10px; }
    p { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 8px; }
    .ref { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
           padding: 12px 20px; margin: 16px 0; font-family: monospace;
           font-size: 15px; color: #111827; letter-spacing: 0.05em; }
    .note { margin-top: 16px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Payment received!</h1>
    <p>Thank you for your order.</p>
    <p>Your reference number:</p>
    <div class="ref">${billId}</div>
    <div class="note">
      We have sent a confirmation to your<br>
      WhatsApp and email address.
    </div>
  </div>
</body>
</html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
