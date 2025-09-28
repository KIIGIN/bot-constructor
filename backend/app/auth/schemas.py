import re

from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, ValidationInfo, field_validator


class LoginCredentialsSchema(BaseModel):
    email: EmailStr
    password: str


class RegisterCredentialsSchema(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(min_length=8, max_length=32)]
    confirm_password: str

    @field_validator("password")
    def validate_password(cls, value: str) -> str:
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$"
        if not re.match(pattern, value):
            raise ValueError(
                "Password must contain at least 1 uppercase letter, "
                "1 lowercase letter, 1 digit, and 1 special character."
            )
        return value

    @field_validator("confirm_password")
    def validate_confirm_password(cls, value: str, info: ValidationInfo) -> str:
        password = info.data.get("password")
        if password is not None and value != password:
            raise ValueError("The passwords don't match!")
        return value
