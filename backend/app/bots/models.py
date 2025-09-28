from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BotModel(Base):
    __tablename__ = "bots"

    id: Mapped[int] = mapped_column(primary_key=True)

    first_name: Mapped[str] = mapped_column(String(100))
    enabled: Mapped[bool] = mapped_column(default=False)
    username: Mapped[str] = mapped_column(String(100), unique=True)

    encrypted_token: Mapped[str] = mapped_column(String(150))
    webhook_token: Mapped[str] = mapped_column(String(150))
    
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    user: Mapped["UserModel"] = relationship(back_populates="bots")
    scenarios: Mapped[list["ScenarioModel"]] = relationship(
        back_populates="bot",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
