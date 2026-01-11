/**
 * ================================
 * VERCEL EDGE FUNCTION: Gerar Áudio (TTS)
 * ================================
 * Endpoint: /api/generate-audio
 * Método: POST
 * 
 * Este endpoint:
 * 1. Recebe texto do cliente
 * 2. Busca chave API do usuário no Firestore
 * 3. Chama Gemini TTS (server-side, chave segura)
 * 4. Retorna áudio em Base64
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin (só uma vez)
let app;
if (!app) {
    app = initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}
const db = getFirestore(app);

// Converter PCM para WAV
function pcmToWav(pcm16Data, sampleRate = 24000) {
    const numChannels = 1;
    const bytesPerSample = 2;
    const buffer = Buffer.alloc(44 + pcm16Data.length * bytesPerSample);

    let offset = 0;
    const writeString = (s) => { buffer.write(s, offset); offset += s.length; };
    const write32 = (d) => { buffer.writeUInt32LE(d, offset); offset += 4; };
    const write16 = (d) => { buffer.writeUInt16LE(d, offset); offset += 2; };

    writeString('RIFF');
    write32(36 + pcm16Data.length * bytesPerSample);
    writeString('WAVE');
    writeString('fmt ');
    write32(16);
    write16(1);
    write16(numChannels);
    write32(sampleRate);
    write32(sampleRate * numChannels * bytesPerSample);
    write16(numChannels * bytesPerSample);
    write16(16);
    writeString('data');
    write32(pcm16Data.length * bytesPerSample);

    for (let i = 0; i < pcm16Data.length; i++) {
        buffer.writeInt16LE(pcm16Data[i], offset);
        offset += 2;
    }

    return buffer;
}

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
        const { userId, text, voice = 'Kore' } = req.body;

        // Validar input
        if (!userId || !text) {
            return res.status(400).json({ error: 'userId e text são obrigatórios' });
        }

        // Buscar chave API do usuário no Firestore
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

        // Chamar Gemini TTS (server-side, chave segura!)
        const ttsBody = {
            contents: [{ parts: [{ text }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voice
                        }
                    }
                }
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ttsBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({
                error: errorData.error?.message || 'Erro na API Gemini'
            });
        }

        const data = await response.json();
        const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!b64) {
            return res.status(500).json({ error: 'Falha ao gerar áudio' });
        }

        // Converter PCM para WAV
        const pcm16 = Int16Array.from(Buffer.from(b64, 'base64'));
        const wavBuffer = pcmToWav(pcm16);
        const wavBase64 = wavBuffer.toString('base64');

        // Retornar áudio em Base64
        return res.status(200).json({
            audioUrl: `data:audio/wav;base64,${wavBase64}`
        });

    } catch (error) {
        console.error('Erro no endpoint generate-audio:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
}
