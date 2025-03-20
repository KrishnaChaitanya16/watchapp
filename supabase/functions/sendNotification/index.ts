import { createClient } from 'npm:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

// Hardcoded Supabase URL and Service Key (replace with actual values)
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY";
// Hardcoded Firebase Server Key and Service Account Credentials (replace with actual values)
const FCM_SERVER_KEY = "YOUR_FCM_SERVER_KEY";
const SERVICE_ACCOUNT = {
  project_id: "YOUR_PROJECT_ID", // replace with your project id
  client_email: "YOUR_FIREBASE_CLIENT_EMAIL",
  private_key: "YOUR_PRIVATE_KEY" // replace with your private key
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  console.log("Request received to send notification");

  // Fetch Mobile Device FCM Token from the 'device_tokens' table
  const { data, error } = await supabase
    .from('device_tokens')
    .select('fcm_token')
    .eq('device_type', 'mobile')  // Assuming 'device_type' is 'mobile'
    .single();

  if (error || !data) {
    console.error("Error fetching device token:", error);
    return new Response(
      JSON.stringify({ error: 'No mobile device found or FCM token is missing' }),
      { status: 400 }
    );
  }

  const fcmToken = data.fcm_token as string;

  console.log("Fetched FCM token:", fcmToken);

  // Get an OAuth2 token from Google to authenticate the FCM request
  console.log("Getting access token from Google");
  const accessToken = await getAccessToken({
    clientEmail: SERVICE_ACCOUNT.client_email,
    privateKey: SERVICE_ACCOUNT.private_key,
  });

  console.log("Access token retrieved");

  // Send notification using the FCM v1 API
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: `Notification from Supabase`,
            body: "This is a test notification",
          },
        },
      }),
    }
  );

  const resData = await res.json();

  if (res.status < 200 || res.status > 299) {
    console.error("Failed to send notification:", resData);
    return new Response(
      JSON.stringify({
        error: 'Failed to send notification',
        details: resData,
      }),
      { status: res.status }
    );
  }

  console.log("Notification sent successfully:", resData);

  return new Response(JSON.stringify(resData), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Function to get access token from Google
const getAccessToken = ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string;
  privateKey: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens!.access_token!);
    });
  });
};
