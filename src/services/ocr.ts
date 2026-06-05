// OCR simple usando el endpoint gratuito de OCR.space
// Límite: 25.000 requests/mes en plan gratuito. Para uso personal es más que suficiente.

const OCR_API_KEY = 'helloworld'; // API key gratuita de ocr.space (cambiar por la tuya en producción)
const OCR_API_URL = 'https://api.ocr.space/parse/image';

type OcrResultado = {
  comercio: string | null;
  monto: number | null;
  fecha: string | null;
  textoCompleto: string;
};

export async function procesarRecibo(imageUri: string): Promise<OcrResultado> {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'recibo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  formData.append('apikey', OCR_API_KEY);
  formData.append('language', 'spa');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');

  try {
    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.ParsedResults?.[0]) {
      return { comercio: null, monto: null, fecha: null, textoCompleto: '' };
    }

    const texto = result.ParsedResults[0].ParsedText as string;
    return parseTextoRecibo(texto);
  } catch {
    return { comercio: null, monto: null, fecha: null, textoCompleto: '' };
  }
}

function parsearMonto(raw: string): number {
  if (raw.includes('.') && raw.includes(',')) {
    return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  }
  if (raw.includes(',')) {
    return parseFloat(raw.replace(',', '.'));
  }
  return parseFloat(raw);
}

function parseTextoRecibo(texto: string): OcrResultado {
  const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);

  // Monto: busca el número más grande precedido por $ o "total"
  // Captura formatos UY: 1.500,50 / 1500,50 / 1500.50 / 1500
  const montoRegex = /(?:total|importe|a\s*pagar|monto)[:\s]*\$?\s*([\d.,]+)/i;
  const montoSimpleRegex = /\$\s*([\d.,]+)/g;

  let monto: number | null = null;

  const montoMatch = texto.match(montoRegex);
  if (montoMatch) {
    monto = parsearMonto(montoMatch[1]);
  } else {
    const montos: number[] = [];
    let m;
    while ((m = montoSimpleRegex.exec(texto)) !== null) {
      montos.push(parsearMonto(m[1]));
    }
    if (montos.length > 0) monto = Math.max(...montos);
  }

  // Fecha: busca patrones de fecha
  const fechaRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  const fechaMatch = texto.match(fechaRegex);
  let fecha: string | null = null;
  if (fechaMatch) {
    const [, dia, mes, anio] = fechaMatch;
    const anioFull = anio.length === 2 ? `20${anio}` : anio;
    fecha = `${anioFull}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  // Comercio: primera línea con texto significativo
  const comercio = lineas.find((l) => l.length > 3 && !/^\d/.test(l)) ?? null;

  return { comercio, monto, fecha, textoCompleto: texto };
}
