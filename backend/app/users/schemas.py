from pydantic import BaseModel, EmailStr


class UserReadSchema(BaseModel):
    id: int
    email: EmailStr

    model_config = {
        'from_attributes': True,
    }
