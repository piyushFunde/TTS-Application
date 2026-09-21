package com.example.tts;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TtsApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthCheckReturnsOk() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void voicesEndpointReturnsList() throws Exception {
        mockMvc.perform(get("/api/voices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    void validTtsRequestCreatesAudio() throws Exception {
        String payload = """
            {
              "text": "Hello, welcome to Echo text to speech studio.",
              "language": "en-US",
              "voice": "en-US-JennyNeural",
              "speed": 1.0,
              "pitch": 1.0
            }
            """;

        mockMvc.perform(post("/api/tts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.audioUrl").exists());
    }

    @Test
    void emptyTextReturnsBadRequest() throws Exception {
        String payload = """
            {
              "text": "",
              "language": "en-US",
              "voice": "en-US-JennyNeural"
            }
            """;

        mockMvc.perform(post("/api/tts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.validationErrors.text").exists());
    }
}
