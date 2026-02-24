package com.example.task_manager.controller;

import com.example.task_manager.model.CartItem;
import com.example.task_manager.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CartController {
    private final CartService cartService;

    @GetMapping("/{sessionId}")
    public List<CartItem> getCart(@PathVariable("sessionId") String sessionId) {
        return cartService.getCart(sessionId);
    }

    @PostMapping
    public CartItem addToCart(@RequestBody CartItem item) {
        return cartService.addToCart(item);
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable("itemId") Long itemId) {
        cartService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> clearCart(@PathVariable("sessionId") String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sessionId}/total")
    public Map<String, Double> getTotal(@PathVariable("sessionId") String sessionId) {
        return Map.of("total", cartService.getCartTotal(sessionId));
    }
}
