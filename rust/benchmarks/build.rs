fn main() -> Result<(), Box<dyn std::error::Error>> {
    let manifest_dir = std::path::PathBuf::from(std::env::var("CARGO_MANIFEST_DIR")?);
    let examples_dir = manifest_dir
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("examples");
    let example_names = ["Primitives", "Test", "User", "GameState"];

    let proto_files: Vec<std::path::PathBuf> = example_names
        .iter()
        .map(|name| examples_dir.join(name).join("schema.proto"))
        .collect();

    let descriptor_path =
        std::path::PathBuf::from(std::env::var("OUT_DIR")?).join("proto_descriptor.bin");

    prost_build::Config::new()
        .file_descriptor_set_path(&descriptor_path)
        .compile_protos(&proto_files, &[&examples_dir])?;

    let descriptor_set = std::fs::read(&descriptor_path)?;
    pbjson_build::Builder::new()
        .register_descriptors(&descriptor_set)?
        .build(&["."])?;

    let out_dir = std::path::PathBuf::from(std::env::var("OUT_DIR")?);
    let avro_generator = rsgen_avro::Generator::new()?;
    for name in example_names {
        let schema_path = examples_dir.join(name).join("schema.avsc");
        println!("cargo:rerun-if-changed={}", schema_path.display());
        let schema_str = std::fs::read_to_string(&schema_path)?;
        let out_path = out_dir.join(format!("avro_{}.rs", name.to_lowercase()));
        let mut buf: Vec<u8> = Vec::new();
        avro_generator.generate(&rsgen_avro::Source::SchemaStr(&schema_str), &mut buf)?;
        let generated = String::from_utf8(buf)?;
        let namespace = extract_namespace(&schema_str);
        let patched = add_fullname_aliases(&generated, &namespace);
        std::fs::write(&out_path, patched)?;
    }

    Ok(())
}

// Pulls the top-level `"namespace"` string out of an .avsc JSON without
// pulling in serde_json as a build-dep. Good enough for our fixed schemas.
fn extract_namespace(avsc: &str) -> String {
    let marker = "\"namespace\"";
    let Some(idx) = avsc.find(marker) else {
        return String::new();
    };
    let after = &avsc[idx + marker.len()..];
    let Some(open) = after.find('"') else {
        return String::new();
    };
    let after_open = &after[open + 1..];
    let Some(close) = after_open.find('"') else {
        return String::new();
    };
    after_open[..close].to_string()
}

// rsgen-avro generates wrapper enums for non-null multi-variant Avro unions,
// e.g. `UnionEmailContactPhoneContact`. The default derive expects serde's
// externally-tagged form on input (`{"EmailContact": {...}}`) — which our
// JSON fixtures already use. But serde_avro_fast, when projecting an Avro
// union into serde, uses the fully-qualified Avro name as the variant tag
// (e.g. `Avro.User.EmailContact`). That variant name doesn't match, so
// decode fails.
//
// Fix: add `#[serde(alias = "<ns>.<Variant>")]` to each variant of these
// wrapper enums so they accept both the short name (from JSON) and the
// fully-qualified name (from serde_avro_fast). Encode path is untouched;
// the custom Serialize impl rsgen-avro emits already does the right thing.
fn add_fullname_aliases(src: &str, namespace: &str) -> String {
    if namespace.is_empty() {
        return src.to_string();
    }

    let marker = "#[serde(remote = \"Self\")]";
    let mut cursor = 0;
    let mut out = String::with_capacity(src.len() + 256);

    while let Some(rel_marker) = src[cursor..].find(marker) {
        let marker_abs = cursor + rel_marker;
        // Find the opening `{` of the enum body that follows the marker.
        let after_marker = marker_abs + marker.len();
        let Some(rel_brace) = src[after_marker..].find('{') else {
            break;
        };
        let body_start = after_marker + rel_brace + 1;
        // Find the matching `}` — enum bodies don't nest braces so a simple
        // scan works.
        let Some(rel_close) = src[body_start..].find('}') else {
            break;
        };
        let body_end = body_start + rel_close;

        // Emit everything up to (and including) the body-open brace.
        out.push_str(&src[cursor..body_start]);

        // Rewrite the body: prepend `#[serde(alias = "<ns>.<Variant>")]`
        // before each variant line.
        let body = &src[body_start..body_end];
        for line in body.lines() {
            let trimmed = line.trim_start();
            // Variant lines look like `Foo(Foo),` — name-then-paren, no
            // attrs. Skip blank lines and anything already starting with `#`.
            if trimmed.is_empty() || trimmed.starts_with('#') {
                out.push_str(line);
                out.push('\n');
                continue;
            }
            // Extract variant name: letters/digits/_ until `(` or whitespace.
            let variant: String = trimmed
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_')
                .collect();
            if variant.is_empty() {
                out.push_str(line);
                out.push('\n');
                continue;
            }
            let indent: String = line.chars().take_while(|c| c.is_whitespace()).collect();
            out.push_str(&format!(
                "{}#[serde(alias = \"{}.{}\")]\n",
                indent, namespace, variant
            ));
            out.push_str(line);
            out.push('\n');
        }

        cursor = body_end;
    }

    out.push_str(&src[cursor..]);
    out
}
