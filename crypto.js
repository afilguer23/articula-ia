/**
 * ====================================
 * MÓDULO DE CRIPTOGRAFIA CLIENT-SIDE
 * ====================================
 * Usa AES-256-GCM com Web Crypto API
 */

const CryptoHelper = {
    /**
     * Gera uma chave de criptografia a partir de uma senha (derivada do email do usuário)
     */
    async deriveKey(password) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        // Importar senha como chave
        const baseKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // Derivar chave AES-256-GCM
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('articula-ia-salt-v1'), // Salt fixo (não ideal, mas OK para MVP)
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        
        return key;
    },
    
    /**
     * Criptografa um texto (chave API)
     */
    async encrypt(plaintext, userEmail) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        
        // Gerar chave a partir do email do usuário
        const key = await this.deriveKey(userEmail);
        
        // Gerar IV (Initialization Vector) aleatório
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Criptografar
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );
        
        // Combinar IV + ciphertext em Base64
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertext), iv.length);
        
        return btoa(String.fromCharCode(...combined));
    },
    
    /**
     * Descriptografa um texto
     */
    async decrypt(encryptedBase64, userEmail) {
        try {
            // Converter Base64 para Uint8Array
            const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
            
            // Extrair IV e ciphertext
            const iv = combined.slice(0, 12);
            const ciphertext = combined.slice(12);
            
            // Gerar chave a partir do email do usuário
            const key = await this.deriveKey(userEmail);
            
            // Descriptografar
            const plaintext = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                ciphertext
            );
            
            // Converter para string
            const decoder = new TextDecoder();
            return decoder.decode(plaintext);
        } catch (e) {
            console.error('Erro ao descriptografar:', e);
            throw new Error('Falha na descriptografia. Chave pode estar corrompida.');
        }
    },
    
    /**
     * Verifica se um texto está criptografado (formato Base64)
     */
    isEncrypted(text) {
        if (!text || typeof text !== 'string') return false;
        
        // Verificar se é Base64 válido
        try {
            const decoded = atob(text);
            return decoded.length > 12; // Mínimo: IV (12 bytes) + dados
        } catch {
            return false;
        }
    }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoHelper;
}
