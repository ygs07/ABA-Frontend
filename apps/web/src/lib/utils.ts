export { cn } from "cn"

export const getWhatsAppLink = (phoneNumber: string | number, name: string) => {
    const cleanedNumber = String(phoneNumber).replace(/\D/g, "");

    // Convert Nigerian local numbers to international format
    const formattedNumber = cleanedNumber.startsWith("0")
        ? `234${cleanedNumber.slice(1)}`
        : cleanedNumber;

    const message = `Hello ${name}, I'm interested in your products`;

    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
};