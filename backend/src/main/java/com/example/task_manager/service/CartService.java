package com.example.task_manager.service;

import com.example.task_manager.model.CartItem;
import com.example.task_manager.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartItemRepository;

    public List<CartItem> getCart(String sessionId) {
        return cartItemRepository.findBySessionId(sessionId);
    }

    public CartItem addToCart(CartItem item) {
        return cartItemRepository.save(item);
    }

    public void removeItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }

    @Transactional
    public void clearCart(String sessionId) {
        cartItemRepository.deleteBySessionId(sessionId);
    }

    public Double getCartTotal(String sessionId) {
        return cartItemRepository.findBySessionId(sessionId).stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
}
