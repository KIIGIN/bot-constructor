import datetime

from sqlalchemy import DateTime, func, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.enums import TriggerType
from app.core.database import Base
from app.core.utils.sqlalchemy import enum_column
from app.users_data.models import UserFieldModel


class TriggerModel(Base):
    __tablename__ = "triggers"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[TriggerType] = mapped_column(enum_column(TriggerType))
    data: Mapped[dict] = mapped_column(JSONB, default=dict)
    enabled: Mapped[bool] = mapped_column(default=False)

    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("scenarios.id", ondelete="CASCADE"),
        index=True,
    )
    scenario: Mapped["ScenarioModel"] = relationship(back_populates="triggers")


class ScenarioModel(Base):
    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(245))
    enabled: Mapped[bool] = mapped_column(default=False)

    data: Mapped[dict | None] = mapped_column(JSONB)
    draft: Mapped[dict | None] = mapped_column(JSONB, default=None)

    bot_id: Mapped[int] = mapped_column(
        ForeignKey("bots.id", ondelete="CASCADE"),
        nullable=True,
    )
    bot: Mapped["BotModel"] = relationship(
        back_populates="scenarios",
        lazy="selectin",
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    user: Mapped["UserModel"] = relationship(back_populates="scenarios")

    triggers: Mapped[list["TriggerModel"]] = relationship(
        back_populates="scenario",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    fields: Mapped[list[UserFieldModel]] = relationship(
        back_populates="scenario",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
