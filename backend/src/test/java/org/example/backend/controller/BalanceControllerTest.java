package org.example.backend.controller;

import org.example.backend.Entity.BalanceEntity;
import org.example.backend.RestController.BalanceController;
import org.example.backend.service.BalanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BalanceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BalanceService balanceService;

    @InjectMocks
    private BalanceController balanceController;

    private void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(balanceController)
                .build();
    }

    private BalanceEntity createEntity(double amount) {
        BalanceEntity entity = new BalanceEntity();
        entity.setAmount(amount);
        return entity;
    }

    @Test
    void getBalance_shouldReturnBalance() throws Exception {
        setup();
        when(balanceService.getBalance()).thenReturn(createEntity(100000));

        mockMvc.perform(get("/balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(100000));
    }

    @Test
    void add_shouldReturnUpdatedBalance() throws Exception {
        setup();
        when(balanceService.add(5000)).thenReturn(createEntity(105000));

        mockMvc.perform(post("/balance/add/5000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(105000));
    }

    @Test
    void subtract_shouldReturnUpdatedBalance() throws Exception {
        setup();
        when(balanceService.subtract(2000)).thenReturn(createEntity(98000));

        mockMvc.perform(post("/balance/subtract/2000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(98000));
    }

    @Test
    void update_shouldReturnUpdatedBalance() throws Exception {
        setup();
        when(balanceService.updateBalance(120000)).thenReturn(createEntity(120000));

        mockMvc.perform(put("/balance/update/120000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(120000));
    }
}

