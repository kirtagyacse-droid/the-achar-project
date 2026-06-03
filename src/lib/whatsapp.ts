import { sendTelegramNotification } from './telegram';

export async function sendAuntyNotification(msg: string) {
  console.log("NOTIFY AUNTY (CONSOLE):", msg);
  
  // Format for Telegram if configured
  try {
    await sendTelegramNotification(`📢 <b>Aunty Notification:</b>\n${msg}`);
  } catch (e) {
    console.error('Telegram notification error:', e);
  }

  const auntyPhone = process.env.AUNTY_WHATSAPP_NUMBER;
  const callmebotApiKey = process.env.CALLMEBOT_API_KEY;

  if (auntyPhone && callmebotApiKey) {
    try {
      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=${auntyPhone}&text=${encodedMsg}&apikey=${callmebotApiKey}`;
      
      // Call fetch in a non-blocking asynchronous way
      fetch(whatsappUrl).catch(e => console.error('Failed to trigger CallMeBot Alert:', e));
    } catch (waError) {
      console.error('Error sending WhatsApp alert:', waError);
    }
  } else {
    console.log('Aunty CallMeBot credentials not configured. WhatsApp alert skipped.');
  }
}
