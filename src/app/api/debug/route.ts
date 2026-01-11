// Temporary debug endpoint to diagnose private key format
// DELETE THIS FILE after debugging is complete
import { NextResponse } from 'next/server';
import { debugKeyFormat, isGoogleSheetsConfigured } from '@/lib/google-sheets';

export async function GET() {
  const configured = isGoogleSheetsConfigured();
  const keyDebug = configured ? debugKeyFormat() : null;

  return NextResponse.json({
    configured,
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'SET' : 'NOT SET',
    sheetId: process.env.GOOGLE_SHEET_ID ? 'SET' : 'NOT SET',
    keyDebug,
  });
}
