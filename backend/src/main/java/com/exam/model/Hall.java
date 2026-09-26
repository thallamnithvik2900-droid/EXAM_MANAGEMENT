package com.exam.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "halls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String hallCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String building;

    @Column(nullable = false)
    private String floor;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer rows;

    @Column(nullable = false)
    private Integer cols;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
