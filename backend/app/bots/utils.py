import secrets
import base64


def generate_webhook_token() -> str:
    raw_token = secrets.token_bytes(32)
    return base64.urlsafe_b64encode(raw_token).decode().rstrip("=")
