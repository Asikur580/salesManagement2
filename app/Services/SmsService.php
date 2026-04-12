<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $apiUrl;
    protected $apiKey;
    protected $senderId;

    public function __construct()
    {
        // Add defaults here. When user is ready, they update their .env
        $this->apiUrl = env('SMS_API_URL', 'http://api.greenweb.com.bd/api.php');
        $this->apiKey = env('SMS_API_TOKEN', 'YOUR_API_TOKEN');
        $this->senderId = env('SMS_SENDER_ID', 'YOUR_SENDER_ID');
    }

    /**
     * Send an OTP code to a specific phone number
     *
     * @param string $phone
     * @param string $otp
     * @return bool
     */
    public function sendOTP($phone, $otp): bool
    {
        // Formatting the message
        $message = "Your One Time Password (OTP) is: {$otp}. It will expire in 5 minutes.";
        return $this->send($phone, $message);
    }

    /**
     * Core method to dispatch the HTTP request to the Gateway
     * Note: Depending on the API Gateway chosen later, the payload format might change slightly.
     * This format matches most standard Bulk SMS APIs (e.g. GreenWeb).
     */
    public function send($phone, $message): bool
    {
        // If credentials are not set exactly, fallback to logs to prevent crashing
        if ($this->apiKey === 'YOUR_API_TOKEN' && !env('TWILIO_SID')) {
            Log::info("[DUMMY SMS GATEWAY] To: {$phone} | Message: {$message}");
            return true;
        }

        try {
            // Check if Twilio config exists in .env
            if (env('TWILIO_SID')) {
                $sid = env('TWILIO_SID');
                $token = env('TWILIO_AUTH_TOKEN');
                $from = env('TWILIO_FROM');
                $url = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";

                $response = Http::withBasicAuth($sid, $token)
                    ->asForm()
                    ->post($url, [
                        'To' => (str_starts_with($phone, '+') ? $phone : '+88'.$phone), // Ensure E.164 format
                        'From' => $from,
                        'Body' => $message,
                    ]);
            } else {
                // Default Local / Bulk SMS Gateway (Like GreenWeb)
                $response = Http::post($this->apiUrl, [
                    'token' => $this->apiKey,
                    'to' => $phone,
                    'message' => $message,
                ]);
            }

            // Assuming a 2xx HTTP code means success
            if ($response->successful()) {
                Log::info("SMS successfully sent to {$phone}. Response: " . $response->body());
                return true;
            }

            Log::error("SMS sending failed for {$phone}. API Response: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("Failed to connect to SMS API: " . $e->getMessage());
            return false;
        }
    }
}
