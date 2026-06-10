// #Yeh file UI formatting ke conflict ko door karti hai. Isme ek generic utility function hota hai jise cn (Class Name merger) kehte hain:

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
