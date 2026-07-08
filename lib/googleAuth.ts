import { supabase } from './supabase';

// Web-application OAuth client ID from Google Cloud Console (NOT the Android one).
// This is a public value and is safe to ship in the app. Fill this in after
// creating the "Web application" OAuth client in Google Cloud.
const WEB_CLIENT_ID = '757127287295-73ounv1rv7fqvqthkmh5ubednadgulfv.apps.googleusercontent.com';

let configured = false;

type Result = { ok: boolean; error?: string };

/**
 * Native Google sign-in → Supabase session.
 *
 * The google-signin module is a native module, so it's loaded lazily here: that
 * keeps the login screen working in Expo Go (where the native module is absent)
 * — the call just fails gracefully instead of crashing at import time. The real
 * flow only works in a dev/EAS build.
 */
export async function signInWithGoogle(): Promise<Result> {
  let mod: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay lazy: a static import would crash Expo Go at module load.
    mod = require('@react-native-google-signin/google-signin');
  } catch {
    return { ok: false, error: 'Google sign-in is only available in the installed app.' };
  }
  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = mod;

  if (!configured) {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
    configured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return { ok: false }; // user dismissed the picker
    const idToken = response.data?.idToken;
    if (!idToken) return { ok: false, error: 'Google did not return an ID token.' };

    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    // Silent cancel; surface everything else.
    if (isErrorWithCode?.(e) && (e.code === statusCodes?.SIGN_IN_CANCELLED || e.code === statusCodes?.IN_PROGRESS)) {
      return { ok: false };
    }
    return { ok: false, error: e?.message ?? 'Google sign-in failed. Please try again.' };
  }
}
