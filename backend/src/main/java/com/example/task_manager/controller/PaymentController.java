package com.example.task_manager.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {

    @Value("${payment.razorpay.key_id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${payment.razorpay.key_secret:secret_placeholder}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.parseDouble(request.get("amount").toString());
            String method = request.get("method").toString();
            String sessionId = request.get("sessionId").toString();

            Map<String, Object> response = new HashMap<>();

            if ("razorpay".equalsIgnoreCase(method)) {
                // Razorpay expects amount in subunits (paise for INR)
                // If the app uses USD internally, we might want a fixed conversion for testing
                // For now, let's treat the 'amount' as the base currency unit.
                int amountInSubunits = (int) (amount * 100);

                // Check if we have real keys
                boolean isPlaceholder = razorpayKeyId.contains("placeholder") || razorpayKeyId.contains("G7A1F2V1H2");

                if (!isPlaceholder) {
                    try {
                        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

                        JSONObject orderRequest = new JSONObject();
                        orderRequest.put("amount", amountInSubunits);
                        orderRequest.put("currency", "INR"); // Using INR as it's more reliable for test accounts
                        orderRequest.put("receipt",
                                "receipt_" + sessionId.substring(0, Math.min(sessionId.length(), 10)));

                        Order order = razorpay.orders.create(orderRequest);

                        response.put("orderId", order.get("id"));
                        response.put("isMock", false);
                    } catch (Exception e) {
                        System.err.println("Razorpay Order Creation Failed: " + e.getMessage());
                        response.put("error", "Razorpay Error: " + e.getMessage());
                        response.put("isMock", true);
                        response.put("orderId", "order_mock_" + UUID.randomUUID().toString().substring(0, 8));
                    }
                } else {
                    // It's a placeholder key - explicitly mark as mock so frontend doesn't call
                    // real SDK
                    response.put("orderId", "order_simulated_" + UUID.randomUUID().toString().substring(0, 8));
                    response.put("isMock", true);
                }

                response.put("amount", amountInSubunits);
                response.put("currency", "INR");
                response.put("keyId", razorpayKeyId);

            } else if ("adumo".equalsIgnoreCase(method)) {
                // Adumo Test Simulation
                // In a real Adumo enterprise/virtual integration, we would create a session
                // token via their REST API and return the hosted payment page URL.
                String mockTransactionId = "ADU_"
                        + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

                response.put("orderId", mockTransactionId);
                response.put("mockRedirectUrl", "https://checkout.adumoonline.com/test/" + mockTransactionId);
                response.put("simulatedSuccessDelay", 2000); // ms
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported payment method"));
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Payment creation failed: " + e.getMessage()));
        }
    }
}
