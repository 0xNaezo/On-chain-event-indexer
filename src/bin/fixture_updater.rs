use std::fs;

use anyhow::Result;
use reqwest::Client;
use serde_json::{Value, json};

const HELIUS_URL: &str = "https://mainnet.helius-rpc.com/?api-key=";
const SIGNATURES_ADDRESS: &str = "4UCSDDYGdcMUjmNJSTRRAUN6ev9H8BQ9z4hNbZQ57kvb";
const TRANSACTION_SIGNATURE: &str =
    "4TXLkNSE8Rpv9VuqJ5aYUnd7JvvikoEqDB8M9oumN43n4Ma2Deyg34dkqVTuYCbVFzLwzkUPdM6nd3jNc7Fua1Sr";
const ADDITIONAL_TRANSACTION_FIXTURES: [(&str, &str); 5] = [
    (
        "tests/fixtures/helius/transactions/success_additional_1.json",
        "4NTd1BBKhVgymneSQjNpkJvb2hDZanXEYmwSFsoUFBJw1E6xSnu4WnZ6Hcq6yZWGMDTR7tqPqqsoMEGaPrBfKpD1",
    ),
    (
        "tests/fixtures/helius/transactions/success_additional_2.json",
        "5WZp7EV4wYrTGtjiU2ABiuYog6rYhZXHWErtNVkiCWkmKG2UPWUVqriwTHAftvW2sZY6v6JF3rCr7utMeZRos2yC",
    ),
    (
        "tests/fixtures/helius/transactions/success_additional_3.json",
        "512aZ8LYJbBH6uKvyLokeFMBrcuPLCDQqWFhxyRh6jvyaYnpZs4BTNPvyWDok4t8o7mNfUFXqFHWZnzchGcMTCed",
    ),
    (
        "tests/fixtures/helius/transactions/success_additional_4.json",
        "TQP1wGQQQqz1DMPzEdkEskCpwQ2RMSqoGJtV9ycQfkvtrn1tftAKcgoHE3Tz9WGHNmBfyJGUSVg5BJqkwx9nAXG",
    ),
    (
        "tests/fixtures/helius/transactions/success_additional_5.json",
        "28KsSTgMBbz2hL2fkaGMLbqYPFsHatdLeur4PM6poQZwVUPMA54xeD1whSfgeJbPmiTj9w3SW3LEQQEfz5DpAuno",
    ),
];

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    save_signatures_success_fixture().await?;
    save_signatures_generic_error_fixture().await?;
    save_transaction_success_fixture().await?;
    save_additional_transaction_success_fixtures().await?;
    save_transaction_generic_error_fixture().await?;

    Ok(())
}

fn helius_url(api: &str) -> String {
    format!("{HELIUS_URL}{api}")
}

fn write_fixture(path: &str, body: String) -> Result<()> {
    fs::write(path, body)?;
    println!("saved {path}");
    Ok(())
}

async fn send_rpc_request(client: &Client, url: &str, body: &Value) -> Result<String> {
    Ok(client.post(url).json(body).send().await?.text().await?)
}

async fn save_signatures_success_fixture() -> Result<()> {
    let api = dotenvy::var("API_KEY")?;
    let client = Client::new();
    let url = helius_url(&api);

    let body = json!({
        "jsonrpc": "2.0",
        "id": "1",
        "method": "getSignaturesForAddress",
        "params": [
            SIGNATURES_ADDRESS,
            {
                "max_supported_transaction_version": 0
            }
        ]
    });

    let response = send_rpc_request(&client, &url, &body).await?;
    write_fixture("tests/fixtures/helius/signatures/success.json", response)
}

async fn save_signatures_generic_error_fixture() -> Result<()> {
    let api = dotenvy::var("API_KEY")?;
    let client = Client::new();
    let url = helius_url(&api);

    let body = json!({
        "jsonrpc": "2.0",
        "id": "1",
        "method": "getSignaturesForAddress",
        "params": [
            123,
            {
                "before": 456,
                "limit": "bad"
            }
        ]
    });

    let response = send_rpc_request(&client, &url, &body).await?;
    write_fixture(
        "tests/fixtures/helius/signatures/rpc_error_generic.json",
        response,
    )
}

async fn save_transaction_success_fixture() -> Result<()> {
    save_transaction_success_fixture_by_signature(
        "tests/fixtures/helius/transactions/success.json",
        TRANSACTION_SIGNATURE,
    )
    .await
}

async fn save_transaction_success_fixture_by_signature(path: &str, signature: &str) -> Result<()> {
    let api = dotenvy::var("API_KEY")?;
    let client = Client::new();
    let url = helius_url(&api);

    let body = json!({
        "jsonrpc": "2.0",
        "id": "1",
        "method": "getTransaction",
        "params": [
            signature,
            {
                "encoding": "jsonParsed",
                "maxSupportedTransactionVersion": 0
            }
        ]
    });

    let response = send_rpc_request(&client, &url, &body).await?;
    write_fixture(path, response)
}

async fn save_additional_transaction_success_fixtures() -> Result<()> {
    for (path, signature) in ADDITIONAL_TRANSACTION_FIXTURES {
        save_transaction_success_fixture_by_signature(path, signature).await?;
    }

    Ok(())
}

async fn save_transaction_generic_error_fixture() -> Result<()> {
    let api = dotenvy::var("API_KEY")?;
    let client = Client::new();
    let url = helius_url(&api);

    let body = json!({
        "jsonrpc": "2.0",
        "id": "1",
        "method": "getTransaction",
        "params": [
            123,
            {
                "encoding": false,
                "maxSupportedTransactionVersion": "bad"
            }
        ]
    });

    let response = send_rpc_request(&client, &url, &body).await?;
    write_fixture(
        "tests/fixtures/helius/transactions/rpc_error_generic.json",
        response,
    )
}
