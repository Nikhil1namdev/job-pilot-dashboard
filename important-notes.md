# 🔔 Sonner Toast Notifications in Job Pilot

This document outlines the implementation details, setup, and usage guidelines for our modern toast notification system.

---

### 🚀 Why Sonner?
Sonner was selected over alternatives like `react-toastify` for the following reasons:
1. **Modern SaaS Aesthetic**: Delivers sleek, minimal toasts out-of-the-box that align with high-end dashboard designs.
2. **Lightweight**: Extremely small bundle footprint compared to react-toastify.
3. **Perfect Dark Mode Integration**: Seamlessly responds to `next-themes` dynamic switches.
4. **Stacking Animations**: Uses sophisticated stacking animations that resemble native iOS/macOS notifications.
5. **Tailwind Native**: Styled perfectly with our global utility classes without requiring large CSS overrides.

---

### 💾 Installation
To install Sonner in the project, we used:
```bash
npm install sonner
```

---

### 🛠️ Setup and Configuration

#### 1. The Custom Toaster Wrapper (`components/ui/toaster.tsx`)
We created a custom client component that automatically subscribes to our Next-Themes setup to toggle themes dynamically.
```tsx
"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme as any}
      className="toaster group"
      richColors
      closeButton
      position="bottom-right"
      {...props}
    />
  );
};

export { Toaster };
```

#### 2. Global Inclusion (`app/layout.tsx`)
The `<Toaster />` component is placed globally at the root of the application, wrapped inside the `ThemeProvider`:
```tsx
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### 💡 Core Usage Patterns

#### 1. Basic Success & Error Feedback
Used immediately after performing asynchronous side-effects or on optimistic rollback catch blocks.
```typescript
import { toast } from "sonner";

// Success Action
toast.success("Job updated successfully", {
  description: "Successfully saved changes to database."
});

// Error Feedback (Useful for optimistic UI fallback)
toast.error("Failed to update", {
  description: "Server connection failed. Reverting changes."
});
```

#### 2. The Premium Promise Toast (Highly Recommended ✨)
Leveraged for heavy server operations like deletions or bulk changes. Handles loading, success, and error states automatically using a single native Promise.
```typescript
const operationPromise = async () => {
  const response = await fetch("/api/jobs/123", { method: "DELETE" });
  if (!response.ok) throw new Error("Failed");
  return response;
};

toast.promise(operationPromise(), {
  loading: "Deleting job application...",
  success: "Successfully removed from dashboard!",
  error: "Could not complete the deletion.",
});
```
