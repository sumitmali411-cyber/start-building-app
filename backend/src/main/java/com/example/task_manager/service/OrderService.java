package com.example.task_manager.service;

import com.example.task_manager.model.CartItem;
import com.example.task_manager.model.CustomerOrder;
import com.example.task_manager.model.OrderItem;
import com.example.task_manager.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartService cartService;

    @Transactional
    public CustomerOrder createOrder(String sessionId) {
        List<CartItem> cartItems = cartService.getCart(sessionId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        CustomerOrder order = new CustomerOrder();
        order.setSessionId(sessionId);
        order.setTotalAmount(cartItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum());

        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProductName(cartItem.getProductName());
            oi.setPrice(cartItem.getPrice());
            oi.setQuantity(cartItem.getQuantity());
            oi.setConfigValues(cartItem.getCharacteristicValues());
            return oi;
        }).collect(Collectors.toList());

        order.setItems(orderItems);
        CustomerOrder saved = orderRepository.save(order);

        cartService.clearCart(sessionId);
        return saved;
    }

    /**
     * Looks up an order, but only for the session that placed it. Without the
     * session check this is an IDOR: order ids are sequential, so anyone could
     * walk /api/orders/1..n and read every customer's items and totals.
     */
    public CustomerOrder getOrder(Long id, String sessionId) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (sessionId == null || !sessionId.equals(order.getSessionId())) {
            // Same error as a missing order, so this cannot be used to probe
            // which order ids exist.
            throw new OrderNotFoundException("Order not found");
        }

        return order;
    }

    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(String message) {
            super(message);
        }
    }
}
