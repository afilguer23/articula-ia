/**
 * ================================
 * VERCEL EDGE FUNCTION: Analisar Pronúncia
 * ================================
 * Endpoint: /api/analyze-speech
 * Método: POST
 * 
 * Este endpoint:
 * 1. Recebe áudio do cliente (Base64)
 * 2. Busca chave API do usuário no Firestore
 * 3. Envia para Gemini para análise
 * 4. Retorna score + feedback
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
        const { userId, audioBase64, targetText, age = 5 } = req.body;

        // Validar input
        if (!userId || !audioBase64 || !targetText) {
            return res.status(400).json({
                error: 'userId, audioBase64 e targetText são obrigatórios'
            });
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

        // Montar prompt para análise
        const prompt = `Aja como fonoaudiólogo. Paciente ${age} anos. Alvo: "${targetText}". Analise áudio. JSON: {"score": 0-100, "feedback": "texto curto"}`;

        // Chamar Gemini Multimodal
        const analysisBody = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "audio/webm",
                            data: audioBase64
                        }
                    }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analysisBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({
                error: errorData.error?.message || 'Erro na API Gemini'
            });
        }

        const data = await response.json();

        // Parsear resposta JSON
        let result;
        try {
            const jsonString = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(jsonString);
        } catch (e) {
            console.error('JSON inválido da IA:', data.candidates[0].content.parts[0].text);
            result = {
                score: 0,
                feedback: "Análise falhou (JSON inválido da IA). Tente novamente."
            };
        }

        // Retornar resultado
        return res.status(200).json(result);

    } catch (error) {
        console.error('Erro no endpoint analyze-speech:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
}
