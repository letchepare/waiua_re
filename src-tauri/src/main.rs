// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

use reqwest::{
    header::{HeaderMap, HeaderValue},
    Client,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn custom_log(text: &str) {
    let text_to_write: String = format!("logged: {}", text.to_string());
    println!("{}", text_to_write);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, custom_log,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
