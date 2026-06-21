import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://yxmjzxnnuikpedcdkuxq.supabase.co';
const supabaseKey = 'sb_publishable_zSgFX4Wr1NU8rlbvdFgxRQ_tEElD8XX';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});