package com.example.task_manager.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {

    @Value("${payment.razorpay.key_id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${payment.razorpay.key_secret:secret_placeholder}")
    private String razorpayKeySecret;

    // In-memory store: transactionId -> callbackUrl
    private final Map<String, String> adumoCallbacks = new ConcurrentHashMap<>();

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.parseDouble(request.get("amount").toString());
            String method = request.get("method").toString();
            String sessionId = request.get("sessionId").toString();

            Map<String, Object> response = new HashMap<>();

            if ("razorpay".equalsIgnoreCase(method)) {
                int amountInSubunits = (int) (amount * 100);

                boolean isPlaceholder = razorpayKeyId.contains("placeholder") || razorpayKeyId.contains("G7A1F2V1H2");

                if (!isPlaceholder) {
                    try {
                        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

                        JSONObject orderRequest = new JSONObject();
                        orderRequest.put("amount", amountInSubunits);
                        orderRequest.put("currency", "INR");
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
                    response.put("orderId", "order_simulated_" + UUID.randomUUID().toString().substring(0, 8));
                    response.put("isMock", true);
                }

                response.put("amount", amountInSubunits);
                response.put("currency", "INR");
                response.put("keyId", razorpayKeyId);

            } else if ("adumo".equalsIgnoreCase(method)) {
                String transactionId = "ADU_"
                        + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

                String callbackUrl = "http://localhost:4200/payment-callback?sessionId=" + sessionId;
                adumoCallbacks.put(transactionId, callbackUrl);

                String hopUrl = "http://localhost:8080/api/payment/adumo/hop/" + transactionId
                        + "?callbackUrl=" + java.net.URLEncoder.encode(callbackUrl, "UTF-8");

                response.put("orderId", transactionId);
                response.put("hopUrl", hopUrl);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported payment method"));
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Payment creation failed: " + e.getMessage()));
        }
    }

    @GetMapping(value = "/adumo/hop/{transactionId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> adumoHopPage(
            @PathVariable String transactionId,
            @RequestParam String callbackUrl) {

        adumoCallbacks.put(transactionId, callbackUrl);

        String html = "<!DOCTYPE html>\n" +
            "<html lang=\"en\">\n" +
            "<head>\n" +
            "  <meta charset=\"UTF-8\">\n" +
            "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
            "  <title>Adumo Online — Secure Payment</title>\n" +
            "  <style>\n" +
            "    * { box-sizing: border-box; margin: 0; padding: 0; }\n" +
            "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f4f8; min-height: 100vh; display: flex; flex-direction: column; }\n" +
            "    .header { background: #1B3A6B; color: white; padding: 1rem 2rem; display: flex; align-items: center; gap: 1rem; }\n" +
            "    .logo { font-size: 1.3rem; font-weight: 800; letter-spacing: 1px; }\n" +
            "    .logo span { color: #F5A623; }\n" +
            "    .tagline { font-size: 0.75rem; opacity: 0.7; }\n" +
            "    .container { max-width: 480px; margin: 2rem auto; padding: 0 1rem; width: 100%; }\n" +
            "    .card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }\n" +
            "    .card-header { background: #1B3A6B; color: white; padding: 1.25rem 1.5rem; }\n" +
            "    .card-header h2 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }\n" +
            "    .card-header .tx-id { font-size: 0.75rem; opacity: 0.65; font-family: monospace; }\n" +
            "    .card-body { padding: 1.5rem; }\n" +
            "    .form-group { margin-bottom: 1.1rem; }\n" +
            "    label { display: block; font-size: 0.78rem; color: #555; font-weight: 600; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.5px; }\n" +
            "    input, select { width: 100%; padding: 0.7rem 0.9rem; border: 1.5px solid #ddd; border-radius: 7px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }\n" +
            "    input:focus, select:focus { border-color: #1B3A6B; }\n" +
            "    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }\n" +
            "    .btn-pay { width: 100%; padding: 0.9rem; background: #1B3A6B; color: white; border: none; border-radius: 7px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; transition: background 0.2s; letter-spacing: 0.5px; }\n" +
            "    .btn-pay:hover { background: #142d55; }\n" +
            "    .btn-cancel { width: 100%; padding: 0.6rem; background: transparent; color: #999; border: none; font-size: 0.85rem; cursor: pointer; margin-top: 0.5rem; text-decoration: underline; }\n" +
            "    .secure { text-align: center; font-size: 0.75rem; color: #aaa; margin-top: 1rem; }\n" +
            "    .secure span { color: #4CAF50; }\n" +
            "    .spinner-overlay { display: none; position: fixed; inset: 0; background: rgba(255,255,255,0.92); align-items: center; justify-content: center; flex-direction: column; gap: 1rem; }\n" +
            "    .spinner-overlay.show { display: flex; }\n" +
            "    .spin { width: 44px; height: 44px; border: 4px solid #e0e0e0; border-top-color: #1B3A6B; border-radius: 50%; animation: spin 0.8s linear infinite; }\n" +
            "    @keyframes spin { to { transform: rotate(360deg); } }\n" +
            "  </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <div class=\"header\">\n" +
            "    <div>\n" +
            "      <div class=\"logo\">Adumo<span>Online</span></div>\n" +
            "      <div class=\"tagline\">Hosted Payment Page</div>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "  <div class=\"container\">\n" +
            "    <div class=\"card\">\n" +
            "      <div class=\"card-header\">\n" +
            "        <h2>Secure Card Payment</h2>\n" +
            "        <div class=\"tx-id\">Transaction: " + transactionId + "</div>\n" +
            "      </div>\n" +
            "      <div class=\"card-body\">\n" +
            "        <form method=\"POST\" action=\"/api/payment/adumo/hop/" + transactionId + "/pay\" onsubmit=\"showSpinner()\">\n" +
            "          <input type=\"hidden\" name=\"callbackUrl\" value=\"" + escapeHtml(callbackUrl) + "\">\n" +
            "          <div class=\"form-group\">\n" +
            "            <label>Card Number</label>\n" +
            "            <input type=\"text\" name=\"cardNumber\" placeholder=\"4111 1111 1111 1111\" maxlength=\"19\" oninput=\"fmtCard(this)\" required>\n" +
            "          </div>\n" +
            "          <div class=\"form-group\">\n" +
            "            <label>Cardholder Name</label>\n" +
            "            <input type=\"text\" name=\"cardName\" placeholder=\"John Doe\" required>\n" +
            "          </div>\n" +
            "          <div class=\"row2\">\n" +
            "            <div class=\"form-group\">\n" +
            "              <label>Expiry (MM/YY)</label>\n" +
            "              <input type=\"text\" name=\"expiry\" placeholder=\"12/27\" maxlength=\"5\" oninput=\"fmtExpiry(this)\" required>\n" +
            "            </div>\n" +
            "            <div class=\"form-group\">\n" +
            "              <label>CVV</label>\n" +
            "              <input type=\"password\" name=\"cvv\" placeholder=\"•••\" maxlength=\"3\" required>\n" +
            "            </div>\n" +
            "          </div>\n" +
            "          <button type=\"submit\" class=\"btn-pay\">PAY SECURELY →</button>\n" +
            "        </form>\n" +
            "        <form method=\"GET\" action=\"" + escapeHtml(callbackUrl) + "\" style=\"margin:0;\" onsubmit=\"addCancelParam(this)\">\n" +
            "          <button type=\"submit\" class=\"btn-cancel\" onclick=\"this.form.action='" + escapeHtml(callbackUrl) + "' + '&status=CANCELLED'\">Cancel Payment</button>\n" +
            "        </form>\n" +
            "        <div class=\"secure\"><span>🔒</span> 256-bit TLS encrypted · PCI DSS compliant</div>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "  <div class=\"spinner-overlay\" id=\"spinner\">\n" +
            "    <div class=\"spin\"></div>\n" +
            "    <div style=\"color:#1B3A6B; font-weight:600;\">Processing payment...</div>\n" +
            "  </div>\n" +
            "  <script>\n" +
            "    function fmtCard(i) { let v=i.value.replace(/\\D/g,'').substring(0,16); i.value=v.replace(/(.{4})/g,'$1 ').trim(); }\n" +
            "    function fmtExpiry(i) { let v=i.value.replace(/\\D/g,''); if(v.length>=2) v=v.substring(0,2)+'/'+v.substring(2); i.value=v; }\n" +
            "    function showSpinner() { document.getElementById('spinner').classList.add('show'); }\n" +
            "  </script>\n" +
            "</body>\n" +
            "</html>";

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    @PostMapping("/adumo/hop/{transactionId}/pay")
    public ResponseEntity<Void> adumoHopPay(
            @PathVariable String transactionId,
            @RequestParam(required = false) String callbackUrl) {

        String callback = callbackUrl != null ? callbackUrl : adumoCallbacks.getOrDefault(transactionId, "http://localhost:4200/payment-callback");

        String separator = callback.contains("?") ? "&" : "?";
        String redirectUrl = callback + separator + "status=SUCCESS&transactionId=" + transactionId;

        return ResponseEntity.status(302)
                .location(URI.create(redirectUrl))
                .build();
    }

    private String escapeHtml(String text) {
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
