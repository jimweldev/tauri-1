// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut updater_builder = tauri_plugin_updater::Builder::new();

    let pat = option_env!("VITE_GITHUB_PAT").unwrap_or_default();
    if !pat.is_empty() {
        updater_builder = updater_builder
            .header("Authorization", format!("Bearer {}", pat))
            .expect("failed to set updater auth header");
    }

    tauri::Builder::default()
        .plugin(updater_builder.build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
