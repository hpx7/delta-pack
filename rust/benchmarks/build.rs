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

    Ok(())
}
