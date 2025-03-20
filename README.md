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
    import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY";  // Replace with your service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Invalid request method" }), { status: 405 });
  }


  try {
    const { deviceType } = await req.json();
    if (!deviceType) {
      return new Response(JSON.stringify({ error: "Device Type is required" }), { status: 400 });
    }


    // Fetch the FCM token from Supabase
    const { data, error } = await supabase
      .from("device_tokens")
      .select("fcm_token")
      .eq("device_type", deviceType)
      .single();


    if (error || !data) {
      return new Response(JSON.stringify({ error: "No mobile device found" }), { status: 400 });
    }


    const fcmToken = data.fcm_token;


    // Send notification via Firebase
    const notificationResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_FCM_SERVER_KEY" // Replace with your FCM server key
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: "Alert from Watch",
          body: "This is a test notification from the watch app.",
        },
      }),
    });


    return new Response(JSON.stringify(await notificationResponse.json()), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
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
