fn main() {
    // Pass VITE_GITHUB_PAT from .env to Rust at compile time
    if let Ok(contents) = std::fs::read_to_string("../.env") {
        for line in contents.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((key, value)) = line.split_once('=') {
                let key = key.trim();
                let value = value.trim();
                if key == "VITE_GITHUB_PAT" && !value.is_empty() {
                    println!("cargo:rustc-env=VITE_GITHUB_PAT={}", value);
                }
            }
        }
    }

    tauri_build::build()
}
