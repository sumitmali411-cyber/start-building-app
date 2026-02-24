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

    public CustomerOrder getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }
}
