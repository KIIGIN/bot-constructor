from sqlalchemy import Enum


def enum_column(enum_cls):
    return Enum(enum_cls, values_callable=lambda x: [e.value for e in x])
