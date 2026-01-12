use serde::{Deserialize, Serialize};

// Manually create a union type to test JSON serialization format
// Uses externally-tagged format to match TypeScript/C# JSON serialization
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct TextMessage {
    pub text: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct ImageMessage {
    pub url: String,
    pub width: i64,
}

// Externally-tagged enum (default serde format) matches TS/C# JSON format
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum Message {
    TextMessage(TextMessage),
    ImageMessage(ImageMessage),
}

#[test]
fn test_union_json_serialize() {
    let msg = Message::TextMessage(TextMessage {
        text: "hello".to_string(),
    });

    let json = serde_json::to_string(&msg).unwrap();
    // Should produce: {"TextMessage":{"text":"hello"}}
    assert!(json.contains("\"TextMessage\""));
    assert!(json.contains("\"text\":\"hello\""));
}

#[test]
fn test_union_json_deserialize() {
    // This is the TypeScript/C# format (externally-tagged)
    let json = r#"{"ImageMessage":{"url":"http://example.com/img.png","width":800}}"#;

    let msg: Message = serde_json::from_str(json).unwrap();
    match msg {
        Message::ImageMessage(img) => {
            assert_eq!(img.url, "http://example.com/img.png");
            assert_eq!(img.width, 800);
        }
        _ => panic!("Expected ImageMessage"),
    }
}

#[test]
fn test_union_roundtrip() {
    let original = Message::TextMessage(TextMessage {
        text: "test message".to_string(),
    });

    let json = serde_json::to_string(&original).unwrap();
    let decoded: Message = serde_json::from_str(&json).unwrap();

    assert_eq!(original, decoded);
}
