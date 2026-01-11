/**
 * ================================
 * VERCEL EDGE FUNCTION: Gerar Texto
 * ================================
 * Endpoint: /api/generate-text
 * Método: POST
 * 
 * Este endpoint:
 * 1. Recebe modo (sentence/word/phoneme) do cliente
 * 2. Busca chave API do usuário no Firestore
 * 3. Gera textos via Gemini
 * 4. Retorna array de textos
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
let app;
if (!app) {
    app = initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}
const db = getFirestore(app);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { userId, mode = 'sentence', quantity = 3, age = 5, phoneme = '' } = req.body;

        // Validar input
        if (!userId) {
            return res.status(400).json({ error: 'userId é obrigatório' });
        }

        // Buscar chave API do usuário
        const userDoc = await db
            .collection('artifacts/fonoaudiologo-33594/public/data/profiles_v2')
            .doc(userId)
            .get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userData = userDoc.data();
        const apiKey = userData.apiKey;

        if (!apiKey || apiKey.length < 20) {
            return res.status(400).json({ error: 'Chave API inválida' });
        }

        // Montar prompt baseado no modo
        let prompt = `Gere ${quantity} `;

        if (mode === 'sentence') {
            prompt += `frases simples para criança ${age} anos.`;
        } else if (mode === 'word') {
            prompt += `palavras comuns criança ${age} anos.`;
        } else if (mode === 'phoneme') {
            prompt += `palavras com fonema '${phoneme}' para criança ${age} anos.`;
        }

        prompt += ` Apenas texto puro, uma por linha.`;

        // Chamar Gemini
        const textBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(textBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({
                error: errorData.error?.message || 'Erro na API Gemini'
            });
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;

        // Processar resposta (separar linhas)
        const lines = generatedText
            .replace(/\*/g, '')
            .split('\n')
            .filter(l => l.trim().length > 0);

        // Retornar array de textos
        return res.status(200).json({
            texts: lines
        });

    } catch (error) {
        console.error('Erro no endpoint generate-text:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
}
