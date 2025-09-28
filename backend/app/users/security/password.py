from passlib.context import CryptContext


class PasswordManager:
    def __init__(self):
        self.crypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash_password(self, password: str) -> str:
        return self.crypt_context.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> bool:
        return self.crypt_context.verify(password, hashed_password)
