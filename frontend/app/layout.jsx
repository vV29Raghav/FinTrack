import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "FinTrack - Expense Management Made Simple",
  description: "Manage your expenses efficiently with FinTrack - Track personal expenses, manage team expenses, and simplify reimbursements.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
