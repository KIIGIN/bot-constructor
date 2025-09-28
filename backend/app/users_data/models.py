from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, func, String, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.utils.sqlalchemy import enum_column
from app.enums import FieldType


class UserFieldModel(Base):
    __tablename__ = "user_fields"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[FieldType] = mapped_column(enum_column(FieldType))
    variable: Mapped[str] = mapped_column(String(255))
    
    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("scenarios.id", ondelete="CASCADE"),
    )
    scenario: Mapped["ScenarioModel"] = relationship(back_populates="fields")
    
    values: Mapped[list["UserFieldValueModel"]] = relationship(
        back_populates="field",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

class UserFieldValueModel(Base):
    __tablename__ = "user_field_values"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    
    user_id: Mapped[int] = mapped_column(BigInteger)
    username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    field_id: Mapped[int] = mapped_column(
        ForeignKey("user_fields.id", ondelete="CASCADE"),
    )
    field: Mapped["UserFieldModel"] = relationship(back_populates="values")
    
    value: Mapped[str] = mapped_column(String(500))
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
