use reqwest::StatusCode;
use std::error::Error;
use std::fmt;
use std::fmt::{Display, Formatter};

/// Generic error which contains only a message
#[derive(Debug, Clone)]
pub struct GeneralError {
    msg: String,
}

impl GeneralError {
    pub fn from_string(msg: String) -> GeneralError {
        GeneralError { msg }
    }

    pub fn from_str(msg: &str) -> GeneralError {
        GeneralError {
            msg: msg.to_string(),
        }
    }
}

impl Display for GeneralError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.msg,)
    }
}

impl Error for GeneralError {}

/// Error encapsulating data for a failed Sleeper HTTP request. In this case failed means
/// a non-2xx error, not something like a socket error.
#[derive(Debug, Clone)]
pub struct RequestError {
    pub body: String,
    pub status: StatusCode,
    pub msg: String,
}

impl Display for RequestError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}. Status: {}, Request Body: {}",
            self.msg, self.status, self.body
        )
    }
}

impl Error for RequestError {}
