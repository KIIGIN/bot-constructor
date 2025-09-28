from cryptography.fernet import Fernet

from app.core.settings import settings


class TokenCrypto:
    def __init__(self, encryption_key: str):
        self.cipher = Fernet(encryption_key)

    def encrypt(self, token: str) -> str:
        return self.cipher.encrypt(token.encode()).decode()

    def decrypt(self, encrypted_token: str) -> str:
        return self.cipher.decrypt(encrypted_token.encode()).decode()


def get_token_crypto() -> TokenCrypto:
    return TokenCrypto(settings.app.ENCRYPTION_KEY)
