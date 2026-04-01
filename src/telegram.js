/**
 * Centralized Telegram Mini App SDK logic.
 * Follows the professional initialization flow.
 */

const tg = window.Telegram?.WebApp;

/**
 * Initializes the Telegram WebApp.
 * Informs the Telegram client that the app is ready and expands it to full height.
 */
export function initTelegram() {
    if (!tg) {
        console.warn('Telegram WebApp SDK not found. Make sure the script is included in index.html');
        return null;
    }

    tg.ready();
    tg.expand();

    return tg;
}

/**
 * Returns the Telegram WebApp object.
 */
export function getTelegramApp() {
    return tg;
}

/**
 * Returns the user data from initDataUnsafe.
 * This is great for UI display.
 */
export function getTelegramUser() {
    return tg?.initDataUnsafe?.user || null;
}

/**
 * Returns the raw initData string.
 * This is crucial for backend verification.
 */
export function getTelegramInitData() {
    return tg?.initData || '';
}

/**
 * Robustly opens a phone dialer.
 * Uses Telegram WebApp openLink if available, otherwise falls back to standard tel: link.
 */
export function openPhone(phoneNumber) {
    if (!phoneNumber) return;
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Workaround for Telegram Mini Apps: use a backend redirect to tel:
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const redirectUrl = `${baseUrl}/call/${cleanPhone}`;
    
    console.log('Attempting to open phone with backend redirect:', redirectUrl);
    // This allows the OS to handle the tel: protocol correctly via an HTTPS link
    window.location.href = redirectUrl;
}

/**
 * Utility to copy text to clipboard.
 * Works both in modern browsers and typical mobile webviews.
 */
export async function copyToClipboard(text) {
    if (!text) return false;
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers/webview
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
}

export default {
    init: initTelegram,
    getApp: getTelegramApp,
    getUser: getTelegramUser,
    getInitData: getTelegramInitData,
    openPhone: openPhone,
    copy: copyToClipboard
};
