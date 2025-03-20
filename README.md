Supabase Notification System (Watch & Mobile)
=============================================

This project consists of two parts:

1.  **Mobile App (Flutter):** Stores the mobile FCM token in Supabase and receives notifications.
    
2.  **Watch App (Flutter):** Triggers an Edge Function to send a notification to the mobile device.
    

Setup Instructions
------------------

### Prerequisites

*   **Supabase account** ([sign up here](https://supabase.com/))
    
*   **Flutter installed** ([installation guide](https://docs.flutter.dev/get-started/install))
    
*   **Firebase project setup** ([Firebase setup guide](https://firebase.google.com/docs/flutter/setup))
    

 Mobile App Setup (Receiver)
------------------------------

### 3.Configure Firebase for FCM

*   Follow the [Firebase setup guide](https://firebase.google.com/docs/flutter/setup) to integrate Firebase Cloud Messaging (FCM) into your mobile app.
    
*   Add the google-services.json (for Android) or GoogleService-Info.plist (for iOS) in the required location.
    

### 3.Save the FCM Token to Supabase

*   The mobile app should store its **FCM token** in the device\_tokens table on Supabase.
    
*   CREATE TABLE device\_tokens ( id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(), fcm\_token TEXT NOT NULL, device\_type TEXT NOT NULL);
    
*   Ensure the mobile app sends its FCM token when launching for the first time.
    

### 3.Running the Mobile App

``` bash
flutter run
```

Watch App Setup (Trigger)
---------------------------

### 1.Ensure Mobile FCM Token is Stored

Before running the watch app, **ensure that the mobile device's FCM token is present** in the Supabase device\_tokens table.

### 2.Invoke Edge Function from Watch

The watch app will trigger a **Supabase Edge Function** that sends a notification to the stored mobile FCM token.

### 3.Running the Watch App

``` bash
flutter run
```
Supabase Edge Function (Notification Sender)
--------------------------------------------

### 1.Deploying the Edge Function

*   Create an Edge Function in Supabase named sendNotification.
    
*   Add the following code:
  ```bash
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

```


 
    



### 2.Deploy the Edge Function
 ``` bash
supabase functions deploy sendNotification
```


Triggering Notification from Watch
----------------------------------

*   The watch app sends a **POST request** to the Edge Function.
    
*   The function fetches the **mobile device FCM token** from Supabase.
    
*   It sends a **notification to the mobile device**.
    

Notes
-----

*   Replace YOUR\_SUPABASE\_URL, YOUR\_SUPABASE\_SERVICE\_ROLE\_KEY, and YOUR\_FCM\_SERVER\_KEY with actual values.
    
*   Ensure the **mobile app stores its FCM token** in Supabase before running the watch app.
    
*   The **watch does not receive notifications**; it only **triggers notifications to the mobile device**.
    

Now, clicking the **Send Notification** button on the watch will send a notification to the mobile device.
