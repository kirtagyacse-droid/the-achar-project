# RS Savoury

This is an MVP e-commerce platform for a Jaipur-based homemade achar business. It features a modern, premium design, a customer shopping flow with Cash on Delivery (COD), and an admin dashboard to manage orders and products.

## Features
- **Storefront**: Browse products, view details, add to cart.
- **Checkout Flow**: Collects customer details and places COD orders.
- **Admin Dashboard**: View recent orders, change order status, view products.
- **Telegram Notifications**: Automatically sends an alert to a Telegram chat whenever a new order is placed.

## Tech Stack
- Next.js (App Router)
- React
- Prisma (SQLite Database)
- Vanilla CSS / CSS Modules

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory (one should already exist) and ensure it has the following variables:
   ```env
   DATABASE_URL="file:./dev.db"
   ADMIN_PASSWORD="achar-admin"
   
   # Telegram Configuration
   # Get these by creating a bot via BotFather on Telegram
   TELEGRAM_BOT_TOKEN="your_bot_token_here"
   TELEGRAM_CHAT_ID="your_chat_id_here"
   ```

3. **Database Setup:**
   The SQLite database is pre-configured. To reset or push schema changes, run:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the App:**
   - Storefront: `http://localhost:3000`
   - Admin Login: `http://localhost:3000/admin/login` (Password is `achar-admin` by default).

## Telegram Bot Setup
1. Go to Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the instructions to create a bot.
3. Copy the HTTP API Token and set it as `TELEGRAM_BOT_TOKEN` in `.env`.
4. Create a group chat (or use a personal chat) and add your bot to it.
5. Send a message in the chat.
6. Visit `https://api.telegram.org/bot<YourBOTToken>/getUpdates` to find the `chat.id`.
7. Set the Chat ID as `TELEGRAM_CHAT_ID` in `.env`.
