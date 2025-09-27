const BOT_TOKEN = '7781111238:AAHLZUKPGkMPjoFrCB32vHElEPD5YosrXjo';
const CHAT_ID = '7927132501';

/**
 * WARNING: Calling the Telegram API directly from the client-side is highly insecure.
 * Your BOT_TOKEN is exposed to anyone who inspects the website's network traffic.
 * In a real-world application, this should be an API route (e.g., /api/notify) on your Next.js backend
 * which securely handles the token on the server.
 */

export const sendTelegramMessage = async (message: string) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send Telegram message:', errorData.description);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
};
