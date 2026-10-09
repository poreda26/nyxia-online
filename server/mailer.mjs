// E-posta gönderimi (Resend HTTP API). RESEND_API_KEY ve MAIL_FROM yoksa `configured` false olur ve e-posta özellikleri kapalı kalır.
export function createMailer({ apiKey = null, from = null, fetchImpl = fetch } = {}) {
  const configured = !!(apiKey && from);
  const send = async ({ to, subject, text }) => {
    if (!configured) throw Object.assign(new Error('MAIL_UNAVAILABLE'), { status: 503 });
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!response.ok) throw Object.assign(new Error('MAIL_FAILED'), { status: 502 });
  };
  return { configured, send };
}
