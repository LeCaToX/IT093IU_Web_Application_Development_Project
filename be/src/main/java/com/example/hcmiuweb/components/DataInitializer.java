package com.example.hcmiuweb.components;

import com.example.hcmiuweb.entities.Category;
import com.example.hcmiuweb.entities.Role;
import com.example.hcmiuweb.entities.User;
import com.example.hcmiuweb.repositories.CategoryRepository;
import com.example.hcmiuweb.repositories.RoleRepository;
import com.example.hcmiuweb.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

        private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

        private final RoleRepository roleRepository;
        private final CategoryRepository categoryRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        public DataInitializer(RoleRepository roleRepository,
                        CategoryRepository categoryRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {
                this.roleRepository = roleRepository;
                this.categoryRepository = categoryRepository;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) {
                // Add default roles if none exist
                if (roleRepository.count() == 0) {
                        roleRepository.save(new Role("ROLE_USER"));
                        roleRepository.save(new Role("ROLE_ADMIN"));
                        logger.info("Default roles created");
                } else {
                        // Check for specific roles even if some roles exist
                        if (roleRepository.findByRoleName("ROLE_USER").isEmpty()) {
                                roleRepository.save(new Role("ROLE_USER"));
                                logger.info("Added missing ROLE_USER");
                        }
                        if (roleRepository.findByRoleName("ROLE_ADMIN").isEmpty()) {
                                roleRepository.save(new Role("ROLE_ADMIN"));
                                logger.info("Added missing ROLE_ADMIN");
                        }
                }

                // Initialize admin account if it doesn't exist
                if (!userRepository.existsByUsername("admin")) {
                        Role adminRole = roleRepository.findByRoleName("ROLE_ADMIN")
                                        .orElseThrow(() -> new RuntimeException("Admin role not found"));

                        User adminUser = new User(
                                        "admin",
                                        "admin@gmail.com",
                                        "12345678", // Using raw password, will be encoded below
                                        LocalDateTime.now(),
                                        "/resources/static/images/avatars/default-avatar.jpg",
                                        adminRole);

                        adminUser.setPassword(passwordEncoder.encode(adminUser.getPassword()));
                        userRepository.save(adminUser);
                        logger.info("Admin account created with username: admin");
                }

                if (categoryRepository.count() == 0) {
                        categoryRepository.save(new Category("Entertainment"));
                        categoryRepository.save(new Category("Education"));
                        categoryRepository.save(new Category("Technology"));
                        categoryRepository.save(new Category("Sports"));
                        categoryRepository.save(new Category("Music"));
                        logger.info("Default categories created");
                }
        }
}
