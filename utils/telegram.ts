const BOT_TOKEN = '7781111238:AAHLZUKPGkMPjoFrCB32vHElEPD5YosrXjo';
const CHAT_ID = '7927132501';

/**
 * WARNING: Storing API tokens on the client-side is highly insecure and should NOT be done in a production environment.
 * An attacker could easily steal your token from the browser's source code.
 * This logic should be moved to a secure backend or a serverless function for any real-world application.
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
