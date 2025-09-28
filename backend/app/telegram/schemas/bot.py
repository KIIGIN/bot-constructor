from pydantic import BaseModel, computed_field


class BotInfo(BaseModel):
    username: str
    first_name: str
    is_bot: bool

    @computed_field
    def bot_link(self) -> str:
        return f'https://t.me/{self.username}'
    

    model_config = {
        "from_attributes": True,
    }
