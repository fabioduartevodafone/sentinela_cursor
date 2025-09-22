import { supabase } from './supabase'

export interface UploadResult {
  url: string | null
  error: string | null
}

export class StorageService {
  private static readonly BUCKETS = {
    DOCUMENTS: 'documents',
    IMAGES: 'images',
    VIDEOS: 'videos'
  } as const

  /**
   * Verifica se o Supabase está configurado corretamente
   */
  private static isSupabaseConfigured(): boolean {
    const url = (import.meta as any).env.VITE_SUPABASE_URL
    const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY
    
    return !!(url && 
             key && 
             url !== 'https://placeholder.supabase.co' && 
             key !== 'placeholder-key' &&
             url.startsWith('https://') &&
             key.length > 20)
  }

  /**
   * Simula upload para desenvolvimento
   */
  private static async simulateUpload(file: File, bucket: string): Promise<UploadResult> {
    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simular falha ocasional (10% das vezes)
    if (Math.random() < 0.1) {
      return {
        url: null,
        error: 'Falha simulada no upload para teste'
      }
    }

    const mockUrl = `https://mock-storage.sentinela.com/${bucket}/${file.name}`
    return {
      url: mockUrl,
      error: null
    }
  }

  /**
   * Faz upload real para o Supabase
   */
  private static async uploadToSupabase(
    file: File, 
    bucket: string, 
    filePath: string
  ): Promise<UploadResult> {
    try {
      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        return {
          url: null,
          error: `Erro no upload: ${uploadError.message}`
        }
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return {
        url: data.publicUrl,
        error: null
      }
    } catch (error) {
      return {
        url: null,
        error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Upload genérico de arquivo
   */
  static async uploadFile(
    file: File,
    bucket: keyof typeof StorageService.BUCKETS,
    userId?: string
  ): Promise<UploadResult> {
    const bucketName = this.BUCKETS[bucket]
    
    // Validar arquivo
    if (!file) {
      return { url: null, error: 'Nenhum arquivo fornecido' }
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { url: null, error: 'Arquivo muito grande. Máximo permitido: 10MB' }
    }

    // Gerar nome único do arquivo
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = userId 
      ? `${userId}-${timestamp}-${randomId}.${fileExt}`
      : `${timestamp}-${randomId}.${fileExt}`
    
    const filePath = `${bucketName}/${fileName}`

    // Decidir entre upload real ou simulado
    if (this.isSupabaseConfigured()) {
      return this.uploadToSupabase(file, bucketName, filePath)
    } else {
      return this.simulateUpload(file, bucketName)
    }
  }

  /**
   * Upload de documento (PDF, DOC, etc.)
   */
  static async uploadDocument(file: File, userId?: string): Promise<UploadResult> {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: 'Tipo de arquivo não permitido. Use PDF, DOC, DOCX ou TXT'
      }
    }

    return this.uploadFile(file, 'DOCUMENTS', userId)
  }

  /**
   * Upload de imagem
   */
  static async uploadImage(file: File, userId?: string): Promise<UploadResult> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: 'Tipo de imagem não permitido. Use JPEG, PNG, WebP ou GIF'
      }
    }

    return this.uploadFile(file, 'IMAGES', userId)
  }

  /**
   * Upload de vídeo
   */
  static async uploadVideo(file: File, userId?: string): Promise<UploadResult> {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']

    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: 'Tipo de vídeo não permitido. Use MP4, WebM ou OGG'
      }
    }

    // Vídeos têm limite maior (50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return { url: null, error: 'Vídeo muito grande. Máximo permitido: 50MB' }
    }

    return this.uploadFile(file, 'VIDEOS', userId)
  }

  /**
   * Deletar arquivo
   */
  static async deleteFile(filePath: string, bucket: keyof typeof StorageService.BUCKETS): Promise<boolean> {
    if (!this.isSupabaseConfigured()) {
      console.warn('Supabase não configurado. Executando em modo de desenvolvimento.')
      // Em modo de desenvolvimento, simular sucesso
      return true
    }

    try {
      const { error } = await supabase.storage
        .from(this.BUCKETS[bucket])
        .remove([filePath])

      if (error) {
        console.error('Erro ao deletar arquivo:', error.message)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      return false
    }
  }

  /**
   * Listar arquivos de um usuário
   */
  static async listUserFiles(userId: string, bucket: keyof typeof StorageService.BUCKETS): Promise<string[]> {
    if (!this.isSupabaseConfigured()) {
      console.warn('Supabase não configurado. Retornando lista vazia em modo de desenvolvimento.')
      // Em modo de desenvolvimento, retornar lista vazia
      return []
    }

    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKETS[bucket])
        .list('', {
          search: userId
        })

      if (error) {
        console.error('Erro ao listar arquivos:', error)
        return []
      }

      return data?.map(file => file.name) || []
    } catch (error) {
      console.error('Erro ao listar arquivos:', error)
      return []
    }
  }
}