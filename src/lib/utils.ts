import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserRole } from "@/lib/auth"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retorna a rota de redirecionamento baseada no perfil do usuário
 */
export function getRedirectPath(userRole: UserRole): string {
  switch (userRole) {
    case 'citizen':
      return '/citizen-dashboard'
    case 'agent':
      return '/agent-dashboard'
    case 'admin':
      return '/admin-dashboard'
    case 'master':
      return '/user-approval' // Masters vão para aprovação de usuários
    default:
      return '/unauthorized'
  }
}
