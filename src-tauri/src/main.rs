// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, fs};

use http_cache_reqwest::{CACacheManager, Cache, CacheMode, HttpCache};
use reqwest::{
    header::{HeaderMap, HeaderValue},
    Client,
};
use reqwest_middleware::{ClientBuilder, ClientWithMiddleware};

fn build_reqwest_client() -> ClientWithMiddleware {
    let reqwest_client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    let client = ClientBuilder::new(reqwest_client)
        .with(Cache(HttpCache {
            mode: CacheMode::ForceCache,
            manager: CACacheManager::default(),
            options: None,
        }))
        .build();
    return client;
}
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

#[tauri::command]
fn get_valorant_local_server_port() -> String {
    let data =
        fs::read_to_string("C:/Users/lilian/AppData/Local/Riot Games/Riot Client/Config/lockfile");
    let data = match data {
        Ok(file) => file,
        Err(e) => {
            custom_log(&e.to_string());
            return "".to_string();
        }
    };
    let split_data: Vec<&str> = data.split(":").collect();
    let port = split_data[2].to_string();
    let password = split_data[3].to_string();
    return format!("{{\"port\": \"{}\", \"password\":\"{}\"}}", port, password).to_string();
}

#[tauri::command]
async fn get_player_infos(url: &str, password: &str) -> Result<String, String> {
    let client = build_reqwest_client();

    let res = client
        .get(url)
        .basic_auth("riot", Some(password.to_string()))
        .send()
        .await
        .expect("failed to get response")
        .text()
        .await
        .expect("failed to get payload");

    Ok(res.to_string())
}
#[tauri::command]
async fn get_user_infos_token(url: &str, password: &str) -> Result<String, String> {
    let client = build_reqwest_client();

    let res = client
        .get(url)
        .basic_auth("riot", Some(password.to_string()))
        .send()
        .await
        .expect("failed to get response")
        .text()
        .await
        .expect("failed to get payload");

    Ok(res.to_string())
}

#[tauri::command]
async fn party_fetch_player(url: &str, bearer_token: &str) -> Result<String, String> {
    let client = build_reqwest_client();

    let mut headers = HeaderMap::new();
    headers.insert(
        "X-Riot-ClientVersion",
        HeaderValue::from_str("06.10.00.885592").unwrap(),
    );
    headers.insert("X-Riot-Entitlements-JWT", HeaderValue::from_str("eyJraWQiOiJrMSIsImFsZyI6IlJTMjU2In0.eyJlbnRpdGxlbWVudHMiOltdLCJhdF9oYXNoIjoib016bEprUjBmTERKUjBWS3hyVDBxQSIsInN1YiI6IjhmNjQzMzdjLTc1ZDItNWY0ZC04NmIxLTM0ZGYwZjdkYTA4MiIsImlzcyI6Imh0dHBzOlwvXC9lbnRpdGxlbWVudHMuYXV0aC5yaW90Z2FtZXMuY29tIiwiaWF0IjoxNjg2MDUxNzA2LCJqdGkiOiJUUmVCYmNPVklYOCJ9.QgaOf2Ck_BuM6kyzFQyk0HTJS3AAvCE4BMtwxz5IY0Tb_q4BoYP9mYtfcUq-2vg1eipQUYbSoKukD7k1ZiHxLXz1W0Z5Cmj7JRIlXjW-LjNRadYxz36y0nUAmNnfCTq1J0xV1PiNeE20YPX_Vx-VV5TDwfq8pXJaOkpKym8stGVYeURBYmIaHWm2PDgU5cot1koWnbD9ZeDLYzZk9hyhWwPY7pcNEmRaoyJLiXW229X3N8-bY7eq_7O6unqghoGQxPtQYUjH9rS__EVd6-dBQHuQt75TzRRG7BxrfMIqYr_K-LvDU2IcN9HSpamkTuJ1Bifla3iCAlszhMVRKxN9pg").unwrap());

    let res = client
        .get(url)
        .headers(headers)
        .bearer_auth(bearer_token)
        .send()
        .await
        .expect("failed to get response")
        .text()
        .await
        .expect("failed to get payload");

    Ok(res.to_string())
}

#[tauri::command]
async fn http_get(url: &str, headers: Option<HashMap<&str, &str>>) -> Result<String, ()> {
    return Ok(http_custom::get(url, headers).await);
}

