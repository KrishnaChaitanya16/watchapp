import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Edge Function Trigger',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  // Replace with your Edge function URL
  final String edgeFunctionUrl = "YOUR_FUNCTION_URL"; // Replace with actual edge function URL

  // Example device type
  final String deviceType = "mobile";  // Replace with actual device type (e.g., "mobile")

  // Replace with your actual Authorization Bearer token
  final String authorizationToken = "YOUR_API_KEY"; // Replace with actual bearer token

  // Function to invoke the Edge function (e.g., send notification)
  Future<void> _invokeEdgeFunction() async {
    try {
      final response = await http.post(
        Uri.parse(edgeFunctionUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authorizationToken', // Include the bearer token
        },
        body: jsonEncode({
          'deviceType': deviceType,  // Only sending deviceType, no need to send fcmToken
        }),
      );

      print("Response Status Code: ${response.statusCode}");
      print("Response Body: ${response.body}");

      if (response.statusCode == 200) {
        print("Notification sent successfully");
      } else {
        print("Failed to send notification. Response: ${response.body}");
      }
    } catch (e) {
      print("Error occurred while triggering the edge function: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edge Function Trigger'),
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: _invokeEdgeFunction,
          child: const Text("Send Notification"),
        ),
      ),
    );
  }
}
