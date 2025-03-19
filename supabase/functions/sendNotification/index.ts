import { createClient } from 'npm:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

// Hardcoded Supabase URL and Service Key (replace with actual values)
const SUPABASE_URL = "https://fmtzufgmbciovdxflkqm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdHp1ZmdtYmNpb3ZkeGZsa3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDE4MzU2MCwiZXhwIjoyMDQ5NzU5NTYwfQ.ZHuLemZsLLfLVZSL07_a72JH7PXyE1fDwHReuoRVTOk";

// Hardcoded Firebase Server Key and Service Account Credentials (replace with actual values)
const FCM_SERVER_KEY = "BKogQdg74L6HNSGLUnU34dPxE30pCmaNtVd5n4EdUpF8sGhLPkFz2pvRj0tVCrM2rH-rHsyALgGbgAhmkL-bvgQ";
const SERVICE_ACCOUNT = {
  project_id: "sample-35132", // replace with your project id
  client_email: "firebase-adminsdk-fbsvc@sample-35132.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtsPc7dMOoExc2\nxFDC2kmvEjh5uwZNSMIC5E7yiUe4ICZBvXtscdYMpA0pzOp0TQj3EhTtwJKYCVk4\n0bnMQWBpjGsL0GRIO7QEG8EsO8cVLHWOB86ggZ+BAIkywnmTeDyL9TnRkIGeXQmu\n/xUe/sB6vJvxq0x6HtrMDc+QQzKE3iXq2N3iQRMU6GbwbI/bTIW0kselHWIhRxpj\nm94NMD5z9f2LNHmz0Y4QDQPzKm7JnfS72aB4naVH4FAUyWLVwuPVTtjJ440TgqPB\nwqmRGZm6vgvieV0nTeXiVgViJ5XEBfH22zH8NhznxtSHz7U1F85u+7J33k6x0ib+\noBio2/K9AgMBAAECggEABcx+tJF1ZsscX0u2lorLIvkswYOo9jOTpp0QtbA3oMIS\nBOfakwhJ6Sog9mBNA4z+26DS6g0f18uYGvmFhng4S83QVRikAHVd0TVMAboNL3vI\ngPFpyJoLRTdLXVJ41J+TBekuAP0eFrdsd1c00VAYBQD/A9aAOyOEkoNzhpF3wk/K\nRnJYg5p5nUIrroYW1Z6CiMXARiVyKXK6mM1xwbYosONaksmC5z5nyhHRTpr3c8hF\nDSQdfq3L5HjNMEY1G6U7f6BxX1eldsRsz9jXIZXq1FM5195on2LNYYbivv2/hXuA\nMx9nAt3n2iuppLTXlB++UTz/kg+w2kmwr1ivji9lAQKBgQDYqw3uJYSwB/gBVfTu\nL0SJAfO2xmrOpS9PafZssQjnOOL7X1W/nDKYNKNcZf0YgYytEoFMJLupTC7+Ntas\nJlJMXX6uHx9vs4wQ0pyR/A/KBmq3k1LxoHjNm9E/ZvOJ0J56Wz1hjbTWAGEOrQX2\ngofrvP3wr/QiCZPWpMG/xhBAUQKBgQDNOLMwj+zqzciBmkKWeVRBHFuM52NyYrdg\nytc4XKGtdKJIHzlSkwWRLg/euhLjTE/lNwPHmTsSpm8i8L0y9V34tohx1EyttOtk\nGgMcckh5y/QR9UNhBUL8n+B4ilsQuIy2A4+GOJOt20k/Bn1tJrUKXG0MTdnr1zby\nKQkQehW8rQKBgQDKMb8bOan8uEMJxBSBXlz/2nF8ZOfxlhdzbbhIsGFVnjG8Ubhs\nyrAweBbnOEob33HPZZCB5Vm3YOAN3lExb8WnfCynA2ZL0Gtqm5D/bxGw/5IBZJun\n35A8mCeKmmG1f5kVKCY87ogOmWX50x/YbvG23bTBMwKJ7RQo37HrbENoMQKBgHkg\n0FMHgFUO5RvqCwd50Ysky7ydDouDTK1qzCFOO3d/8hETrOfaM1z/jQpvVZqnfjjS\ngf6bqMxXRB2hbmrXfIHCa0KUhjW5JX7OA6wUoEaTZRn8Y6quSl2FmB5Nu3ZhF1yP\nOXWFi1UAq3jxwbJdOFpHN24dvVSAkMPaCKmbBZ15AoGBAMzuFqMz4/aDa/cE+OBr\n2++p7tk40SeWrpLbtKUYfSTi0jNr9wOa4u3hnrNe4WrH8ZUJg6XdsHL6LV6eljio\n7CeOGLaY+we8Kf7dTkFSX8PbrwXFLEMAZFQx6V33zfwVrRV3+lqyB85hqDzClC7w\nnkdvwZOX3oq+7iaZDRDntYwL\n-----END PRIVATE KEY-----\n" // replace with your private key
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
