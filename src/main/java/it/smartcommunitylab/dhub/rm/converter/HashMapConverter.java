package it.smartcommunitylab.dhub.rm.converter;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import jakarta.persistence.AttributeConverter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;

public class HashMapConverter implements AttributeConverter<Map<String, Serializable>, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final MapType typeRef;
    
    protected HashMapConverter() {
        typeRef = objectMapper.getTypeFactory().constructMapType(HashMap.class, String.class, Serializable.class);
    }
    

    @Override
    public String convertToDatabaseColumn(Map<String, Serializable> map) {
        String json = null;
        
        if (map != null) {
            try {
                json = objectMapper.writeValueAsString(map);
            } catch (final JsonProcessingException e) {
            }
        }
        
        return json;
    }

    @Override
    public Map<String, Serializable> convertToEntityAttribute(String json) {

        Map<String, Serializable> map = null;
        if (json != null) {
            try {
                map = objectMapper.readValue(json, typeRef);
            } catch (final IOException e) {
            }

        }
        return map;
    }

}