#[tauri::command]
async fn http_get_basic_auth(
    url: &str,
    user: &str,
    password: &str,
    headers: Option<HashMap<&str, &str>>,
) -> Result<String, ()> {
    return Ok(http_custom::get_basic_auth(url, user, password, headers).await);
}

#[tauri::command]
async fn http_get_bearer_auth(
    url: &str,
    bearer: &str,
    headers: Option<HashMap<&str, &str>>,
) -> Result<String, String> {
    return http_custom::get_bearer_auth(url, bearer, headers).await;
}

#[tauri::command]
async fn http_put_bearer_auth(
    url: &str,
    bearer: &str,
    body: &str,
    headers: Option<HashMap<&str, &str>>,
) -> Result<String, String> {
    return http_custom::put_bearer_auth(url, bearer, body, headers).await;
}
fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            #[cfg(debug_assertions)] // n'incluez ce code que sur les versions de débogage
            {
                let window = _app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            custom_log,
            get_valorant_local_server_port,
            get_player_infos,
            get_user_infos_token,
            party_fetch_player,
            http_get,
            http_get_basic_auth,
            http_get_bearer_auth,
            http_put_bearer_auth
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod http_custom {

    use std::{collections::HashMap, str::FromStr};

    use reqwest::{
        header::{HeaderMap, HeaderName, HeaderValue},
        Body, Client, ClientBuilder,
    };

    fn get_client() -> Client {
        let client: Client = match ClientBuilder::new()
            .danger_accept_invalid_certs(true)
            .build()
        {
            Ok(client) => client,
            Err(error) => panic!(
                "an error occured while creating the client {}",
                error.to_string()
            ),
        };
        return client;
    }

    pub async fn get(url: &str, headers: Option<HashMap<&str, &str>>) -> String {
        println!("url: {}", url);
        let mut headers_map: HeaderMap = HeaderMap::new();

        if headers.is_some() {
            headers_map = get_headers(headers.unwrap());
        }
        return get_client()
            .get(url)
            .headers(headers_map)
            .send()
            .await
            .expect("Failed to get response")
            .text()
            .await
            .expect("failed to get response body");
    }

    pub async fn get_basic_auth(
        url: &str,
        user: &str,
        password: &str,
        headers: Option<HashMap<&str, &str>>,
    ) -> String {
        let mut headers_map: HeaderMap = HeaderMap::new();

        if headers.is_some() {
            headers_map = get_headers(headers.unwrap());
        }
        return get_client()
            .get(url)
            .basic_auth(user, Some(password))
            .headers(headers_map)
            .send()
            .await
            .expect("Failed to get response")
            .text()
            .await
            .expect("failed to get response body");
    }

    pub async fn get_bearer_auth(
        url: &str,
        bearer: &str,
        headers: Option<HashMap<&str, &str>>,
    ) -> Result<String, String> {
        let mut headers_map: HeaderMap = HeaderMap::new();

        if headers.is_some() {
            headers_map = get_headers(headers.unwrap());
        }
        let result = get_client()
            .get(url)
            .bearer_auth::<&str>(bearer)
            .headers(headers_map)
            .send()
            .await;
        match result {
            Ok(response) => {
                let status = response.status();
                match status {
                    reqwest::StatusCode::OK => Ok(response.text().await.unwrap()),
                    _ => Err(response.text().await.unwrap()),
                }
            }
            Err(error) => Err(error.to_string()),
        }
    }

    pub async fn put_bearer_auth(
        url: &str,
        bearer: &str,
        body: &str,
        headers: Option<HashMap<&str, &str>>,
    ) -> Result<String, String> {
        let body_obj = Body::from(body.to_string());
        let mut headers_map: HeaderMap = HeaderMap::new();

        if headers.is_some() {
            headers_map = get_headers(headers.unwrap());
        }
        let result = get_client()
            .put(url)
            .body(body_obj)
            .bearer_auth::<&str>(bearer)
            .headers(headers_map)
            .send()
            .await;
        match result {
            Ok(response) => {
                let status = response.status();
                match status {
                    reqwest::StatusCode::OK => Ok(response.text().await.unwrap()),
                    _ => Err(response.text().await.unwrap()),
                }
            }
            Err(error) => Err(error.to_string()),
        }
    }
    fn get_headers(map: HashMap<&str, &str>) -> HeaderMap {
        let mut headers_map: HeaderMap = HeaderMap::new();
        for (key, value) in map.into_iter() {
            headers_map.insert(
                HeaderName::from_str(key).unwrap(),
                HeaderValue::from_str(value).unwrap(),
            );
        }
        return headers_map;
    }
}
